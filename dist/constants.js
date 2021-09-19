"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Constants = void 0;
class Constants {
}
exports.Constants = Constants;
Constants.DIALECT = 'postgres';
Constants.DEFAULT_LEVEL = 'info';
Constants.DEFAULT_POOL = 10;
Constants.DEFAULT_SCHEMA = 'public';
Constants.DEFAULT_TABLE_NAME = 'winston_logs';
Constants.DEFAULT_TABLE_COLUMNS = [
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
