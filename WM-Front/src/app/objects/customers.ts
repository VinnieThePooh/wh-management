import { ISelectListItem } from './select-list-item';

// one model is enough for list-view and details view
export class CustomerListItem implements ISelectListItem {
  id: number | null = null;
  name: string | null = null;
  isArchived: boolean = false;
  address: string | null = null;
}
