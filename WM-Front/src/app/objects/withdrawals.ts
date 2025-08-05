import {
  IResourceChangeListItem,
  IResourceChangeListItemRequest,
} from './resource-change-list-item';

export class WithdrawalListItemBase {
  documentId: number | null = null;
  documentNumber: string | null = null;
  withdrawalDate: Date | null = null;
  customerId: number | null;
  customerName: string | null;
  signed: boolean = false;
}

export class WithdrawalListItem extends WithdrawalListItemBase {
  resources: IResourceChangeListItem[] = [];
}

export class WithdrawalListItemRequest extends WithdrawalListItemBase {
  resources: IResourceChangeListItemRequest[] = [];
}
