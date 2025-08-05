import {
  AfterViewInit,
  Directive,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import { MatOption, MatSelect } from '@angular/material/select';
import { Subscription } from 'rxjs';
import { IWorkingMeasureUnit } from '../objects/measure-units';
import { ISelectListItem } from '../objects/select-list-item';
import { FormControl, FormGroup } from '@angular/forms';

@Directive({
  selector: 'mat-option[selectAll]',
  standalone: true,
})
export class SelectAllDirective implements OnDestroy, OnChanges {
  @Input({ required: true }) allValues: ISelectListItem[] = [];
  private _matSelect = inject(MatSelect);
  private _matOption = inject(MatOption);
  private _subscriptions: Subscription[] = [];

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    const parentSelect = this._matSelect;
    const parentFormControl = parentSelect.ngControl.control;

    // For changing other option selection based on select all
    this._subscriptions.push(
      this._matOption.onSelectionChange.subscribe((ev) => {
        // todo: buggy - selects also control option
        if (ev.isUserInput) {
          if (ev.source.selected) {
            parentFormControl?.setValue(this.allValues.map((x) => x.id));
            this._matOption.select(false);
          } else {
            parentFormControl?.setValue([]);
            this._matOption.deselect(false);
          }
        }
      })
    );

    // For changing select all based on other option selection
    this._subscriptions.push(
      parentSelect.optionSelectionChanges.subscribe((v) => {
        if (v.isUserInput && v.source.value !== this._matOption.value) {
          if (!v.source.selected) {
            this._matOption.deselect(false);
          } else {
            if (parentFormControl?.value?.length === this.allValues.length) {
              this._matOption.select(false);
            }
          }
        }
      })
    );
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach((s) => s.unsubscribe());
  }
}
