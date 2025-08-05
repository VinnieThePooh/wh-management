import { Component, OnInit, output } from '@angular/core';
import { WithdrawFilter } from '../../../objects/withdrawal-filter';
import { ViewmodelStateService } from '../../../services/viewmodel-state.service';
import { WithdrawFilterState } from '../../../models/withdraw-filter-state';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import moment from 'moment';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { SelectAllDirective } from '../../../directives/select-all.directive';
import { MatButtonModule } from '@angular/material/button';
import { CacheService } from '../../../services/cache.service';

@Component({
  selector: 'app-withdraw-filter',
  imports: [
    SelectAllDirective,
    MatButtonModule,
    MatFormField,
    ReactiveFormsModule,
    MatLabel,
    MatDatepickerModule,
    MatSelectModule,
  ],
  templateUrl: './withdraw-filter.component.html',
  styleUrl: './withdraw-filter.component.css',
})
export class WithdrawFilterComponent implements OnInit {
  filterApplied = output<WithdrawFilter | null>();
  filterCleared = output<void>();
  filterState?: WithdrawFilterState;

  filterForm: FormGroup<any> = new FormGroup({
    dateBegin: new FormControl<Date | null>(null),
    dateEnd: new FormControl<Date | null>(null),
    customerIds: new FormControl<number[] | null>(null),
    documentIds: new FormControl<number[] | null>(null),
    measureUnitIds: new FormControl<number[] | null>(null),
    resourceIds: new FormControl<number[] | null>(null),
  });

  constructor(
    private cacheService: CacheService,
    private stateService: ViewmodelStateService
  ) {}

  ngOnInit(): void {
    this.filterForm.patchValue({
      dateBegin: moment().add(-1, 'M').toDate(),
      dateEnd: moment().toDate(),
    });

    this.stateService.getWithdrawalFilterState().subscribe({
      next: (res) => {
        this.filterState = res;
      },
      error: (err) => {
        // todo: notify
        console.error(err);
      },
    });
  }

  get documents() {
    return this.filterState?.documents || [];
  }

  get customers() {
    return this.filterState?.customers || [];
  }

  get resources() {
    return this.filterState?.resources || [];
  }

  get measureUnits() {
    return this.filterState?.measureUnits || [];
  }

  clearFilter() {
    this.filterForm.reset();
    this.filterCleared.emit();
  }
  onApplyFilter() {
    const filter = this.buildFilter(this.filterForm);
    this.filterApplied.emit(filter);
  }

  buildFilter(filterForm: FormGroup<any>) {
    let filter = filterForm.getRawValue() as WithdrawFilter;
    filter.documentIds = filter.documentIds?.filter((x) => !!x);
    filter.customerIds = filter.customerIds?.filter((x) => !!x);
    filter.measureUnitIds = filter.measureUnitIds?.filter((x) => !!x);
    filter.resourceIds = filter.resourceIds?.filter((x) => !!x);
    const isEmpty = Object.values(filter).every((x) => x == null || x == '');
    if (isEmpty) return null;

    return filter;
  }

  onSelectionChange($event: MatSelectChange<any>) {
    throw new Error('Method not implemented.');
  }
}
