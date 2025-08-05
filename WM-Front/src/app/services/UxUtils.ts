import { MatDialogRef } from '@angular/material/dialog';

//todo: not working with afterClosed() event - result is undefined
export abstract class UxUtils {
  public static bindDialogActionToKeys(
    dialogRef: MatDialogRef<any>,
    okHandler: () => void,
    cancelHandler: () => void
  ) {
    dialogRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape') {
        cancelHandler();
      }
    });

    dialogRef.componentInstance;

    dialogRef.backdropClick().subscribe((event) => {
      cancelHandler();
    });
  }

  public static bindDialogActionToEnterKey(
    dialogRef: MatDialogRef<any>,
    okHandler: () => void
  ) {
    dialogRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Enter') {
        okHandler();
      }
    });
  }
}
