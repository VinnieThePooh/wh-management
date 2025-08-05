import { ISelectListItem } from '../objects/select-list-item';

export class SupplementFilterState {
  resources: ISelectListItem[] = []; // might be cached
  measureUnits: ISelectListItem[] = []; // might be cached
  documents: ISelectListItem[] = []; // only last 100 + autocomplete will be
}
