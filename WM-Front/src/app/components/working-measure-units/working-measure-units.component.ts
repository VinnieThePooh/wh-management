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
import { IWorkingMeasureUnit } from '../../objects/measure-units';
import { MeasureUnitsService } from '../../services/measure-units.service';
import { EditMeasureUnitDialogComponent } from '../dialogs/edit-measure-unit-dialog/edit-measure-unit-dialog.component';
import { UxUtils } from '../../services/UxUtils';

@Component({
  selector: 'app-working-measure-units',
  imports: [
    MatIconModule,
    MatTableModule,
    MatButtonModule,
    MatDialogModule,
    MatPaginator,
  ],
  templateUrl: './working-measure-units.component.html',
  styleUrl: './working-measure-units.component.css',
})
export class WorkingMeasureUnitsComponent implements OnInit, AfterViewInit {
  private _snackBar = inject(MatSnackBar);
  readonly dialog = inject(MatDialog);
  paginationModel?: PaginationModel<IWorkingMeasureUnit> | null;
  displayedColumns: string[] = [
    //  'id',
    'name',
    'controls',
  ];
  dataLength?: number | null;
  loadingError?: string | null;
  dataSource = new MatTableDataSource<IWorkingMeasureUnit>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatTable) table!: MatTable<IWorkingMeasureUnit>;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private unitsService: MeasureUnitsService
  ) {}

  ngOnInit(): void {
    this.updateDataSource(Defaults.PAGE_NUMBER, Defaults.PAGE_SIZE);
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  updateDataSource(pageNumber: number, pageSize: number): void {
    this.paginationModel = null;
    this.unitsService.getWorking(pageNumber, pageSize).subscribe({
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
    const dialogRef = this.dialog.open(EditMeasureUnitDialogComponent, {
      data: new DialogData<IWorkingMeasureUnit>({ id: 0, name: '' }),
      width: '400px',
      height: 'auto',
    });

    UxUtils.bindDialogActionToEnterKey(dialogRef, () =>
      dialogRef.componentInstance.onOkayClick()
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (!result || result.cancelled) return;

      let data = result.data as IWorkingMeasureUnit;
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

      this.notify('Ед.измерения успешно добавлена');
    });
  }

  removeUnit(unit: IWorkingMeasureUnit): void {
    console.log('Remove: ' + JSON.stringify(unit));
    const dialogRef = this.dialog.open(RemoveConfirmationComponent, {
      data: new RemoveDialogData<IWorkingMeasureUnit>(
        unit,
        'Удаление объекта',
        'Вы уверены, что хотите удалить единицу измерения?'
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

      this.unitsService.deleteUnit(unit.id).subscribe({
        next: (res) => {
          if (this.dataSource.data.length > 1) {
            this.removeFromDataSource(unit);
          } else {
            this.updateDataSource(
              Math.max(this.paginationModel!.pageNumber - 1, 1),
              this.paginationModel!.pageSize
            );
          }

          this.notify('Ед.измерения успешно удалена');
        },
        error: (err) => {
          console.error(err.message);
        },
      });
    });
  }

  toArchive(resource: IWorkingMeasureUnit) {
    this.unitsService.set_archived_state(resource, true).subscribe({
      next: (res) => {
        if (this.dataSource.data.length > 1) {
          this.removeFromDataSource(resource);
        } else {
          this.updateDataSource(
            Math.max(this.paginationModel!.pageNumber - 1, 1),
            this.paginationModel!.pageSize
          );
        }
        this.notify('Единица измерения перенесена в архив');
      },
      error: (err) => {
        console.error(err.message);
      },
    });
  }

  editUnit(resource: IWorkingMeasureUnit) {
    console.log('Edit: ' + JSON.stringify(resource));

    const dialogRef = this.dialog.open(EditMeasureUnitDialogComponent, {
      data: new DialogData<IWorkingMeasureUnit>(resource),
      width: '400px',
      height: 'auto',
    });

    UxUtils.bindDialogActionToEnterKey(dialogRef, () =>
      dialogRef.componentInstance.onOkayClick()
    );

    dialogRef
      .afterClosed()
      .subscribe((result: DialogData<IWorkingMeasureUnit>) => {
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
    this.unitsService
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

  removeFromDataSource(resource: IWorkingMeasureUnit): void {
    const index = this.dataSource.data.findIndex(
      (res) => res.id === resource.id
    );
    if (index > -1) {
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
