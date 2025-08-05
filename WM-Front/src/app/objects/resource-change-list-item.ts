export interface IResourceChangeListItemRequest {
  entityId: number;
  supplementId: number;
  resourceId: number;
  measureUnitId: number;
  quantity: number;
}

// response
export interface IResourceChangeListItem
  extends IResourceChangeListItemRequest {
  resourceName: string;
  measureUnit: string;
}
