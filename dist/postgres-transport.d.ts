import * as TransportStream from 'winston-transport';
import { PostgresOptions } from './postgres-options';
import { DefaultTable } from './default-table';
import { QueryOptions } from "./query-options";
import { PaginatedDataDto } from "./paginated-data.dto";
export declare class PostgresTransport<T = DefaultTable> extends TransportStream {
    private readonly schema;
    private readonly table;
    private readonly tableName;
    private readonly tableColumns;
    private readonly sql;
    private readonly pool;
    constructor(options: PostgresOptions<T>);
    log(args: any, callback: any): any;
    query(options: QueryOptions<T>): Promise<T[] | PaginatedDataDto<T>>;
    private hydrateColumns;
}
