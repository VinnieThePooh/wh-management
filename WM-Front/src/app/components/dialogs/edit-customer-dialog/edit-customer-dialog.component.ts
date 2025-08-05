import { AfterViewInit, Component, inject, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { EditDialogData } from '../dialog-data';
import { CustomerListItem } from '../../../objects/customers';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { catchError, debounceTime, map, Observable, of, switchMap } from 'rxjs';
import { CustomerService } from '../../../services/customer.service';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-edit-customer-dialog',
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatLabel,
    MatFormField,
  ],
  templateUrl: './edit-customer-dialog.component.html',
  styleUrl: './edit-customer-dialog.component.css',
})
export class EditCustomerDialogComponent {
  readonly _dialogRef = inject(MatDialogRef<EditCustomerDialogComponent>);
  readonly dialogData = inject(
    MAT_DIALOG_DATA
  ) as EditDialogData<CustomerListItem>;

  customerForm = new FormGroup({
    id: new FormControl<number | null>(null),
    name: new FormControl<string | null>(
      null,
      [Validators.required],
      [(control) => this.validateName(control)]
    ),
    isArchived: new FormControl<boolean>(false),
    address: new FormControl<string | null>(null, [Validators.maxLength(400)]),
  });

  constructor(private customerService: CustomerService) {
    this.customerForm.reset(this.dialogData.data);
  }

  onOkayClick() {
    if (this.customerForm.invalid) return;

    if (this.isNewEntity) {
      this.customerService.addNewCustomer(this.editableCustomer).subscribe({
        next: (res) => {
          Object.assign(this.dialogData.data, this.editableCustomer);
          this.dialogData.data.id = res.id;
          this.dialogData.cancelled = false;
          this._dialogRef.close(this.dialogData);
        },
        error: (err) => {
          //todo: snackbar or inside the form
          console.error(err.message);
        },
      });
    } else {
      this.customerService.editCustomer(this.editableCustomer).subscribe({
        next: (res) => {
          // only ref replacing works well with change detection by default
          this.dialogData.data = this.editableCustomer;
          this.dialogData.cancelled = false;
          this._dialogRef.close(this.dialogData);
        },
        error: (err) => {
          //todo: snackbar or inside the form
          console.error(err.message);
        },
      });
    }
  }

  onCancelClick() {
    this.dialogData.cancelled = true;
    this._dialogRef.close(this.dialogData);
  }

  get title() {
    return this.dialogData?.newEntity
      ? 'Создание новой записи'
      : 'Редактирование записи';
  }

  get name() {
    return this.customerForm.get('name');
  }

  get address() {
    return this.customerForm.get('address');
  }

  get customerId() {
    return this.customerForm.get('id').value;
  }

  get isNewEntity() {
    return this.dialogData.newEntity;
  }

  get editableCustomer() {
    return this.customerForm.getRawValue() as CustomerListItem;
  }

  validateName(control: AbstractControl): Observable<ValidationErrors | null> {
    if (!control.value || control.value.length < 3) {
      return of(null);
    }

    return of(control.value).pipe(
      // Delay processing to debounce user input
      // todo: not working just yet
      debounceTime(500),
      switchMap((name) =>
        this.customerService.isNameTaken(name, this.customerId).pipe(
          map((response: boolean) => (response ? { isNameTaken: true } : null)),
          // Handle errors (e.g., network issues)
          catchError(() => of(null))
        )
      )
    );
  }

  nameError() {
    if (this.name.hasError('required')) {
      return 'Имя обязательно';
    }

    if (this.name.hasError('isNameTaken')) {
      return 'Клиент с таким именем уже существует';
    }

    return '';
  }

  addressError() {
    if (this.address.hasError('maxlength')) {
      return 'Максимальное число символов в 400';
    }
    return '';
  }
}
