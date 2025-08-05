import { Routes } from '@angular/router';
import { ResourcesComponent } from './components/resources/resources.component';
import { MeasureUnitsComponent } from './components/measure-units/measure-units.component';
import { SupplemmentsListComponent } from './components/supplements/supplements-list.component';
import { CustomersComponent } from './components/customers/customers.component';
import { BalancesComponent } from './components/balances/balances.component';
import { WithdrawalsListComponent } from './components/withdrawals/withdrawals-list.component';

export const routes: Routes = [
  { path: '', redirectTo: 'resources', pathMatch: 'full' },
  { path: 'supplements', component: SupplemmentsListComponent },
  { path: 'resources', component: ResourcesComponent },
  { path: 'measure-units', component: MeasureUnitsComponent },
  { path: 'withdrawals', component: WithdrawalsListComponent },
  { path: 'customers', component: CustomersComponent },
  { path: 'balances', component: BalancesComponent },
];
