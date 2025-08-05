import { Component, inject, Inject, signal } from '@angular/core';
import { IMeasureUnit } from '../../../objects/measure-units';
import {
  AsyncValidator,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MeasureUnitsService } from '../../../services/measure-units.service';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { DialogData } from '../dialog-data';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UniqueMeasureUnitValidator } from '../../../services/async-validators';
import { merge } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-edit-measure-unit-dialog',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
  ],
  templateUrl: './edit-measure-unit-dialog.component.html',
  styleUrl: './edit-measure-unit-dialog.component.css',
})
export class EditMeasureUnitDialogComponent {
  readonly dialogRef = inject(MatDialogRef<EditMeasureUnitDialogComponent>);
  measureUnit: IMeasureUnit;
  asyncValidator: AsyncValidator;
  errorMessage = signal('');
  nameExists: boolean = false;
  name: FormControl;
  title: string;

  constructor(
    private unitsService: MeasureUnitsService,
    @Inject(MAT_DIALOG_DATA) private dialogData: DialogData<IMeasureUnit>
  ) {
    this.measureUnit = dialogData.data!;
    this.name = new FormControl(this.measureUnit.name, [Validators.required]);
    (this.asyncValidator = new UniqueMeasureUnitValidator(
      unitsService,
      this.measureUnit.id
    )),
      this.name.addAsyncValidators(
        this.asyncValidator.validate.bind(this.asyncValidator)
      );
    this.title =
      this.measureUnit.id == 0
        ? 'Создание ед.измерения'
        : 'Редактирование единицы измерения';
    merge(this.name.statusChanges, this.name.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateErrorMessage());
  }

  onCancelClick() {
    this.dialogRef.close(this.dialogData);
  }

  onOkayClick() {
    if (this.name.invalid) return;

    const name = this.name.value;

    // create resource
    if (this.measureUnit.id == 0) {
      const isArchived = !this.dialogData.workingResource;

      this.unitsService.addNewUnit(name, isArchived).subscribe({
        next: (res) => {
          this.dialogData.cancelled = false;
          this.dialogData.data.id = res.id;
          this.dialogData.data.name = name;
          this.dialogRef.close(this.dialogData);
        },
        error: (err) => {
          //todo: snackbar or inside the form
          console.error(err.message);
        },
      });

      // update existing resource no matter what
    } else {
      this.measureUnit.name = name;
      this.unitsService.editResource(this.measureUnit).subscribe({
        next: (res) => {
          this.dialogData.cancelled = false;
          this.dialogRef.close(this.dialogData);
        },
        error: (err) => {
          //todo: snackbar or inside the form
          console.error(err.message);
        },
      });
    }
  }

  updateErrorMessage() {
    if (this.name.hasError('required')) {
      this.errorMessage.set('Обязательное поле');
    } else if (this.name.hasError('nameExists')) {
      this.errorMessage.set('Ед.измерения с таким именем уже существует');
    } else {
      this.errorMessage.set('');
    }
  }
}
