export enum ClipboardItemType {
  VARIABLE_VALUE = 'VARIABLE_VALUE',
}

export interface ClipboardItem {
  type: ClipboardItemType;
  payload: any;
}
