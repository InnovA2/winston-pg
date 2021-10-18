"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginatedDataDto = void 0;
class PaginatedDataDto {
    constructor(items, size, page, totalItems) {
        this.items = items;
        this.size = +size;
        this.currentPage = +page;
        this.totalPages = Math.ceil(totalItems / size);
        this.totalItems = +totalItems;
    }
}
exports.PaginatedDataDto = PaginatedDataDto;
