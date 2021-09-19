import { PostgresColumnDefinition } from './postgres-column-definition';
import { DefaultTable } from './default-table';

export class Constants {
    static readonly DIALECT = 'postgres';

    static readonly DEFAULT_LEVEL = 'info';
    static readonly DEFAULT_POOL = 10;
    static readonly DEFAULT_SCHEMA = 'public';
    static readonly DEFAULT_TABLE_NAME = 'winston_logs';
    static readonly DEFAULT_TABLE_COLUMNS: PostgresColumnDefinition<DefaultTable | any>[] = [
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
}
