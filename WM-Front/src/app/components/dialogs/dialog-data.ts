export class EditDialogData<T> {
  data: T;
  cancelled: boolean = true;
  newEntity: boolean;

  constructor(data: T, newEntity: boolean = true) {}
}

export class DialogData<T> {
  data: T;
  cancelled: boolean = true;
  workingResource: boolean = true;

  constructor(data: T, working: boolean = true) {
    this.data = data;
    this.workingResource = working;
  }
}

export class RemoveDialogData<T> {
  data: T;
  cancelled: boolean = true;
  title: string;
  question: string;

  constructor(data: T, title: string, question: string) {
    this.data = data;
    this.title = title;
    this.question = question;
  }
}
