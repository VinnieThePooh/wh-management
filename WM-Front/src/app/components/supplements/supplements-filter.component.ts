import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { SupplyFilter } from '../../objects/supply-filter';
import {
  MatDatepickerModule,
  MatDatepickerToggle,
  MatDateRangePicker,
} from '@angular/material/datepicker';
import {
  MatFormField,
  MatFormFieldModule,
  MatHint,
  MatLabel,
} from '@angular/material/form-field';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import {
  MatSelect,
  MatSelectChange,
  MatSelectModule,
} from '@angular/material/select';
import { ViewmodelStateService } from '../../services/viewmodel-state.service';
import { SupplementFilterState } from '../../models/supplement-filter-state';
import { SelectAllDirective } from '../../directives/select-all.directive';
import { CommonModule } from '@angular/common';
import { MatButton } from '@angular/material/button';
import moment from 'moment';
import { MatRadioModule } from '@angular/material/radio';
import { TimeSpan } from '../../models/date-range';
import { MatPaginator } from '@angular/material/paginator';
import { CacheService } from '../../services/cache.service';

@Component({
  selector: 'app-supplemments-filter',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatRadioModule,
    MatDatepickerModule,
    MatDateRangePicker,
    MatFormField,
    MatButton,
    MatInputModule,
    MatLabel,
    ReactiveFormsModule,
    FormsModule,
    MatHint,
    MatOptionModule,
    MatDatepickerToggle,
    SelectAllDirective,
  ],
  templateUrl: './supplements-filter.component.html',
  styleUrl: './supplements-filter.component.css',
})
export class SupplemmentsFilterComponent implements OnInit {
  defaultPeriods: any;
  defaultTimeSpan?: TimeSpan;
  filterState?: SupplementFilterState;

  @Output() filterApplied = new EventEmitter<SupplyFilter | null>();
  @Output() filterCleared = new EventEmitter();

  filterForm: FormGroup<any> = new FormGroup({
    measureUnitIds: new FormControl<number[] | null>(null),
    resourceIds: new FormControl<number[] | null>(null),
    docIds: new FormControl<number[] | null>(null),
    range: new FormGroup({
      dateStart: new FormControl<Date | null>(null),
      dateEnd: new FormControl<Date | null>(null),
    }),
  });

  constructor(
    private stateService: ViewmodelStateService,
    private cacheService: CacheService
  ) {}

  ngOnInit(): void {
    this.defaultTimeSpan = {
      dateStart: moment().add(-1, 'M').toDate(),
      dateEnd: moment().toDate(),
    } as TimeSpan;

    this.filterForm.patchValue({ range: this.defaultTimeSpan });

    this.stateService.getSuppliesFilterState().subscribe({
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

  get resources() {
    if (!this.filterState) return [];
    return this.filterState.resources;
  }

  get measureUnits() {
    if (!this.filterState) return [];
    return this.filterState.measureUnits;
  }

  get documentIds() {
    if (!this.filterState) return [];
    return this.filterState.documents;
  }

  onApplyFilter(): void {
    const filter = this.buildFilter(this.filterForm);
    this.filterApplied.emit(filter);
  }

  buildFilter(form: FormGroup): SupplyFilter | null {
    let filter = new SupplyFilter();

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

    let docs = form.get('docIds')?.value as number[];
    if (!docs || !docs.length) filter.documentIds = null;
    else {
      filter.documentIds = docs.filter((v) => v != -1);
    }

    let start = form.get('range.dateStart')!.value as Date | null;
    let end = form.get('range.dateEnd')!.value as Date | null;
    filter.dateBegin = start;
    filter.dateEnd = end;

    const isEmpty = Object.values(filter).every((x) => x == null || x == '');
    if (isEmpty) return null;

    return filter;
  }

  clearFilter() {
    this.filterForm.reset();
    this.filterCleared.emit();
  }

  selectAll(select: MatSelect) {
    console.log(select.value);
  }

  toggleSelection(select: MatSelect) {
    const checked = select.options.find((x) => +x.value === -1);
    if (checked && checked.selected) console.log('Toggled: ' + checked);
    console.log('Type of values: ' + typeof checked);
    // console.log(select.value);
  }

  onSelectionChange(event: MatSelectChange<number>) {
    // console.log('event.value: ' + event.value);
  }
}
