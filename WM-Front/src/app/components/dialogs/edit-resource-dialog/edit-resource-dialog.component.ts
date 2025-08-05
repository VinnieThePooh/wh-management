import { Component, Inject, inject, signal } from '@angular/core';
import {
  AsyncValidator,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { IWorkingResource } from '../../../objects/resources';
import { DialogData } from '../dialog-data';
import { UniqueResourceValidator } from '../../../services/async-validators';
import { merge } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ResourcesService } from '../../../services/resources.service';

@Component({
  selector: 'app-edit-resource-dialog',
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
  templateUrl: './edit-resource-dialog.component.html',
  styleUrl: './edit-resource-dialog.component.css',
})
export class EditResourceDialogComponent {
  readonly dialogRef = inject(MatDialogRef<EditResourceDialogComponent>);
  resource: IWorkingResource;
  asyncValidator: AsyncValidator;
  errorMessage = signal('');
  nameExists: boolean = false;
  name: FormControl;
  title: string;

  constructor(
    private resourceService: ResourcesService,
    @Inject(MAT_DIALOG_DATA) private dialogData: DialogData<IWorkingResource>
  ) {
    this.resource = dialogData.data!;

    // todo: make async validation on blur/before submit
    // but it currently not working now
    // this.asyncValidator = new UniqueResourceValidator(
    //   resourceService,
    //   this.resource.id
    // );
    // this.name = new FormControl(this.resource.name, { updateOn: 'blur' });
    // this.name.addValidators(Validators.required);
    // this.name.addAsyncValidators((c) => this.asyncValidator.validate(c));

    this.name = new FormControl(this.resource.name, [Validators.required]);
    this.asyncValidator = new UniqueResourceValidator(
      resourceService,
      this.resource.id
    );
    this.name.addAsyncValidators((v) => this.asyncValidator.validate(v));

    this.title =
      this.resource.id == 0 ? 'Создание ресурса' : 'Редактирование ресурса';
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
    if (this.resource.id == 0) {
      const isArchived = !this.dialogData.workingResource;

      this.resourceService.addNewResource(name, isArchived).subscribe({
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
      this.resource.name = name;
      this.resourceService.editResource(this.resource).subscribe({
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
      this.errorMessage.set('Ресурс с таким именем уже существует');
    } else {
      this.errorMessage.set('');
    }
  }
}
