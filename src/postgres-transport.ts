import * as TransportStream from 'winston-transport';
import {PostgresOptions} from './postgres-options';
import {Pool} from 'pg';
import {Column, Sql, TableWithColumns} from 'sql-ts';
import {PostgresColumnDefinition} from './postgres-column-definition';
import {Constants} from './constants';
import {DefaultTable} from './default-table';
import {QueryOptions} from "./query-options";
import {PaginatedDataDto} from "./paginated-data.dto";

export class PostgresTransport<T = DefaultTable> extends TransportStream {
    private readonly schema: string;
    private readonly table: TableWithColumns<T>;
    private readonly tableName: string;
    private readonly tableColumns: PostgresColumnDefinition<T>[];

    private readonly sql: Sql;
    private readonly pool: Pool;

    constructor(options: PostgresOptions<T>) {
        if (!options.connectionString) {
            throw new Error("Postgres transport requires \"connectionString\".");
        }

        super(options);

        this.level = options.level || Constants.DEFAULT_LEVEL;
        this.silent = options.silent || false;
        this.schema = options.schema || Constants.DEFAULT_SCHEMA;
        this.tableName = options.tableName || Constants.DEFAULT_TABLE_NAME;
        this.tableColumns = options.tableColumns || Constants.DEFAULT_TABLE_COLUMNS;

        this.sql = new Sql(Constants.DIALECT);

        this.table = this.sql.define<T>({
            name: this.tableName,
            schema: this.schema,
            columns: this.tableColumns,
        });

        this.pool = new Pool({
            connectionString: options.connectionString,
            max: options.maxPool || Constants.DEFAULT_POOL,
            ssl: options.ssl || false,
        });

        this.pool.connect()
            .then(client => client
                .query(this.table.create().ifNotExists().toQuery())
                .then(() => client.release())
                .catch((e) => {
                    client.release();
                    throw e.stack;
                })
            );
    }

    log(args, callback) {
        const { silent, pool, table } = this;

        if (silent) {
            return callback(null, true);
        }

        const columns = this.hydrateColumns(args, table.columns);
        const query = table.insert(...columns.filter(c => c.dataType !== 'SERIAL')).toQuery();

        return pool.connect().then(client => client
            .query(query)
            .then(() => {
                client.release();
                this.emit('logged', args);
                return callback(null, true);
            })
            .catch((e) => {
                client.release();
                this.emit('error', e.stack);
                return callback(e.stack);
            }));
    }

    query(options: QueryOptions<T>): Promise<T[] | PaginatedDataDto<T>> {
        const { pool, table } = this;

        const fields = options.fields || this.tableColumns.map(c => c.name);

        let query = table.select(fields);
        let countQuery = table.select(table.count('total'));

        if (options.where) {
            const where = options.where.map((opt) => {
                if (opt.operator === 'between' || opt.operator === 'notBetween') {
                    return table[opt.field][opt.operator](opt.value[0], opt.value[1]);
                }
                return table[opt.field][opt.operator](opt.value);
            })

            query = query.where(where);
            countQuery = countQuery.where(where);
        }

        if (options.order) {
            const order = options.order.map(([key, value]) => {
                return table[key][value.toLowerCase()]()
            })

            query = query.order(order);
        }

        if (options.limit) {
            const offset = options.page ? (options.limit * options.page) : 0;

            query = query.offset(offset).limit(options.limit);
        }

        return new Promise((resolve, reject) => {
            pool.connect().then(client => client
                .query(query.toQuery())
                .then(async (result) => {
                    client.release();

                    if (options.limit) {
                        const count = await client.query(countQuery.toQuery());

                        const page = new PaginatedDataDto<T>(
                            result.rows,
                            result.rowCount,
                            options.limit,
                            options.page,
                            count.rows.length > 0 ? count.rows[0].total : 0
                        );

                        return resolve(page);
                    }

                    return resolve(result.rows);
                })
                .catch((e) => {
                    client.release();
                    reject(e.stack);
                }));
        });
    }

    private hydrateColumns(args: any, columns: Column<T>[]): Column<T>[] {
        return columns.map((column) => {
            if (column.dataType === 'JSON') {
                return column.value(JSON.stringify(args[column.name]));
            } else if (['TIMESTAMP', 'TIMESTAMPTZ'].includes(column.dataType)) {
                return column.value('NOW()');
            }

            return column.value(args[column.name]);
        })
    }
}
