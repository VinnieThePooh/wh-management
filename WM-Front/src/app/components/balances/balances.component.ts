import {
  Component,
  OnInit,
  Signal,
  ViewChild,
  WritableSignal,
  signal,
} from '@angular/core';
import { BalancesFilterComponent } from './balances-filter/balances-filter.component';
import { BalanceFilter } from '../../objects/balance-filter';
import {
  MatTable,
  MatTableDataSource,
  MatTableModule,
} from '@angular/material/table';
import { BalanceListItem } from '../../objects/balance-list-item';
import { PaginationModel } from '../../models/pagination-model';
import { IArchivedMeasureUnit } from '../../objects/measure-units';
import { BalanceService } from '../../services/balance.service';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Defaults } from '../../models/constants';
import { CacheService } from '../../services/cache.service';

@Component({
  selector: 'app-balances',
  imports: [BalancesFilterComponent, MatTableModule, MatPaginatorModule],
  templateUrl: './balances.component.html',
  styleUrl: './balances.component.css',
})
export class BalancesComponent implements OnInit {
  constructor(
    private cacheService: CacheService,
    private balanceService: BalanceService
  ) {}

  filter: BalanceFilter | null = null;
  loading = signal<boolean>(false);
  loading_error = signal<string>(null);
  pagination_loading = signal<boolean>(false);
  hasData = signal(false);
  paginationModel?: PaginationModel<BalanceListItem> | null;
  displayedColumns: string[] = ['resource', 'unit', 'quantity'];
  dataLength?: number | null;
  dataSource = new MatTableDataSource<BalanceListItem>([]);
  @ViewChild(MatTable) table!: MatTable<IArchivedMeasureUnit>;

  onFilterCleared() {
    this.filter = null;
    this.updateDataSource(
      Defaults.PAGE_NUMBER,
      Defaults.PAGE_SIZE,
      this.pagination_loading
    );
  }

  onFilterApplied($event: BalanceFilter | null) {
    this.filter = $event;
    this.updateDataSource(
      Defaults.PAGE_NUMBER,
      Defaults.PAGE_SIZE,
      this.pagination_loading
    );
  }

  ngOnInit(): void {
    this.updateDataSource(
      Defaults.PAGE_NUMBER,
      Defaults.PAGE_SIZE,
      this.loading
    );
  }

  updateDataSource(
    pageNumber: number,
    pageSize: number,
    loading: WritableSignal<boolean>
  ) {
    this.loading_error.set(null);
    loading.set(true);
    this.balanceService
      .getBalances(pageNumber, pageSize, this.filter)
      .subscribe({
        next: (res: any) => {
          this.paginationModel = res;
          this.dataSource.data = res.pageData;
          this.hasData.set(!!res.pageData.length);
          loading.set(false);
        },
        error: (err: any) => {
          //todo: notify user
          this.loading_error.set(err.message);
        },
      });
  }

  handlePageEvent($event: PageEvent) {
    this.updateDataSource(
      $event.pageIndex + 1,
      $event.pageSize,
      this.pagination_loading
    );
  }
}
