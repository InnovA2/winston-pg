"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresTransport = void 0;
const TransportStream = require("winston-transport");
const pg_1 = require("pg");
const sql_ts_1 = require("sql-ts");
const constants_1 = require("./constants");
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
