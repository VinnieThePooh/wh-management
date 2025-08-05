import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, Signal, WritableSignal } from '@angular/core';
import {
  AbstractControl,
  AsyncValidator,
  AsyncValidatorFn,
  ValidationErrors,
} from '@angular/forms';
import { catchError, debounceTime, map, Observable, of, switchMap } from 'rxjs';
import { ResourcesService } from './resources.service';
import { MeasureUnitsService } from './measure-units.service';
import { SupplyService } from './supply.service';

@Injectable({
  providedIn: 'root',
})
export class UniqueResourceValidator implements AsyncValidator {
  constructor(
    private resourceService: ResourcesService,
    @Inject(Number) private resourceId?: number | null
  ) {}

  validate(
    control: AbstractControl
  ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    // Return null for empty values (valid by default)
    if (!control.value) {
      return of(null);
    }

    return of(control.value).pipe(
      // Delay processing to debounce user input
      debounceTime(500),
      switchMap((name) =>
        this.resourceService.isResourceTaken(name, this.resourceId).pipe(
          map((response: boolean) => (response ? { nameExists: true } : null)),
          // Handle errors (e.g., network issues)
          catchError(() => of(null))
        )
      )
    );
  }
  registerOnValidatorChange?(fn: () => void): void {
    throw new Error('Method not implemented.');
  }
}

@Injectable({
  providedIn: 'root',
})
export class UniqueMeasureUnitValidator implements AsyncValidator {
  constructor(
    private unitsService: MeasureUnitsService,
    @Inject(Number) private unitId?: number | null
  ) {}

  validate(
    control: AbstractControl
  ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    // Return null for empty values (valid by default)
    if (!control.value) {
      return of(null);
    }

    return of(control.value).pipe(
      // Delay processing to debounce user input
      debounceTime(500),
      switchMap((name) =>
        this.unitsService.isUnitTaken(name, this.unitId).pipe(
          map((response: boolean) => (response ? { nameExists: true } : null)),
          // Handle errors (e.g., network issues)
          catchError(() => of(null))
        )
      )
    );
  }
  registerOnValidatorChange?(fn: () => void): void {
    throw new Error('Method not implemented.');
  }
}
