import { Component, WritableSignal } from '@angular/core';
import { CustomersBase } from '../customers-base';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { CustomerListItem } from '../../../objects/customers';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-archived-customers',
  imports: [MatPaginatorModule, MatButtonModule, MatTableModule],
  templateUrl: './archived-customers.component.html',
  styleUrl: './archived-customers.component.css',
})
export class ArchivedCustomersComponent extends CustomersBase {
  public override updateDataSource(
    pageNumber: number,
    pageSize: number,
    loading?: WritableSignal<boolean>,
    loading_error?: WritableSignal<string | null>
  ): void {
    const [load, load_error] = this.ensureLoadingSet(loading, loading_error);

    this.customerService.getArchived(pageNumber, pageSize).subscribe({
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

  protected override customerFactory(
    source?: CustomerListItem
  ): CustomerListItem {
    if (source === undefined) {
      const customer = new CustomerListItem();
      customer.isArchived = true;
      return customer;
    }

    // just pass through
    return source;
  }

  fromArchive(customer: CustomerListItem) {
    this.setArchivedState(customer, false, 'Данные клиенты восстановлены');
  }
}
