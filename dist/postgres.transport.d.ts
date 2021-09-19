import * as TransportStream from 'winston-transport';
import { PostgresOptions } from "./postgres-options";
export declare class Postgres<T = any> extends TransportStream {
    private static readonly DEFAULT_LEVEL;
    private static readonly DEFAULT_POOL;
    private static readonly DEFAULT_SCHEMA;
    private static readonly DEFAULT_TABLE_NAME;
    private static readonly DEFAULT_TABLE_FIELDS;
    private readonly tableName;
    private readonly tableFields;
    private readonly table;
    private readonly sql;
    private readonly pool;
    constructor(options: PostgresOptions);
    log(args: any, callback: any): any;
    private hydrateColumns;
}
