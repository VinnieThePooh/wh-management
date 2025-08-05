import { Injectable } from '@angular/core';
import { PaginationModel } from '../models/pagination-model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Defaults } from '../models/constants';
import { BaseUrl } from '../app.config';
import { CreateResult } from '../models/create-result';
import { Observable } from 'rxjs';
import {
  IArchivedMeasureUnit,
  IWorkingMeasureUnit,
} from '../objects/measure-units';

@Injectable({
  providedIn: 'root',
})
export class MeasureUnitsService {
  targetUrl: string = BaseUrl + '/api/measure-units';

  constructor(private httpClient: HttpClient) {}

  getWorking(
    pageNumber?: number,
    pageSize?: number
  ): Observable<PaginationModel<IWorkingMeasureUnit>> {
    let url = this.targetUrl + '/working';

    let parameters = new HttpParams()
      .append('pageNumber', pageNumber ?? Defaults.PAGE_NUMBER)
      .append('pageSize', pageSize ?? Defaults.PAGE_SIZE);
    return this.httpClient.get<PaginationModel<IWorkingMeasureUnit>>(url, {
      params: parameters,
    });
  }

  getArchived(
    pageNumber?: number,
    pageSize?: number
  ): Observable<PaginationModel<IArchivedMeasureUnit>> {
    let url = this.targetUrl + '/archived';

    let parameters = new HttpParams()
      .append('pageNumber', pageNumber ?? Defaults.PAGE_NUMBER)
      .append('pageSize', pageSize ?? Defaults.PAGE_SIZE);
    return this.httpClient.get<PaginationModel<IArchivedMeasureUnit>>(url, {
      params: parameters,
    });
  }

  addNewUnit(
    name: string | null,
    archived: boolean = false
  ): Observable<CreateResult> {
    return this.httpClient.post<CreateResult>(this.targetUrl, {
      name: name,
      archived: archived,
    });
  }

  deleteUnit(id: number): Observable<object> {
    let url = this.targetUrl + '/' + id;
    return this.httpClient.delete(url);
  }

  isUnitTaken(name: string, id?: number | null): Observable<boolean> {
    let url = this.targetUrl + '/is-unit-taken/' + name;
    if (id == null) return this.httpClient.get<boolean>(url);

    let queryParams = new HttpParams().append('id', id);
    return this.httpClient.get<boolean>(url, { params: queryParams });
  }

  editResource(resource: IWorkingMeasureUnit): Observable<object> {
    return this.httpClient.put<object>(this.targetUrl, resource);
  }

  set_archived_state(
    unit: IWorkingMeasureUnit,
    archived: boolean
  ): Observable<object> {
    const url = this.targetUrl + '/set-archived-state/' + unit.id;
    return this.httpClient.put<object>(url, { state: archived });
  }
}
