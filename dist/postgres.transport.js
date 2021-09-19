"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Postgres = void 0;
const TransportStream = require("winston-transport");
const pg_1 = require("pg");
const sql_ts_1 = require("sql-ts");
class Postgres extends TransportStream {
    constructor(options) {
        if (!options.connectionString) {
            throw new Error("Postgres transport requires \"connectionString\".");
        }
        super(options);
        this.level = options.level || Postgres.DEFAULT_LEVEL;
        this.silent = options.silent || false;
        this.tableName = options.tableName || Postgres.DEFAULT_TABLE_NAME;
        this.tableColumns = options.tableFields || Postgres.DEFAULT_TABLE_FIELDS;
        this.sql = new sql_ts_1.Sql('postgres');
        this.table = this.sql.define({
            name: this.tableName,
            columns: this.tableFields,
        });
        this.pool = new pg_1.Pool({
            connectionString: options.connectionString,
            max: options.maxPool || Postgres.DEFAULT_POOL,
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
exports.Postgres = Postgres;
Postgres.DEFAULT_LEVEL = 'info';
Postgres.DEFAULT_POOL = 10;
Postgres.DEFAULT_SCHEMA = 'public';
Postgres.DEFAULT_TABLE_NAME = 'winston_logs';
Postgres.DEFAULT_TABLE_FIELDS = [
    {
        name: 'id',
        dataType: 'SERIAL',
        primaryKey: true,
        unique: true,
    },
    {
        name: 'level',
        dataType: 'VARCHAR'
    },
    {
        name: 'timestamp',
        dataType: 'TIMESTAMPTZ'
    },
    {
        name: 'context',
        dataType: 'VARCHAR'
    },
    {
        name: 'message',
        dataType: 'VARCHAR'
    },
    {
        name: 'stack',
        dataType: 'JSON'
    }
];
