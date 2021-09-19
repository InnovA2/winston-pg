import { builtinsTypes } from 'pg-types';
export interface TableField {
    name: string;
    dataType: builtinsTypes | 'SERIAL';
    primaryKey?: boolean;
    unique?: boolean;
}
