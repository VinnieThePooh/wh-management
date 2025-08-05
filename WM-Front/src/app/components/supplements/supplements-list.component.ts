import {
  Component,
  inject,
  OnInit,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { SupplemmentsFilterComponent } from './supplements-filter.component';
import { SupplyFilter } from '../../objects/supply-filter';
import {
  MatButton,
  MatButtonModule,
  MatIconButton,
} from '@angular/material/button';
import { SupplyService } from '../../services/supply.service';
import { Defaults } from '../../models/constants';
import { PaginationModel } from '../../models/pagination-model';
import { SupplementListItem } from '../../objects/supplements';
import {
  MatTable,
  MatTableDataSource,
  MatTableModule,
} from '@angular/material/table';
import { DatePipe } from '@angular/common';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { EditSupplementComponent } from './supplement-edit/edit-supplement.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EditDialogData, RemoveDialogData } from '../dialogs/dialog-data';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { StopClickPropagationDirective } from '../../directives/stop-click-propagation.directive';
import { RemoveConfirmationComponent } from '../dialogs/remove-confirmation/remove-confirmation.component';
import { UxUtils } from '../../services/UxUtils';
import { HttpErrorResponse } from '@angular/common/http';
import { CacheService } from '../../services/cache.service';

@Component({
  selector: 'app-supplemments-list',
  imports: [
    SupplemmentsFilterComponent,
    EditSupplementComponent,
    MatStepperModule,
    MatIconModule,
    MatButtonModule,
    MatButton,
    MatIconButton,
    MatTableModule,
    MatDialogModule,
    DatePipe,
    MatStepperModule,
    MatPaginator,
    MatSnackBarModule,
    StopClickPropagationDirective,
  ],
  templateUrl: './supplements-list.component.html',
  styleUrl: './supplements-list.component.css',
})
export class SupplemmentsListComponent implements OnInit {
  readonly _dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);
  private _paginator = viewChild(MatPaginator);
  private _matTableRef = viewChild(MatTable);
  has_data_signal: WritableSignal<boolean> = signal(false);
  initial_loading = signal(true);
  //todo: add later
  working_loading = signal(false);
  init_load_error: WritableSignal<string | null> = signal(null);
  working_load_error: WritableSignal<string | null> = signal(null);
  paginationModel: PaginationModel<SupplementListItem> | null = null;
  dataSource = new MatTableDataSource<SupplementListItem>([]);
  displayedColumns: string[] = [
    'actions',
    'documentNumber',
    'supplyDate',
    'resources',
  ];

  total_count = signal<number>(0);
  stepper = viewChild(MatStepper);
  readonly editableSupplement: WritableSignal<SupplementListItem> =
    signal(null);
  newEntity = signal(true);

  private filter: SupplyFilter | null = null;
  constructor(private supplyService: SupplyService) {}

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
      this.paginator.pageSize,
      this.working_loading,
      this.working_load_error
    );
  }

  onFilterApplied($event: SupplyFilter | null) {
    this.dataSource.data = [];
    this.filter = $event;
    this.updateDataSource(
      Defaults.PAGE_NUMBER,
      this.paginator.pageSize,
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
    this.supplyService
      .getSupplements(pageNumber, pageSize, this.filter)
      .subscribe({
        next: (res: any) => {
          this.paginationModel = res;
          this.dataSource.data = res.pageData;
          this.total_count.set(res.totalCount);
          this.has_data_signal.set(!!res.pageData.length);
          loading.set(false);
        },
        error: (err: any) => {
          //todo: notify user
          loading_error.set(err.message);
        },
      });
  }

  get hasData() {
    return this.has_data_signal();
  }

  handlePageEvent(event: PageEvent) {
    this.updateDataSource(
      event.pageIndex + 1,
      event.pageSize,
      this.working_loading,
      this.working_load_error
    );
  }

  editSupplement(entity: SupplementListItem) {
    this.newEntity.set(false);
    this.editableSupplement.set(entity);
    this.stepper().next();
  }

  addSupplement(): void {
    this.newEntity.set(true);
    this.editableSupplement.set(new SupplementListItem());
    this.stepper().next();
  }

  onEditCancelled() {
    console.log('Edit cancelled!');
    this.stepper().previous();
  }
  onEditApplied(event: EditDialogData<SupplementListItem>) {
    console.log('Edit applied!');
    const data = event.data;
    console.dir(data);
    this.stepper().previous();
    if (event.newEntity) {
      this.notify('Новая поставка добавлена успешно');
      let data = event.data;
      console.log(
        'Object created Id/Number: ' +
          data.documentId +
          '/' +
          data.documentNumber
      );
    } else {
      let index = this.dataSource.data.findIndex(
        (x) => x.documentId === data.documentId
      );
      if (index > -1) {
        this.dataSource.data[index] = data;
        this._matTableRef().renderRows();
      }

      this.notify('Поставка обновлена успешно');
    }
  }

  notify(message: string): void {
    this._snackBar.open(message, '', {
      duration: 2000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  get paginator() {
    return this._paginator();
  }

  onDeleteDocument(document: SupplementListItem) {
    console.log('To delete: ');
    console.dir(document);
    const dialogRef = this._dialog.open(RemoveConfirmationComponent, {
      data: new RemoveDialogData<SupplementListItem>(
        document,
        'Удаление объекта',
        'Вы уверены, что хотите удалить документ поставки?'
      ),
      width: '400px',
      height: 'auto',
    });

    UxUtils.bindDialogActionToEnterKey(dialogRef, () =>
      dialogRef.componentInstance.onOkayClick()
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (!result || result.cancelled) return;

      this.supplyService.deleteDocument(result.data.documentId).subscribe({
        next: (res) => {
          var index = this.dataSource.data.findIndex(
            (x) => x.documentId === document.documentId
          );
          if (index > -1) {
            this.dataSource.data.splice(index, 1);
            this.paginationModel.totalCount--;
            this.total_count.set(this.paginationModel.totalCount);
            this._matTableRef().renderRows();
          }
          this.notify('Документ поставки успешно удален');
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 404)
            this.notifyUnexpectedError('Документ поставки не был найден');
          else {
            this.notifyUnexpectedError(err.message);
          }
        },
      });
    });
  }

  notifyUnexpectedError(message: string) {
    this._snackBar.open('Что-то пошло не так: ' + message, '', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error'],
    });
  }
}
