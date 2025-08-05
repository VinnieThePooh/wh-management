import { Injectable } from '@angular/core';
import { ISelectListItem } from '../objects/select-list-item';
import { HttpClient } from '@angular/common/http';
import { BalancesFilterState } from '../models/balances-filter-state';
import { appConfig, BaseUrl } from '../app.config';

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  private balancesFilterUrl = BaseUrl + '/api/accounting/filter-state';

  constructor(private httpClient: HttpClient) {}

  public UnitsMap: MapObject = {};
  public ResourcesMap: MapObject = {};

  private res: ISelectListItem[] = [];
  private m_units: ISelectListItem[] = [];
  private _customers: ISelectListItem[] = [];

  updateCache() {
    this.httpClient
      .get<BalancesFilterState>(this.balancesFilterUrl)
      .subscribe((x) => {
        this.set_resources(x.resources);
        this.set_measure_units(x.measureUnits);
      });
  }

  get_unit_name(id: number) {
    return this.m_units.find((x) => x.id == id)?.name;
  }

  get_resource_name(id: number) {
    return this.res.find((x) => x.id == id)?.name;
  }

  set_resources(res: ISelectListItem[]) {
    this.res = res;
    res.map((x) => {
      this.ResourcesMap[x.id] = x.name;
    });
  }

  setCustomers(customers: ISelectListItem[]) {
    this._customers = customers;
  }

  get customers() {
    return this._customers;
  }

  set_measure_units(res: ISelectListItem[]) {
    this.m_units = res;
    res.map((x) => {
      this.UnitsMap[x.id] = x.name;
    });
  }

  get resources(): ISelectListItem[] {
    if (this.res) return this.res;
    return [];
  }

  get measure_units(): ISelectListItem[] | null {
    if (this.m_units) return this.m_units;
    return [];
  }
}
