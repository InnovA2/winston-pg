declare namespace Comparison {
    type EqualsOperator = 'equals' | 'notEquals';
    type TextOperator = 'like' | 'notLike' | 'ilike' | 'notIlike' | 'rlike';
    type CalcOperator = 'gt' | 'gte' | 'lt' | 'lte';
    type BetweenOperator = 'between' | 'notBetween';
    type Options<T> = {
        field: keyof T;
    } & ({
        operator: EqualsOperator;
        value: string | number | boolean;
    } | {
        operator: TextOperator;
        value: string;
    } | {
        operator: CalcOperator;
        value: string | number;
    } | {
        operator: BetweenOperator;
        value: [string, string];
    });
}
declare namespace Order {
    type Value = 'ASC' | 'DESC';
    type Options<T> = [keyof T, Value];
}
export interface QueryOptions<T> {
    /**
     * List of fields to retrieve
     */
    fields?: (keyof T)[];
    /**
     * Filter with many comparison's operators
     */
    where?: Comparison.Options<T>[];
    /**
     * Order by field and ascending or descending
     */
    order?: Order.Options<T>[];
    /**
     * Limit of items to retrieve
     */
    limit?: number;
    /**
     * Number of the page to retrieve items when limit is filled
     */
    page?: number;
}
export {};
