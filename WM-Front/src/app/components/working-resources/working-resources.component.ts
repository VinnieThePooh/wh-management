import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { ResourcesService } from '../../services/resources.service';
import { Defaults } from '../../models/constants';
import { IWorkingResource as IWorkingResource } from '../../objects/resources';
import { PaginationModel } from '../../models/pagination-model';
import {
  MatTable,
  MatTableDataSource,
  MatTableModule,
} from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EditResourceDialogComponent } from '../dialogs/edit-resource-dialog/edit-resource-dialog.component';
import { DialogData, RemoveDialogData } from '../dialogs/dialog-data';
import { MatIconModule } from '@angular/material/icon';
import { RemoveConfirmationComponent } from '../dialogs/remove-confirmation/remove-confirmation.component';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UxUtils } from '../../services/UxUtils';

//todo: add paginator
@Component({
  selector: 'app-working-resources',
  imports: [
    MatIconModule,
    MatTableModule,
    MatButtonModule,
    MatDialogModule,
    MatPaginator,
  ],
  templateUrl: './working-resources.component.html',
  styleUrl: './working-resources.component.css',
})
export class WorkingResourcesComponent implements OnInit, AfterViewInit {
  private _snackBar = inject(MatSnackBar);
  readonly dialog = inject(MatDialog);
  paginationModel?: PaginationModel<IWorkingResource> | null;
  displayedColumns: string[] = [
    //  'id',
    'name',
    'controls',
  ];
  dataLength?: number | null;
  loadingError?: string | null;
  dataSource = new MatTableDataSource<IWorkingResource>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatTable) table!: MatTable<IWorkingResource>;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private resService: ResourcesService
  ) {}

  ngOnInit(): void {
    this.updateDataSource(Defaults.PAGE_NUMBER, Defaults.PAGE_SIZE);
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  updateDataSource(pageNumber: number, pageSize: number): void {
    this.paginationModel = null;
    this.resService.getWorking(pageNumber, pageSize).subscribe({
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
      data: new DialogData<IWorkingResource>({ id: 0, name: '' }),
      width: '400px',
      height: 'auto',
    });

    UxUtils.bindDialogActionToEnterKey(dialogRef, () =>
      dialogRef.componentInstance.onOkayClick()
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (!result || result.cancelled) return;

      let data = result.data as IWorkingResource;
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

  removeResource(resource: IWorkingResource): void {
    console.log('Remove: ' + JSON.stringify(resource));
    const dialogRef = this.dialog.open(RemoveConfirmationComponent, {
      data: new RemoveDialogData<IWorkingResource>(
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

  toArchive(resource: IWorkingResource) {
    console.log('To archive: ' + JSON.stringify(resource));

    this.resService.set_archived_state(resource, true).subscribe({
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
        this.notify('Ресурс перенесен в архив');
      },
      error: (err) => {
        console.error(err.message);
      },
    });
  }

  editResource(resource: IWorkingResource) {
    console.log('Edit: ' + JSON.stringify(resource));

    const dialogRef = this.dialog.open(EditResourceDialogComponent, {
      data: new DialogData<IWorkingResource>(resource),
      width: '400px',
      height: 'auto',
    });

    UxUtils.bindDialogActionToEnterKey(dialogRef, () =>
      dialogRef.componentInstance.onOkayClick()
    );

    dialogRef
      .afterClosed()
      .subscribe((result: DialogData<IWorkingResource>) => {
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
      .getWorking($event.pageIndex + 1, $event.pageSize)
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

  removeFromDataSource(resource: IWorkingResource): void {
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
