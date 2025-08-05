import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginationModel } from '../models/pagination-model';
import { IArchivedResource, IWorkingResource } from '../objects/resources';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Defaults } from '../models/constants';
import { CreateResult } from '../models/create-result';
import { BaseUrl } from '../app.config';

//todo: add error handling
@Injectable({
  providedIn: 'root',
})
export class ResourcesService {
  targetUrl: string = BaseUrl + '/api/resources';

  constructor(private httpClient: HttpClient) {}

  getWorking(
    pageNumber?: number,
    pageSize?: number
  ): Observable<PaginationModel<IWorkingResource>> {
    let url = this.targetUrl + '/working';

    let parameters = new HttpParams()
      .append('pageNumber', pageNumber ?? Defaults.PAGE_NUMBER)
      .append('pageSize', pageSize ?? Defaults.PAGE_SIZE);
    return this.httpClient.get<PaginationModel<IWorkingResource>>(url, {
      params: parameters,
    });
  }

  getArchived(
    pageNumber?: number,
    pageSize?: number
  ): Observable<PaginationModel<IArchivedResource>> {
    let url = this.targetUrl + '/archived';

    let parameters = new HttpParams()
      .append('pageNumber', pageNumber ?? Defaults.PAGE_NUMBER)
      .append('pageSize', pageSize ?? Defaults.PAGE_SIZE);
    return this.httpClient.get<PaginationModel<IArchivedResource>>(url, {
      params: parameters,
    });
  }

  addNewResource(
    name: string | null,
    archived: boolean = false
  ): Observable<CreateResult> {
    return this.httpClient.post<CreateResult>(this.targetUrl, {
      name: name,
      archived: archived,
    });

    // this is somewhat good practice to bypass through catchError
    // .pipe(
    // catchError(this.handleError('addHero', hero))
    // );
  }

  deleteResource(id: number): Observable<object> {
    let url = this.targetUrl + '/' + id;
    return this.httpClient.delete(url);
  }

  isResourceTaken(name: string, id?: number | null): Observable<boolean> {
    let url = this.targetUrl + '/is-resource-taken/' + name;
    if (id == null) return this.httpClient.get<boolean>(url);

    let queryParams = new HttpParams().append('id', id);
    return this.httpClient.get<boolean>(url, { params: queryParams });
  }

  editResource(resource: IWorkingResource): Observable<object> {
    return this.httpClient.put<object>(this.targetUrl, resource);
  }

  set_archived_state(
    resource: IWorkingResource,
    archived: boolean
  ): Observable<object> {
    const url = this.targetUrl + '/set-archived-state/' + resource.id;
    return this.httpClient.put<object>(url, { state: archived });
  }

  // private handleError(methodName: string, body: any) {

  //   // log and throw
  //     rethrow

  // }
}
