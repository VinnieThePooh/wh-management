import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginationModel } from '../models/pagination-model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Defaults } from '../models/constants';
import { IArchivedMeasureUnit } from '../objects/measure-units';
import { SupplyFilter } from '../objects/supply-filter';
import {
  SupplementListItem,
  SupplementListItemRequest,
} from '../objects/supplements';
import { CreateResult } from '../models/create-result';
import { BaseUrl } from '../app.config';

@Injectable({
  providedIn: 'root',
})
export class SupplyService {
  targetUrl: string = BaseUrl + '/api/supplements';
  constructor(private httpClient: HttpClient) {}

  getSupplements(
    pageNumber?: number,
    pageSize?: number,
    filter?: SupplyFilter | null
  ): Observable<PaginationModel<SupplementListItem>> {
    let parameters = new HttpParams()
      .append('pageNumber', pageNumber ?? Defaults.PAGE_NUMBER)
      .append('pageSize', pageSize ?? Defaults.PAGE_SIZE);
    return this.httpClient.post<PaginationModel<SupplementListItem>>(
      this.targetUrl,
      filter,
      {
        params: parameters,
      }
    );
  }

  createSupplement(
    entity: SupplementListItemRequest
  ): Observable<CreateResult> {
    return this.httpClient.post<CreateResult>(this.targetUrl + '/add', entity);
  }

  updateSupplement(entity: SupplementListItemRequest): Observable<object> {
    return this.httpClient.put<object>(this.targetUrl, entity);
  }

  isDocumentNameTaken(
    name: string,
    documentId?: number | null
  ): Observable<boolean> {
    const url = this.targetUrl + '/is-name-taken/' + name;

    let params: HttpParams = null;

    if (documentId) params = new HttpParams().append('id', documentId);

    return this.httpClient.get<boolean>(url, { params });
  }

  deleteDocument(documentId: number): Observable<object> {
    return this.httpClient.delete(this.targetUrl + '/' + documentId);
  }
}
