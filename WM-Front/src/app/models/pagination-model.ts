export interface PaginationModel<T> {
    pageSize:number;
    pageNumber:number;
    pageData:T[];
    pageCount:number;
    totalCount:number;
}