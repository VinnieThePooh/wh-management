import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Defaults } from '../models/constants';
import { PaginationModel } from '../models/pagination-model';
import { IArchivedResource } from '../objects/resources';
import { CacheService } from './cache.service';
import {
  BalanceListItem,
  BalanceListItemApi,
} from '../objects/balance-list-item';
import { BalanceFilter } from '../objects/balance-filter';
import { BaseUrl } from '../app.config';

@Injectable({
  providedIn: 'root',
})
export class BalanceService {
  targetUrl: string = BaseUrl + '/api/accounting';

  constructor(
    private cacheService: CacheService,
    private httpClient: HttpClient
  ) {}

  getBalances(
    pageNumber?: number,
    pageSize?: number,
    filter?: BalanceFilter | null
  ): Observable<PaginationModel<BalanceListItem>> {
    let parameters = new HttpParams()
      .append('pageNumber', pageNumber ?? Defaults.PAGE_NUMBER)
      .append('pageSize', pageSize ?? Defaults.PAGE_SIZE);

    return this.httpClient
      .post<PaginationModel<BalanceListItemApi>>(this.targetUrl, filter, {
        params: parameters,
      })
      .pipe(
        map((x) => {
          x.pageData = x.pageData.map((e) => {
            return {
              balanceId: e.balanceId,
              resourceId: e.resourceId,
              measureUnitId: e.measureUnitId,
              quantity: e.quantity,
              unitName: this.cacheService.UnitsMap[e.measureUnitId],
              resourceName: this.cacheService.ResourcesMap[e.resourceId],
            } as BalanceListItem;
          });
          return <PaginationModel<BalanceListItem>>x;
        })
      );
  }
}
