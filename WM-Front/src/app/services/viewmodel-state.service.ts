import { Injectable } from '@angular/core';
import { Observable, Subscriber, Subscription } from 'rxjs';
import { SupplementFilterState } from '../models/supplement-filter-state';
import { HttpClient } from '@angular/common/http';
import { CacheService } from './cache.service';
import { BalancesFilterState } from '../models/balances-filter-state';
import { WithdrawFilterState } from '../models/withdraw-filter-state';
import { BaseUrl } from '../app.config';

@Injectable({
  providedIn: 'root',
})
export class ViewmodelStateService {
  suppliesFilterUrl: string = BaseUrl + '/api/supplements/filter-state';
  balancesFilterUrl: string = BaseUrl + '/api/accounting/filter-state';
  withdrawFilterUrl: string = BaseUrl + '/api/withdrawals/filter-state';

  suppliesSubscription?: Subscription;
  balancesSubscription?: Subscription;

  constructor(
    private cacheService: CacheService,
    private httpClient: HttpClient
  ) {}

  getSuppliesFilterState(): Observable<SupplementFilterState> {
    return this.httpClient
      .get<SupplementFilterState>(this.suppliesFilterUrl)
      .pipe((res) => {
        if (!this.suppliesSubscription)
          this.suppliesSubscription = res.subscribe((x) => {
            this.cacheService.set_resources(x.resources);
            this.cacheService.set_measure_units(x.measureUnits);
          });
        return res;
      });
  }

  getBalancesFilterState(): Observable<BalancesFilterState> {
    return this.httpClient
      .get<BalancesFilterState>(this.balancesFilterUrl)
      .pipe((res) => {
        if (!this.balancesSubscription)
          this.balancesSubscription = res.subscribe((x) => {
            this.cacheService.set_resources(x.resources);
            this.cacheService.set_measure_units(x.measureUnits);
          });
        return res;
      });
  }

  getWithdrawalFilterState(): Observable<WithdrawFilterState> {
    return this.httpClient.get<WithdrawFilterState>(this.withdrawFilterUrl);
  }
}
