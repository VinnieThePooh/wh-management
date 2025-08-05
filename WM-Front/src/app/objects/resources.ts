import { ISelectListItem } from './select-list-item';

export interface IResource extends ISelectListItem {}

export interface IWorkingResource extends IResource {}

export interface IArchivedResource extends IResource {}
