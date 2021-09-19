import { builtinsTypes } from 'pg-types';
import { ColumnDefinition } from "sql-ts/dist/esm/configTypes";

export interface PostgresColumnDefinition<T> extends Omit<ColumnDefinition, 'name'> {
    name: Extract<keyof T, string>;
    dataType: builtinsTypes | 'SERIAL';
}
