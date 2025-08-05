import {
  IResourceChangeListItem,
  IResourceChangeListItemRequest,
} from './resource-change-list-item';

export class SupplementListItem {
  documentId: number | null = null;
  documentNumber: string | null = null;
  supplyDate: Date | null = null;
  resources: IResourceChangeListItem[] = [];
}

export class SupplementListItemRequest {
  documentId: number | null = null;
  documentNumber: string | null = null;
  supplyDate: Date | null = null;
  resources: IResourceChangeListItemRequest[] = [];
}
