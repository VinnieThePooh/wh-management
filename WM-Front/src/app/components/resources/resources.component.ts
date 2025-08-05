import { Component, inject, ViewChild } from '@angular/core';
import { MatTab, MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';
import { ArchivedResourcesComponent } from '../archived-resources/archived-resources.component';
import { WorkingResourcesComponent } from '../working-resources/working-resources.component';
import { Defaults } from '../../models/constants';

@Component({
  selector: 'app-resources',
  imports: [
    MatTabGroup,
    MatTab,
    ArchivedResourcesComponent,
    WorkingResourcesComponent,
  ],
  templateUrl: './resources.component.html',
  styleUrl: './resources.component.css',
})
export class ResourcesComponent {
  @ViewChild(WorkingResourcesComponent)
  workingRes?: WorkingResourcesComponent;

  @ViewChild(ArchivedResourcesComponent)
  archivedRes?: ArchivedResourcesComponent;

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
