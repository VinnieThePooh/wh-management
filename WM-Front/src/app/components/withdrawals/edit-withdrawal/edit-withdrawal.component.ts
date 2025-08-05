import { Component, inject, input, output, viewChild } from '@angular/core';
import { EditDialogData } from '../../dialogs/dialog-data';
import { WithdrawalListItem } from '../../../objects/withdrawals';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MatError,
  MatFormField,
  MatFormFieldModule,
  MatLabel,
} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { CacheService } from '../../../services/cache.service';
import { WithdrawService } from '../../../services/withdraw.service';
import { Observable, of } from 'rxjs';
import { IResourceChangeListItem } from '../../../objects/resource-change-list-item';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatTable, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { ISelectListItem } from '../../../objects/select-list-item';

@Component({
  selector: 'app-edit-withdrawal',
  imports: [
    MatSelectModule,
    MatError,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    CommonModule,
    MatLabel,
    MatFormField,
    MatDatepickerModule,
    MatTableModule,
    MatSnackBarModule,
  ],
  templateUrl: './edit-withdrawal.component.html',
  styleUrl: './edit-withdrawal.component.css',
})
export class EditWithdrawalComponent {
  updateErrorMessage() {
    throw new Error('Method not implemented.');
  }
  readonly newEntity = input<boolean>();
  readonly withdrawObject = input<WithdrawalListItem>();
  readonly customers = input<ISelectListItem[]>();
  readonly withdrawObject$ = toObservable(this.withdrawObject);
  readonly resourcesTable = viewChild(MatTable);

  displayedColumns = ['actions', 'resourceId', 'measureUnitId', 'quantity'];

  private _snackBar = inject(MatSnackBar);
  editApplied = output<EditDialogData<WithdrawalListItem>>();
  editCancelled = output();

  withdrawForm: FormGroup<any> = new FormGroup({
    documentId: new FormControl<number | null>(
      this.withdrawObject()?.documentId
    ),
    documentNumber: new FormControl<string | null>(
      this.withdrawObject()?.documentNumber,
      [Validators.required],
      [(ctrl) => this.validateDocument(ctrl)]
    ),
    withdrawalDate: new FormControl<Date | null>(
      this.withdrawObject()?.withdrawalDate,
      [Validators.required]
    ),
    customerId: new FormControl<number | null>(
      this.withdrawObject()?.customerId
    ),
    customerName: new FormControl<string | null>(
      this.withdrawObject()?.customerName
    ),
    signed: new FormControl<boolean>(this.withdrawObject()?.signed),
    resources: new FormArray(
      this.mapChangeListItems(this.withdrawObject()?.resources || [])
    ),
  });

  constructor(
    private fb: FormBuilder,
    private withdrawService: WithdrawService,
    private cacheService: CacheService
  ) {
    this.withdrawObject$.subscribe((v) => {
      this.resetObject(v);
    });
  }

  get resources() {
    return (this.withdrawForm.get('resources') as FormArray)?.controls;
  }

  get resource_list_items() {
    return this.cacheService.resources;
  }

  get units_list_items() {
    return this.cacheService.measure_units;
  }

  get title() {
    return this.newEntity
      ? 'Создание новой отгрузки'
      : 'Редактирование отгрузки';
  }

  get documentNumber() {
    return this.withdrawForm.get('documentNumber');
  }

  get withdrawalDate() {
    return this.withdrawForm.get('withdrawalDate');
  }

  get withdrawalDateError() {
    if (this.withdrawalDate.hasError('required')) {
      return 'Дата отгрузки обязательна';
    }
    return '';
  }

  get docNumberError() {
    if (this.documentNumber?.hasError('required')) {
      return 'Номер обязателен';
    }

    if (this.documentNumber?.hasError('isNameTaken')) {
      return 'Наименование уже существует';
    }

    return '';
  }

  resetObject(s: WithdrawalListItem) {
    if (!s) return;

    let array = this.withdrawForm.get('resources') as FormArray;
    array.clear();

    this.withdrawForm.reset(s);

    const resGroups = s.resources.map((res) =>
      this.fb.group(<IResourceChangeListItem>res)
    );
    this.withdrawForm.setControl('resources', this.fb.array(resGroups));
    this.resourcesTable().renderRows();
  }

