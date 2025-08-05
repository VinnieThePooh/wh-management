export class SupplyFilter {
  dateBegin?: Date | null;
  dateEnd?: Date | null;
  documentIds?: number[] | null;
  resourceIds?: number[] | null; // might be cached
  measureUnitIds?: number[] | null; // might be cached
}
