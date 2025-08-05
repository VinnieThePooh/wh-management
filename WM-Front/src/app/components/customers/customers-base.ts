import {
  Component,
  inject,
  signal,
  viewChild,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { PaginationModel } from '../../models/pagination-model';
import { CustomerListItem } from '../../objects/customers';
import { CustomerService } from '../../services/customer.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UxUtils } from '../../services/UxUtils';
import { EditDialogData, RemoveDialogData } from '../dialogs/dialog-data';
import { RemoveConfirmationComponent } from '../dialogs/remove-confirmation/remove-confirmation.component';
import { EditCustomerDialogComponent } from '../dialogs/edit-customer-dialog/edit-customer-dialog.component';

@Component({
  selector: 'customer-base',
  template: '',
})
export abstract class CustomersBase {
  //todo: add later
  protected initial_loading = signal(true);
  protected working_loading = signal(false);
  protected init_load_error: WritableSignal<string | null> = signal(null);
  protected working_load_error: WritableSignal<string | null> = signal(null);

  protected paginationModel: PaginationModel<CustomerListItem> | null = null;
  protected dataSource = new MatTableDataSource<CustomerListItem>([]);
  public hasData = signal(false);
  protected total_count = signal<number>(0);
  protected readonly _dialog = inject(MatDialog);
  _table = viewChild(MatTable<CustomerListItem>);
  private _snackBar = inject(MatSnackBar);

  protected displayedColumns = ['name', 'actions', 'address'];

  constructor(protected customerService: CustomerService) {}

  protected abstract customerFactory(
    source?: CustomerListItem
  ): CustomerListItem;

  public abstract updateDataSource(
    pageNumber: number,
    pageSize: number,
    loading?: WritableSignal<boolean>,
    loading_error?: WritableSignal<string | null>
  ): void;

  protected handlePageEvent($event: PageEvent) {
    this.updateDataSource(
      $event.pageIndex + 1,
      $event.pageSize,
      this.working_loading,
      this.working_load_error
    );
  }

  protected ensureLoadingSet(
    loading?: WritableSignal<boolean>,
    loading_error?: WritableSignal<string>
  ): [WritableSignal<boolean>, WritableSignal<string>] {
    if (loading === undefined) loading = this.initial_loading;
    if (loading_error === undefined) loading_error = this.init_load_error;

    loading.set(false);
    loading_error.set('');

    return [loading, loading_error];
  }

  addCustomer(): void {
    // explicitly passing objects works well
    // via generic ctors - NO (mf)
    const dialogRef = this._dialog.open(EditCustomerDialogComponent, {
      data: {
        data: this.customerFactory(),
        cancelled: false,
        newEntity: true,
      } as EditDialogData<CustomerListItem>,
      width: '400px',
      height: 'auto',
    });

    UxUtils.bindDialogActionToEnterKey(dialogRef, () =>
      dialogRef.componentInstance.onOkayClick()
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (!result || result.cancelled) return;

      let data = result.data as CustomerListItem;

      let pmodel = this.paginationModel!;
      if (pmodel.pageData.length < pmodel.pageSize) {
        this.dataSource.data.push(data);
        this.paginationModel!.totalCount++;
        this._table().renderRows();
        this.total_count.set(this.paginationModel!.totalCount++);
      } else {
        this.updateDataSource(
          this.paginationModel!.pageNumber,
          this.paginationModel!.pageSize
        );
      }
      this.notify('Новый клиент успешно добавлен');
    });
  }

  public editCustomer(item: CustomerListItem): void {
    // explicitly passing objects works well
    // via generic ctors - NO (mf)
    const dialogRef = this._dialog.open(EditCustomerDialogComponent, {
      data: {
        data: this.customerFactory(item),
        cancelled: false,
        newEntity: false,
      } as EditDialogData<CustomerListItem>,
      width: '400px',
      height: 'auto',
    });

    UxUtils.bindDialogActionToEnterKey(dialogRef, () =>
      dialogRef.componentInstance.onOkayClick()
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (!result || result.cancelled) return;

      let data = result.data as CustomerListItem;
      // by ref
      const index = this.dataSource.data.findIndex((x) => x.id === data.id);
      if (index > -1) {
        this.dataSource.data[index] = data;
        this._table().renderRows();
        this.notify('Редактирование завершено успешно');
      }
    });
  }

  notify(message: string): void {
    this._snackBar.open(message, '', {
      duration: 1000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  protected removeFromDataSource(customer: CustomerListItem): void {
    const index = this.dataSource.data.findIndex(
      (res) => res.id === customer.id
    );
    if (index > -1) {
      this.dataSource.data.splice(index, 1);
      this.paginationModel!.totalCount--;
      this._table().renderRows();
    }
  }

  removeCustomer(unit: CustomerListItem): void {
    const dialogRef = this._dialog.open(RemoveConfirmationComponent, {
      data: new RemoveDialogData<CustomerListItem>(
        unit,
        'Удаление объекта',
        'Вы уверены, что хотите удалить клиента?'
      ),
      width: '400px',
      height: 'auto',
    });

    UxUtils.bindDialogActionToEnterKey(
      dialogRef,
      dialogRef.componentInstance.onOkayClick
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (!result || result.cancelled) return;

      this.customerService.deleteCustomer(unit.id).subscribe({
        next: (res) => {
          if (this.dataSource.data.length > 1) {
            this.removeFromDataSource(unit);
          } else {
            this.updateDataSource(
              Math.max(this.paginationModel!.pageNumber - 1, 1),
              this.paginationModel!.pageSize
            );
          }

          this.notify('Данные клиента успешно удалены');
        },
        error: (err) => {
          console.error(err.message);
        },
      });
    });
  }

  protected setArchivedState(
    customer: CustomerListItem,
    state: boolean,
    complete_message: string
  ) {
    this.customerService.set_archived_state(customer, state).subscribe({
      next: (res) => {
        if (this.dataSource.data.length > 1) {
          this.removeFromDataSource(customer);
        } else {
          this.updateDataSource(
            Math.max(this.paginationModel!.pageNumber - 1, 1),
            this.paginationModel!.pageSize
          );
        }
        this.notify(complete_message);
      },
      error: (err) => {
        console.error(err.message);
      },
    });
  }
}
