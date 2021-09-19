import * as TransportStream from 'winston-transport';
import { PostgresOptions } from './postgres-options';
import { Pool } from 'pg';
import { Column, Sql, Table } from 'sql-ts';
import { PostgresColumnDefinition } from './postgres-column-definition';
import { Constants } from './constants';
import { DefaultTable } from './default-table';

export class PostgresTransport<T = DefaultTable> extends TransportStream {
    private readonly schema: string;
    private readonly table: Table<T>;
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

        this.table = this.sql.define({
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

        return pool.connect().then(client => client
            .query(table.insert(...columns.filter(c => c.dataType !== 'SERIAL')).toQuery())
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
