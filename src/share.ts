import { Id, EasyModalHOC, EasyModalItem } from './type';
export const EASY_MODAL_ID = Symbol.for('easy_modal_id');
export const EASY_MODAL_HOC_TYPE: symbol = Symbol.for('easy_modal_hoc_type');
export const REACT_FORWARD_TYPE = Symbol.for('react.forward_ref');

export const MODAL_REGISTRY: Record<
  Id,
  {
    Component: EasyModalHOC<any, any>;
  } & Partial<EasyModalItem>
> = {};

let _id = 0;
export const getUid = (id?: Id): Id => {
  if (isValidId(id)) return id;
  return `_easy_modal_${_id++}_`;
};

export function isValidId(id: any): id is Id {
  return (typeof id === 'string' && id !== '') || typeof id === 'number';
}

export function isValidEasyHOC(object: any) {
  return object && (object as any).__typeof_easy_modal__ === EASY_MODAL_HOC_TYPE;
}
