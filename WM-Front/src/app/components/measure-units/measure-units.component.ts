import { Component, ViewChild } from '@angular/core';
import { ArchivedMeasureUnitsComponent } from '../archived-measure-units/archived-measure-units.component';
import { WorkingMeasureUnitsComponent } from '../working-measure-units/working-measure-units.component';
import { MatTab, MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';
import { Defaults } from '../../models/constants';

@Component({
  selector: 'app-measure-units',
  imports: [
    MatTabGroup,
    MatTab,
    ArchivedMeasureUnitsComponent,
    WorkingMeasureUnitsComponent,
  ],
  templateUrl: './measure-units.component.html',
  styleUrl: './measure-units.component.css',
})
export class MeasureUnitsComponent {
  @ViewChild(WorkingMeasureUnitsComponent)
  workingRes?: WorkingMeasureUnitsComponent;

  @ViewChild(ArchivedMeasureUnitsComponent)
  archivedRes?: ArchivedMeasureUnitsComponent;

  onTabChange($event: MatTabChangeEvent): void {
    if ($event.index === 0)
      this.workingRes!.updateDataSource(
        Defaults.PAGE_NUMBER,
        Defaults.PAGE_SIZE
      );

    if ($event.index === 1)
      this.archivedRes!.updateDataSource(
        Defaults.PAGE_NUMBER,
        Defaults.PAGE_SIZE
      );
  }
}
