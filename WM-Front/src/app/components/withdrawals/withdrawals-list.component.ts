import {
  Component,
  OnInit,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { WithdrawFilter } from '../../objects/withdrawal-filter';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { PaginationModel } from '../../models/pagination-model';
import { MatIconModule } from '@angular/material/icon';
import { EditWithdrawalComponent } from './edit-withdrawal/edit-withdrawal.component';
import { WithdrawalListItem } from '../../objects/withdrawals';
import { EditDialogData } from '../dialogs/dialog-data';
import { DatePipe } from '@angular/common';
import { WithdrawFilterComponent } from './withdrawal-filter/withdraw-filter.component';
import { WithdrawService } from '../../services/withdraw.service';
import { Defaults } from '../../models/constants';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-withdrawals-list',
  imports: [
    WithdrawFilterComponent,
    MatButtonModule,
    MatStepperModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    EditWithdrawalComponent,
    DatePipe,
  ],
  templateUrl: './withdrawals-list.component.html',
  styleUrl: './withdrawals-list.component.css',
})
export class WithdrawalsListComponent implements OnInit {
  filter: WithdrawFilter | null = null;
  hasData: WritableSignal<boolean> = signal(false);
  initial_loading = signal(true);
  //todo: add later
  working_loading = signal(false);
  init_load_error: WritableSignal<string | null> = signal(null);
  working_load_error: WritableSignal<string | null> = signal(null);

  paginationModel: PaginationModel<WithdrawalListItem | null> = null;
  dataSource = new MatTableDataSource<WithdrawalListItem>([]);
  displayedColumns: string[] = [
    'actions',
    'documentNumber',
    'supplyDate',
    'resources',
  ];

  constructor(private withdrawService: WithdrawService) {}

  readonly editEntity: WritableSignal<WithdrawalListItem> = signal(null);

  newEntity = signal(true);
  total_count = signal<number>(0);
  stepper = viewChild(MatStepper);

  ngOnInit(): void {
    this.updateDataSource(
      Defaults.PAGE_NUMBER,
      Defaults.PAGE_SIZE,
      this.initial_loading,
      this.init_load_error
    );
  }

  onFilterCleared() {
    this.filter = null;
    this.updateDataSource(
      Defaults.PAGE_NUMBER,
      Defaults.PAGE_SIZE,
      this.working_loading,
      this.working_load_error
    );
  }
  onFilterApplied($event: WithdrawFilter | null) {
    this.filter = $event;
    this.updateDataSource(
      Defaults.PAGE_NUMBER,
      Defaults.PAGE_SIZE,
      this.working_loading,
      this.working_load_error
    );
  }

  updateDataSource(
    pageNumber: number,
    pageSize: number,
    loading: WritableSignal<boolean>,
    loading_error: WritableSignal<string | null>
  ) {
    loading.set(true);
    loading_error.set(null);
    this.withdrawService
      .getWithdraws(pageNumber, pageSize, this.filter)
      .subscribe({
        next: (res: any) => {
          this.paginationModel = res;
          this.dataSource.data = res.pageData;
          this.total_count.set(res.totalCount);
          this.hasData.set(!!res.pageData.length);
          loading.set(false);
        },
        error: (err: any) => {
          //todo: notify user
          loading_error.set(err.message);
        },
      });
  }

  onEditCancelled() {
    this.stepper().previous();
  }
  onEditApplied($event: EditDialogData<WithdrawalListItem>) {
    this.stepper().previous();
  }

  editDocument(entity: WithdrawalListItem) {
    this.newEntity.set(false);
    this.editEntity.set(entity);
    this.stepper().next();
  }
  addDocument() {
    this.newEntity.set(true);
    this.editEntity.set(new WithdrawalListItem());
    this.stepper().next();
  }
  onDeleteDocument(_t31: any) {
    throw new Error('Method not implemented.');
  }
  handlePageEvent($event: PageEvent) {
    throw new Error('Method not implemented.');
  }
}
