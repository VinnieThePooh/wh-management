import {
  Component,
  computed,
  inject,
  input,
  OnChanges,
  OnInit,
  output,
  SimpleChanges,
  viewChild,
} from '@angular/core';
import {
  SupplementListItem,
  SupplementListItemRequest,
} from '../../../objects/supplements';
import {
  MatError,
  MatFormField,
  MatFormFieldModule,
  MatLabel,
} from '@angular/material/form-field';
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
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatMiniFabButton } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { SupplyService } from '../../../services/supply.service';
import { EditDialogData } from '../../dialogs/dialog-data';
import { catchError, debounceTime, map, Observable, of, switchMap } from 'rxjs';
import { MatTable, MatTableModule } from '@angular/material/table';
import { CacheService } from '../../../services/cache.service';
import {
  IResourceChangeListItem,
  IResourceChangeListItemRequest,
} from '../../../objects/resource-change-list-item';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { toObservable } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-edit-supplement',
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
  templateUrl: './edit-supplement.component.html',
  styleUrl: './edit-supplement.component.css',
})
export class EditSupplementComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private supplyService: SupplyService,
    private cacheService: CacheService
  ) {
    this.supplement$.subscribe((v) => {
      this.resetSupplement(v);
    });
  }

  private _snackBar = inject(MatSnackBar);
  readonly newEntity = input<boolean>();
  readonly supplement = input<SupplementListItem>();
  readonly supplement$ = toObservable(this.supplement);
  readonly resourcesTable = viewChild(MatTable);

  editApplied = output<EditDialogData<SupplementListItem>>();
  editCancelled = output();

  supplementForm: FormGroup<any> = new FormGroup({
    documentId: new FormControl<number | null>(this.supplement()?.documentId),
    documentNumber: new FormControl<string | null>(
      this.supplement()?.documentNumber,
      [Validators.required],
      [(ctrl) => this.validateDocument(ctrl)]
    ),
    supplyDate: new FormControl<Date | null>(this.supplement()?.supplyDate, [
      Validators.required,
    ]),
    resources: new FormArray(
      this.mapChangeListItems(this.supplement()?.resources)
    ),
  });
  displayedColumns = ['actions', 'resourceId', 'measureUnitId', 'quantity'];

  onOkayClick() {
    if (this.supplementForm.pristine) this.supplementForm.markAllAsTouched();
    if (this.supplementForm.invalid) return;

    var toSend = this.buildSupplement();

    let data = {
      data: toSend,
      newEntity: this.newEntity(),
    } as EditDialogData<SupplementListItem>;

    if (this.newEntity()) {
      this.supplyService.createSupplement(toSend).subscribe({
        next: (resp) => {
          toSend.documentId = resp.id;
          this.resetSupplement(this.supplement());
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
    } else {
      //todo: update supplement
      this.supplyService.updateSupplement(toSend).subscribe({
        next: (response) => {
          // no content here
          this.supplementForm.reset();
          this.editApplied.emit(data);
        },
        error: (err) => {
          if (err.status === 400) {
            this.notifyValidationError(
              (err.error as Array<any>).at(0).errorMessage
            );
          } else {
            this.notifyUnexpectedError((err.error as Array<any>).at(0));
          }
        },
      });
    }
  }
  onCancelClick() {
    this.supplementForm.markAsUntouched();

    console.log('Cancel clicked');

    this.editCancelled.emit();
  }

  get resources() {
    return (this.supplementForm.get('resources') as FormArray)?.controls;
  }

  get resource_list_items() {
    return this.cacheService.resources;
  }

  get units_list_items() {
    return this.cacheService.measure_units;
  }

  get title() {
    return this.newEntity
      ? 'Создание новой поставки'
      : 'Редактирование поставки';
  }

  updateErrorMessage() {
    // if (this.name.hasError('required')) {
    //   this.errorMessage.set('Обязательное поле');
    // } else if (this.name.hasError('nameExists')) {
    //   this.errorMessage.set('Ед.измерения с таким именем уже существует');
    // } else {
    //   this.errorMessage.set('');
  }

  ngOnInit(): void {
    console.log('Supplement edit OnInit called()');
  }

  // form controls properties
  get documentNumber() {
    return this.supplementForm.get('documentNumber');
  }

  get supplyDate() {
    return this.supplementForm.get('supplyDate');
  }

  updateSupplyDateError() {}

  updateDocNumberError() {}

  get supplyDateError() {
    if (this.supplyDate.hasError('required')) {
      return 'Дата поставки обязательна';
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

  onClear() {
    this.resetSupplement(this.supplement());
  }

  resetSupplement(s: SupplementListItem) {
    if (!s) return;

    let array = this.supplementForm.get('resources') as FormArray;
    array.clear();

    this.supplementForm.reset(s);

    const resGroups = s.resources.map((res) =>
      this.fb.group(<IResourceChangeListItemRequest>res)
    );
    this.supplementForm.setControl('resources', this.fb.array(resGroups));
    this.resourcesTable().renderRows();
  }

  buildSupplement(): SupplementListItem {
    console.dir(this.supplementForm.getRawValue());

    const supp = this.supplement();
    return {
      documentId: supp.documentId,
      // from form itself - it is source of truth in reactive forms; meh, its tedious to copy often
      documentNumber: this.documentNumber.value,
      supplyDate: this.supplyDate.value,
      // just yet
      resources: this.resources.map((x) => {
        const resId = x.get('resourceId').value;
        const unitId = x.get('measureUnitId').value;
        const res = {
          supplementId: x.get('supplementId').value,
          resourceId: resId,
          measureUnitId: unitId,
          quantity: x.get('quantity').value,
          measureUnit: this.cacheService.get_unit_name(unitId),
          resourceName: this.cacheService.get_resource_name(resId),
        } as IResourceChangeListItem;
        return res;
      }),
    };
  }

  validateDocument(
    control: AbstractControl
  ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    if (!control.value) {
      return of(null);
    }

    return of(control.value).pipe(
      // Delay processing to debounce user input
      // todo: not working just yet
      debounceTime(500),
      switchMap((name) =>
        this.supplyService
          .isDocumentNameTaken(name, this.supplement().documentId)
          .pipe(
            map((response: boolean) =>
              response ? { isNameTaken: true } : null
            ),
            // Handle errors (e.g., network issues)
            catchError(() => of(null))
          )
      )
    );
  }

  mapChangeListItems(items: IResourceChangeListItemRequest[]): FormGroup[] {
    if (!items) return [];

    return items.map(
      (x, i) =>
        new FormGroup({
          resourceId: new FormControl<number>(x.resourceId),
          measureUnitId: new FormControl<number>(x.measureUnitId),
          quantity: new FormControl<number>(x.quantity),
        })
    );
  }

  onAddRow() {
    let res = <FormArray>this.supplementForm.get('resources');
    this.supplement;
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
    console.dir(this.supplementForm);
    console.log('Res count: ' + res.controls.length);
  }

  onDeleteRow(resourceChange: FormGroup) {
    var raw = resourceChange.getRawValue() as IResourceChangeListItem;
    console.log('To delete: ' + JSON.stringify(raw));

    let array = this.supplementForm.get('resources') as FormArray;
    var index = array.controls.findIndex(
      (x) => x.get('supplementId').value === raw.supplementId
    );
    if (index > -1) {
      array.removeAt(index);
      this.resourcesTable().renderRows();
    }

    // console.log(
    //   'Form raw: ' + JSON.stringify(this.supplementForm.getRawValue())
    // );
    // console.log('Supplement: ' + JSON.stringify(this.supplement()));
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
