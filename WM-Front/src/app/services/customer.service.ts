import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginationModel } from '../models/pagination-model';
import { CustomerListItem } from '../objects/customers';
import { Defaults } from '../models/constants';
import { CreateResult } from '../models/create-result';
import { BaseUrl } from '../app.config';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  targetUrl: string = BaseUrl + '/api/customers';

  constructor(private httpClient: HttpClient) {}

  getWorking(
    pageNumber?: number,
    pageSize?: number
  ): Observable<PaginationModel<CustomerListItem>> {
    let url = this.targetUrl + '/working';

    let parameters = new HttpParams()
      .append('pageNumber', pageNumber ?? Defaults.PAGE_NUMBER)
      .append('pageSize', pageSize ?? Defaults.PAGE_SIZE);
    return this.httpClient.get<PaginationModel<CustomerListItem>>(url, {
      params: parameters,
    });
  }

  getArchived(
    pageNumber?: number,
    pageSize?: number
  ): Observable<PaginationModel<CustomerListItem>> {
    let url = this.targetUrl + '/archived';

    let parameters = new HttpParams()
      .append('pageNumber', pageNumber ?? Defaults.PAGE_NUMBER)
      .append('pageSize', pageSize ?? Defaults.PAGE_SIZE);
    return this.httpClient.get<PaginationModel<CustomerListItem>>(url, {
      params: parameters,
    });
  }

  addNewCustomer(customer: CustomerListItem): Observable<CreateResult> {
    return this.httpClient.post<CreateResult>(this.targetUrl, customer);
  }

  deleteCustomer(id: number): Observable<object> {
    let url = this.targetUrl + '/' + id;
    return this.httpClient.delete(url);
  }

  isNameTaken(name: string, id?: number | null): Observable<boolean> {
    let url = this.targetUrl + '/is-resource-taken/' + name;
    if (id == null) return this.httpClient.get<boolean>(url);

    let queryParams = new HttpParams().append('id', id);
    return this.httpClient.get<boolean>(url, { params: queryParams });
  }

  editCustomer(resource: CustomerListItem): Observable<object> {
    return this.httpClient.put<object>(this.targetUrl, resource);
  }

  set_archived_state(
    customer: CustomerListItem,
    archived: boolean
  ): Observable<object> {
    const url = this.targetUrl + '/set-archived-state/' + customer.id;
    return this.httpClient.put<object>(url, { state: archived });
  }
}
