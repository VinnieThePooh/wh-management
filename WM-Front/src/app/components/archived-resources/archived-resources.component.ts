import { ChangeDetectorRef, Component, inject, ViewChild } from '@angular/core';
import { IArchivedResource } from '../../objects/resources';
import { PaginationModel } from '../../models/pagination-model';
import { ResourcesService } from '../../services/resources.service';
import { Defaults } from '../../models/constants';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { DialogData, RemoveDialogData } from '../dialogs/dialog-data';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {
  MatTableDataSource,
  MatTable,
  MatTableModule,
} from '@angular/material/table';
import { EditResourceDialogComponent } from '../dialogs/edit-resource-dialog/edit-resource-dialog.component';
import { RemoveConfirmationComponent } from '../dialogs/remove-confirmation/remove-confirmation.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UxUtils } from '../../services/UxUtils';

@Component({
  selector: 'app-archived-resources',
  imports: [
    MatIconModule,
    MatTableModule,
    MatButtonModule,
    MatDialogModule,
    MatPaginator,
  ],
  templateUrl: './archived-resources.component.html',
  styleUrl: './archived-resources.component.css',
})
export class ArchivedResourcesComponent {
  private _snackBar = inject(MatSnackBar);
  readonly dialog = inject(MatDialog);
  paginationModel?: PaginationModel<IArchivedResource> | null;
  displayedColumns: string[] = [
    //  'id',
    'name',
    'controls',
  ];
  dataLength?: number | null;
  loadingError?: string | null;
  dataSource = new MatTableDataSource<IArchivedResource>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatTable) table!: MatTable<IArchivedResource>;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private resService: ResourcesService
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  updateDataSource(pageNumber: number, pageSize: number): void {
    this.paginationModel = null;
    this.resService.getArchived(pageNumber, pageSize).subscribe({
      next: (res) => {
        this.paginationModel = res;
        this.dataSource.data = res.pageData;
      },
      error: (err) => {
        //todo: notify user here OR rethrow
        this.loadingError = err;
      },
    });
  }

  addData(): void {
    const dialogRef = this.dialog.open(EditResourceDialogComponent, {
      data: new DialogData<IArchivedResource>({ id: 0, name: '' }, false),
      width: '400px',
      height: 'auto',
    });

    UxUtils.bindDialogActionToEnterKey(dialogRef, () =>
      dialogRef.componentInstance.onOkayClick()
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (!result || result.cancelled) return;

      let data = result.data as IArchivedResource;
      //todo: reconsider
      let pmodel = this.paginationModel!;
      if (pmodel.pageData.length < pmodel.pageSize) {
        this.dataSource.data.push(data);
        this.table.renderRows();
        this.paginationModel!.totalCount++;
      } else {
        this.updateDataSource(
          this.paginationModel!.pageNumber,
          this.paginationModel!.pageSize
        );
      }
      this.notify('Новый ресурс успешно добавлен');
    });
  }

  removeResource(resource: IArchivedResource): void {
    console.log('Remove: ' + JSON.stringify(resource));
    const dialogRef = this.dialog.open(RemoveConfirmationComponent, {
      data: new RemoveDialogData<IArchivedResource>(
        resource,
        'Удаление ресурса',
        'Вы уверены, что хотите удалить ресурс?'
      ),
      width: '400px',
      height: 'auto',
    });

    UxUtils.bindDialogActionToEnterKey(dialogRef, () =>
      dialogRef.componentInstance.onOkayClick()
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (!result || result.cancelled) return;

      this.resService.deleteResource(resource.id).subscribe({
        next: (res) => {
          if (this.dataSource.data.length > 1) {
            this.removeFromDataSource(resource);
          } else {
            this.updateDataSource(
              Math.max(this.paginationModel!.pageNumber - 1, 1),
              this.paginationModel!.pageSize
            );
          }
          this.notify('Ресурс успешно удален');
        },
        error: (err) => {
          console.error(err.message);
        },
      });
    });
  }

  toUnarchived(resource: IArchivedResource) {
    console.log('To archive: ' + JSON.stringify(resource));

    this.resService.set_archived_state(resource, false).subscribe({
      next: (res) => {
        if (this.dataSource.data.length > 1) {
          this.removeFromDataSource(resource);
          // todo: snackbar
        } else {
          this.updateDataSource(
            Math.max(this.paginationModel!.pageNumber - 1, 1),
            this.paginationModel!.pageSize
          );
        }
        this.notify('Ресурс перенесен из архива');
      },
      error: (err) => {
        console.error(err.message);
      },
    });
  }

  editResource(resource: IArchivedResource) {
    console.log('Edit: ' + JSON.stringify(resource));

    const dialogRef = this.dialog.open(EditResourceDialogComponent, {
      data: new DialogData<IArchivedResource>(resource),
      width: '400px',
      height: 'auto',
    });

    UxUtils.bindDialogActionToEnterKey(dialogRef, () =>
      dialogRef.componentInstance.onOkayClick()
    );

    dialogRef
      .afterClosed()
      .subscribe((result: DialogData<IArchivedResource>) => {
        if (!result || result.cancelled) return;

        const target = result.data;
        const index = this.dataSource.data.findIndex(
          (res) => res.id === target.id
        );
        this.dataSource.data[index] = target;
        this.changeDetectorRef.detectChanges();
        this.table.renderRows();
        this.notify('Редактирование завершено успешно');
      });
  }

  handlePageEvent($event: PageEvent) {
    this.resService
      .getArchived($event.pageIndex + 1, $event.pageSize)
      .subscribe({
        next: (res) => {
          this.paginationModel = res;
          this.dataSource.data = res.pageData;
        },
        error: (err) => {
          //todo: notify user here OR rethrow
          this.loadingError = err;
        },
      });
  }

  removeFromDataSource(resource: IArchivedResource): void {
    const index = this.dataSource.data.findIndex(
      (res) => res.id === resource.id
    );
    if (index > -1) {
      //todo: add notification
      this.dataSource.data.splice(index, 1);
      this.paginationModel!.totalCount--;
      this.changeDetectorRef.detectChanges();
      this.table.renderRows();
    }
  }

  notify(message: string): void {
    this._snackBar.open(message, '', {
      duration: 1000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
