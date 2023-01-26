import { PostgresColumnDefinition } from './postgres-column-definition';
import { DefaultTable } from './default-table';
export declare class PostgresConstants {
    static readonly DIALECT = "postgres";
    static readonly DEFAULT_LEVEL = "info";
    static readonly DEFAULT_POOL = 10;
    static readonly DEFAULT_SCHEMA = "public";
    static readonly DEFAULT_TABLE_NAME = "winston_logs";
    static readonly DEFAULT_TABLE_COLUMNS: PostgresColumnDefinition<DefaultTable | any>[];
}
