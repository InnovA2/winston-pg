export class PaginatedDataDto<T> {
    items: T[];
    size: number;
    currentPage: number;
    totalPages: number;
    totalItems: number;

    constructor(items: T[], size: number, page: number, totalItems: number) {
        this.items = items;
        this.size = +size;
        this.currentPage = +page;
        this.totalPages = Math.ceil(totalItems / size);
        this.totalItems = +totalItems;
    }
}
