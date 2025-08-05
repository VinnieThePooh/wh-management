import { Component, viewChild } from '@angular/core';
import { WorkingCustomersComponent } from './working-customers/working-customers.component';
import { ArchivedCustomersComponent } from './archived-customers/archived-customers.component';
import {
  MatTabChangeEvent,
  MatTabGroup,
  MatTabsModule,
} from '@angular/material/tabs';
import { Defaults } from '../../models/constants';

@Component({
  selector: 'app-customers',
  imports: [
    WorkingCustomersComponent,
    ArchivedCustomersComponent,
    MatTabsModule,
    MatTabGroup,
  ],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css',
})
export class CustomersComponent {
  workingCustomers = viewChild<WorkingCustomersComponent>(
    WorkingCustomersComponent
  );

  archivedCustomers = viewChild<ArchivedCustomersComponent>(
    ArchivedCustomersComponent
  );

  onTabChange($event: MatTabChangeEvent) {
    if ($event.index === 0)
      this.workingCustomers().updateDataSource(
        Defaults.PAGE_NUMBER,
        Defaults.PAGE_SIZE
      );

    if ($event.index === 1)
      this.archivedCustomers().updateDataSource(
        Defaults.PAGE_NUMBER,
        Defaults.PAGE_SIZE
      );
  }
}
