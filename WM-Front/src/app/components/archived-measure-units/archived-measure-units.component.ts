import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  DoCheck,
  inject,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { IArchivedMeasureUnit } from '../../objects/measure-units';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  MatTableDataSource,
  MatTable,
  MatTableModule,
} from '@angular/material/table';
import { Defaults } from '../../models/constants';
import { PaginationModel } from '../../models/pagination-model';
import { MeasureUnitsService } from '../../services/measure-units.service';
import { DialogData, RemoveDialogData } from '../dialogs/dialog-data';
import { EditMeasureUnitDialogComponent } from '../dialogs/edit-measure-unit-dialog/edit-measure-unit-dialog.component';
import { EditResourceDialogComponent } from '../dialogs/edit-resource-dialog/edit-resource-dialog.component';
import { RemoveConfirmationComponent } from '../dialogs/remove-confirmation/remove-confirmation.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UxUtils } from '../../services/UxUtils';

@Component({
  selector: 'app-archived-measure-units',
  imports: [
    MatIconModule,
    MatTableModule,
    MatButtonModule,
    MatDialogModule,
    MatPaginator,
  ],
  templateUrl: './archived-measure-units.component.html',
  styleUrl: './archived-measure-units.component.css',
})
export class ArchivedMeasureUnitsComponent
  implements
    OnInit,
    AfterViewInit,
    OnChanges,
    DoCheck,
    AfterContentInit,
    AfterContentChecked,
    AfterViewChecked,
    OnDestroy
{
  private _snackBar = inject(MatSnackBar);
  readonly dialog = inject(MatDialog);
  paginationModel?: PaginationModel<IArchivedMeasureUnit> | null;
  displayedColumns: string[] = [
    //  'id',
    'name',
    'controls',
  ];
  dataLength?: number | null;
  loadingError?: string | null;
  dataSource = new MatTableDataSource<IArchivedMeasureUnit>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatTable) table!: MatTable<IArchivedMeasureUnit>;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private unitsService: MeasureUnitsService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log('ngOnChanges called');
  }
  ngDoCheck(): void {
    console.log('ngDoCheck called');
  }
  ngAfterContentInit(): void {
    console.log('ngAfterContentInit called');
  }
  ngAfterContentChecked(): void {
    console.log('ngAfterContentChecked called');
  }
  ngAfterViewChecked(): void {
    console.log('ngAfterViewChecked called');
  }
  ngOnDestroy(): void {
    console.log('ngOnDestroy called');
  }

  ngOnInit(): void {
    console.log('ngOnInit called');
    // this.updateDataSource(Defaults.PAGE_NUMBER, Defaults.PAGE_SIZE);
  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit called');
    this.dataSource.paginator = this.paginator;
  }

  updateDataSource(pageNumber: number, pageSize: number): void {
    this.paginationModel = null;
    this.unitsService.getArchived(pageNumber, pageSize).subscribe({
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
      data: new DialogData<IArchivedMeasureUnit>({ id: 0, name: '' }, false),
      width: '400px',
      height: 'auto',
    });

    UxUtils.bindDialogActionToEnterKey(dialogRef, () =>
      dialogRef.componentInstance.onOkayClick()
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (!result || result.cancelled) return;

      let data = result.data as IArchivedMeasureUnit;
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

  removeUnit(unit: IArchivedMeasureUnit): void {
    console.log('Remove: ' + JSON.stringify(unit));
    const dialogRef = this.dialog.open(RemoveConfirmationComponent, {
      data: new RemoveDialogData<IArchivedMeasureUnit>(
        unit,
        'Удаление объекта',
        'Вы уверены, что хотите удалить единицу измерения?'
      ),
      width: '400px',
      height: 'auto',
    });

    UxUtils.bindDialogActionToEnterKey(dialogRef, () =>
      dialogRef.componentInstance.onOkayClick()
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

  fromArchive(resource: IArchivedMeasureUnit) {
    console.log('To archive: ' + JSON.stringify(resource));

    this.unitsService.set_archived_state(resource, false).subscribe({
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
        this.notify('Ед.измерения перенесена в активную группу');
      },
      error: (err) => {
        console.error(err.message);
      },
    });
  }

  editUnit(resource: IArchivedMeasureUnit) {
    console.log('Edit: ' + JSON.stringify(resource));

    const dialogRef = this.dialog.open(EditResourceDialogComponent, {
      data: new DialogData<IArchivedMeasureUnit>(resource),
      width: '400px',
      height: 'auto',
    });

    UxUtils.bindDialogActionToEnterKey(dialogRef, () =>
      dialogRef.componentInstance.onOkayClick()
    );

    dialogRef
      .afterClosed()
      .subscribe((result: DialogData<IArchivedMeasureUnit>) => {
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

  removeFromDataSource(resource: IArchivedMeasureUnit): void {
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
