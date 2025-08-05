import { Component, OnInit, WritableSignal } from '@angular/core';
import { CustomersBase } from '../customers-base';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { CustomerListItem } from '../../../objects/customers';
import { Defaults } from '../../../models/constants';
import { EditCustomerDialogComponent } from '../../dialogs/edit-customer-dialog/edit-customer-dialog.component';
import { EditDialogData } from '../../dialogs/dialog-data';
import { UxUtils } from '../../../services/UxUtils';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-working-customers',
  imports: [MatPaginatorModule, MatButtonModule, MatTableModule],
  templateUrl: './working-customers.component.html',
  styleUrl: './working-customers.component.css',
})
export class WorkingCustomersComponent extends CustomersBase implements OnInit {
  ngOnInit(): void {
    this.updateDataSource(Defaults.PAGE_NUMBER, Defaults.PAGE_SIZE);
  }

  public override updateDataSource(
    pageNumber: number,
    pageSize: number,
    loading?: WritableSignal<boolean>,
    loading_error?: WritableSignal<string | null>
  ) {
    const [load, load_error] = this.ensureLoadingSet(loading, loading_error);

    this.customerService.getWorking(pageNumber, pageSize).subscribe({
      next: (res) => {
        this.paginationModel = res;
        this.dataSource.data = res.pageData;
        this.total_count.set(res.totalCount);
        this.hasData.set(!!res.pageData.length);
        load.set(false);
      },
      error: (err) => {
        //todo: notify user here OR rethrow
        load_error.set(err.status);
      },
    });
  }

  toArchive(customer: CustomerListItem) {
    this.setArchivedState(customer, true, 'Данные клиента перенесены в архив');
  }

  protected override customerFactory(
    source?: CustomerListItem
  ): CustomerListItem {
    if (source === undefined) return new CustomerListItem();

    // just pass through
    return source;
  }
}
