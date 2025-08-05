import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WithdrawFilter } from '../objects/withdrawal-filter';
import {
  WithdrawalListItem,
  WithdrawalListItemRequest,
} from '../objects/withdrawals';
import { Observable } from 'rxjs';
import { Defaults } from '../models/constants';
import { PaginationModel } from '../models/pagination-model';
import { CreateResult } from '../models/create-result';
import { BaseUrl } from '../app.config';

@Injectable({
  providedIn: 'root',
})
export class WithdrawService {
  targetUrl = BaseUrl + '/api/withdrawals';

  constructor(private httpClient: HttpClient) {}

  getWithdraws(
    pageNumber?: number,
    pageSize?: number,
    filter?: WithdrawFilter | null
  ): Observable<PaginationModel<WithdrawalListItem>> {
    let parameters = new HttpParams()
      .append('pageNumber', pageNumber ?? Defaults.PAGE_NUMBER)
      .append('pageSize', pageSize ?? Defaults.PAGE_SIZE);
    return this.httpClient.post<PaginationModel<WithdrawalListItem>>(
      this.targetUrl,
      filter,
      {
        params: parameters,
      }
    );
  }

  createWithdraw(entity: WithdrawalListItemRequest): Observable<CreateResult> {
    return this.httpClient.post<CreateResult>(this.targetUrl + '/add', entity);
  }
}
