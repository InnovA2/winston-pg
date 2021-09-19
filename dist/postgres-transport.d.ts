import * as TransportStream from 'winston-transport';
import { PostgresOptions } from './postgres-options';
import { DefaultTable } from './default-table';
export declare class PostgresTransport<T = DefaultTable> extends TransportStream {
    private readonly schema;
    private readonly table;
    private readonly tableName;
    private readonly tableColumns;
    private readonly sql;
    private readonly pool;
    constructor(options: PostgresOptions<T>);
    log(args: any, callback: any): any;
    private hydrateColumns;
}
