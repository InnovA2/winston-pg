"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresConstants = void 0;
class PostgresConstants {
}
exports.PostgresConstants = PostgresConstants;
PostgresConstants.DIALECT = 'postgres';
PostgresConstants.DEFAULT_LEVEL = 'info';
PostgresConstants.DEFAULT_POOL = 10;
PostgresConstants.DEFAULT_SCHEMA = 'public';
PostgresConstants.DEFAULT_TABLE_NAME = 'winston_logs';
PostgresConstants.DEFAULT_TABLE_COLUMNS = [
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
        dataType: 'TIMESTAMP'
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
