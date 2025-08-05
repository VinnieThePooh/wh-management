export class BalanceListItemApi {
  balanceId: number;
  measureUnitId: number;
  resourceId: number;
  quantity: number;
}

export class BalanceListItem extends BalanceListItemApi {
  unitName: string;
  resourceName: string;
}
