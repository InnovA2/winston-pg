export declare class PaginatedDataDto<T> {
    items: T[];
    size: number;
    currentPage: number;
    totalPages: number;
    totalItems: number;
    constructor(items: T[], size: number, limit: number, page: number, totalItems: number);
}