  onAddRow() {
    let res = <FormArray>this.withdrawForm.get('resources');

    res.push(
      this.fb.group({
        supplementId: new FormControl<number | null>(null),
        resourceId: new FormControl<number | null>(null, [Validators.required]),
        measureUnitId: new FormControl<number | null>(null, [
          Validators.required,
        ]),
        quantity: new FormControl<number>(0, [Validators.required]),
      })
    );
    this.resourcesTable().renderRows();
  }
  onDeleteRow(_t37: any) {
    throw new Error('Method not implemented.');
  }
  onOkayClick() {
    if (this.withdrawForm.pristine) this.withdrawForm.markAllAsTouched();
    if (this.withdrawForm.invalid) return;

    var toSend = this.buildWithdrawal();

    let data = {
      data: toSend,
      newEntity: this.newEntity(),
    } as EditDialogData<WithdrawalListItem>;

    if (this.newEntity()) {
      this.withdrawService.createWithdraw(toSend).subscribe({
        next: (resp) => {
          toSend.documentId = resp.id;
          this.resetWithdrawal(this.withdrawObject());
          this.editApplied.emit(data);
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 400) {
            const error = (err.error as Array<any>).at(0).errorMessage;
            this.notifyValidationError(error);
          } else {
            this.notifyUnexpectedError('повторите попытку позже');
          }
        },
      });
    }

    // else {
    //   //todo: update supplement
    //   this.withdrawForm.updateSupplement(toSend).subscribe({
    //     next: (response) => {
    //       // no content here
    //       this.withdrawForm.reset();
    //       this.editApplied.emit(data);
    //     },
    //     error: (err) => {
    //       if (err.status === 400) {
    //         this.notifyValidationError(
    //           (err.error as Array<any>).at(0).errorMessage
    //         );
    //       } else {
    //         this.notifyUnexpectedError((err.error as Array<any>).at(0));
    //       }
    //     },
    //   });
    // }
  }
  onClear() {
    this.resetWithdrawal(this.withdrawObject());
  }
  onCancelClick() {
    this.withdrawForm.markAsUntouched();
    this.editCancelled.emit();
  }

  resetWithdrawal(s: WithdrawalListItem) {
    if (!s) return;

    let array = this.withdrawForm.get('resources') as FormArray;
    array.clear();

    this.withdrawForm.reset(s);

    const resGroups = s.resources.map((res) =>
      this.fb.group(<IResourceChangeListItem>res)
    );
    this.withdrawForm.setControl('resources', this.fb.array(resGroups));
    this.resourcesTable().renderRows();
  }

  validateDocument(
    control: AbstractControl
  ): Observable<ValidationErrors | null> {
    return of(null);

    if (!control.value) {
      return of(null);
    }

    // return of(control.value).pipe(
    //   // Delay processing to debounce user input
    //   // todo: not working just yet
    //   debounceTime(500),
    //   switchMap((name) =>
    //     this.withdrawService
    //       .isDocumentNameTaken(name, this.supplement().documentId)
    //       .pipe(
    //         map((response: boolean) =>
    //           response ? { isNameTaken: true } : null
    //         ),
    //         // Handle errors (e.g., network issues)
    //         catchError(() => of(null))
    //       )
    //   )
    // );
  }

  buildWithdrawal(): WithdrawalListItem {
    console.dir(this.withdrawForm.getRawValue());

    return this.withdrawForm.getRawValue() as WithdrawalListItem;

    // const supp = this.withdrawObject();
    // return {
    //   documentId: supp.documentId,
    //   // from form itself - it is source of truth in reactive forms; meh, its tedious to copy often
    //   documentNumber: this.documentNumber.value,
    //   supplyDate: this.supplyDate.value,
    //   // just yet
    //   resources: this.resources.map((x) => {
    //     const resId = x.get('resourceId').value;
    //     const unitId = x.get('measureUnitId').value;
    //     const res = {
    //       supplementId: x.get('supplementId').value,
    //       resourceId: resId,
    //       measureUnitId: unitId,
    //       quantity: x.get('quantity').value,
    //       measureUnit: this.cacheService.get_unit_name(unitId),
    //       resourceName: this.cacheService.get_resource_name(resId),
    //     } as IResourceChangeListItem;
    //     return res;
    //   }),
    // };
  }

  mapChangeListItems(items: IResourceChangeListItem[]): FormGroup[] {
    if (!items) return [];

    return items.map(
      (x, i) =>
        new FormGroup({
          entityId: new FormControl<number>(x.entityId),
          resourceId: new FormControl<number>(x.resourceId),
          measureUnitId: new FormControl<number>(x.measureUnitId),
          quantity: new FormControl<number>(x.quantity),
          resourceName: new FormControl<string>(x.resourceName),
          measureUnit: new FormControl<string>(x.measureUnit),
        })
    );
  }

  notifyValidationError(message: string) {
    this._snackBar.open('Ошибка валидации: ' + message, '', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error'],
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
