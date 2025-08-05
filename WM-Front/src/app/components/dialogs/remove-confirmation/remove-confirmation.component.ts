import { Component, Inject, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
  MatDialogModule,
  MatDialogActions,
} from '@angular/material/dialog';
import { IWorkingResource } from '../../../objects/resources';
import { DialogData, RemoveDialogData } from '../dialog-data';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-remove-confirmation',
  imports: [
    MatDialogContent,
    MatDialogModule,
    MatDialogActions,
    MatDialogTitle,
    MatButton,
  ],
  templateUrl: './remove-confirmation.component.html',
  styleUrl: './remove-confirmation.component.css',
})
export class RemoveConfirmationComponent {
  readonly dialogRef = inject(MatDialogRef<RemoveConfirmationComponent>);
  title: string;
  question: string;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    private dialogData: RemoveDialogData<IWorkingResource>
  ) {
    this.title = dialogData.title;
    this.question = dialogData.question;
  }

  onCancelClick() {
    this.dialogRef.close(this.dialogData);
  }

  onOkayClick() {
    this.dialogData.cancelled = false;
    this.dialogRef.close(this.dialogData);
  }
}
