import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, output, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { SupplementFilterState } from '../../../models/supplement-filter-state';
import { BalanceFilter } from '../../../objects/balance-filter';
import { SelectAllDirective } from '../../../directives/select-all.directive';
import { CacheService } from '../../../services/cache.service';
import { MatButtonModule } from '@angular/material/button';
import { ViewmodelStateService } from '../../../services/viewmodel-state.service';
import { MatPaginatorModule } from '@angular/material/paginator';
import { BalancesFilterState } from '../../../models/balances-filter-state';

@Component({
  selector: 'app-balances-filter',
  imports: [
    CommonModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatSelectModule,
    SelectAllDirective,
    MatPaginatorModule,
  ],
  templateUrl: './balances-filter.component.html',
  styleUrl: './balances-filter.component.css',
})
export class BalancesFilterComponent implements OnInit {
  filterState?: BalancesFilterState;
  filterForm: FormGroup<any> = new FormGroup({
    measureUnitIds: new FormControl<number[] | null>(null),
    resourceIds: new FormControl<number[] | null>(null),
  });

  constructor(
    private stateService: ViewmodelStateService,
    private cacheService: CacheService
  ) {}

  ngOnInit(): void {
    // todo: caching
    this.stateService.getBalancesFilterState().subscribe({
      next: (res) => {
        this.filterState = res;
        this.cacheService.set_resources(res.resources);
        this.cacheService.set_measure_units(res.measureUnits);
      },
      error: (err) => {
        // todo: notify
        console.error(err);
      },
    });
  }

  filterApplied = output<BalanceFilter | null>();
  filterCleared = output<void>();

  buildFilter(form: FormGroup): BalanceFilter | null {
    let filter = new BalanceFilter();

    let units = form.get('measureUnitIds')?.value as number[];
    if (!units || !units.length) filter.measureUnitIds = null;
    else {
      filter.measureUnitIds = units.filter((v) => v != -1);
    }

    let res = form.get('resourceIds')?.value as number[];
    if (!res || !res.length) filter.resourceIds = null;
    else {
      filter.resourceIds = res.filter((v) => v != -1);
    }

    const isEmpty = Object.values(filter).every((x) => x == null || x == '');
    if (isEmpty) return null;

    return filter;
  }

  get resources() {
    if (!this.filterState) return [];
    return this.filterState.resources;
  }

  get measureUnits() {
    if (!this.filterState) return [];
    return this.filterState.measureUnits;
  }

  clearFilter() {
    this.filterForm.reset();
    this.filterCleared.emit();
  }

  onApplyFilter() {
    const filter = this.buildFilter(this.filterForm);
    this.filterApplied.emit(filter);
  }
}
