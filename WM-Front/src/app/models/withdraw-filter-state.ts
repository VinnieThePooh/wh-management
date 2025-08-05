import { ISelectListItem } from '../objects/select-list-item';

export class WithdrawFilterState {
  resources: ISelectListItem[] = [];
  measureUnits: ISelectListItem[] = [];
  documents: ISelectListItem[] = [];
  customers: ISelectListItem[] = [];
}
