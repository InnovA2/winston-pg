"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresTransport = void 0;
const TransportStream = require("winston-transport");
const pg_1 = require("pg");
const sql_ts_1 = require("sql-ts");
const constants_1 = require("./constants");
const paginated_data_dto_1 = require("./paginated-data.dto");
class PostgresTransport extends TransportStream {
    constructor(options) {
        if (!options.connectionString) {
            throw new Error("Postgres transport requires \"connectionString\".");
        }
        super(options);
        this.level = options.level || constants_1.Constants.DEFAULT_LEVEL;
        this.silent = options.silent || false;
        this.schema = options.schema || constants_1.Constants.DEFAULT_SCHEMA;
        this.tableName = options.tableName || constants_1.Constants.DEFAULT_TABLE_NAME;
        this.tableColumns = options.tableColumns || constants_1.Constants.DEFAULT_TABLE_COLUMNS;
        this.sql = new sql_ts_1.Sql(constants_1.Constants.DIALECT);
        this.table = this.sql.define({
            name: this.tableName,
            schema: this.schema,
            columns: this.tableColumns,
        });
        this.pool = new pg_1.Pool({
            connectionString: options.connectionString,
            max: options.maxPool || constants_1.Constants.DEFAULT_POOL,
            ssl: options.ssl || false,
        });
        this.pool.connect()
            .then(client => client
            .query(this.table.create().ifNotExists().toQuery())
            .then(() => client.release())
            .catch((e) => {
            client.release();
            throw e.stack;
        }));
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
    query(options) {
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
            });
            query = query.where(where);
            countQuery = countQuery.where(where);
        }
        if (options.order) {
            const order = options.order.map(([key, value]) => {
                return table[key][value.toLowerCase()]();
            });
            query = query.order(order);
        }
        if (options.limit) {
            const offset = options.page ? (options.limit * options.page) : 0;
            query = query.offset(offset).limit(options.limit);
        }
        return new Promise((resolve, reject) => {
            pool.connect().then(client => client
                .query(query.toQuery())
                .then((result) => __awaiter(this, void 0, void 0, function* () {
                client.release();
                if (options.limit) {
                    const count = yield client.query(countQuery.toQuery());
                    const page = new paginated_data_dto_1.PaginatedDataDto(result.rows, result.rowCount, options.limit, options.page, count.rows.length > 0 ? count.rows[0].total : 0);
                    return resolve(page);
                }
                return resolve(result.rows);
            }))
                .catch((e) => {
                client.release();
                reject(e.stack);
            }));
        });
    }
    hydrateColumns(args, columns) {
        return columns.map((column) => {
            if (column.dataType === 'JSON') {
                return column.value(JSON.stringify(args[column.name]));
            }
            else if (['TIMESTAMP', 'TIMESTAMPTZ'].includes(column.dataType)) {
                return column.value('NOW()');
            }
            return column.value(args[column.name]);
        });
    }
}
exports.PostgresTransport = PostgresTransport;
