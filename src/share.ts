import { EasyModalHOC } from './type';

export const EASY_MODAL_ID = Symbol.for('easy_modal_id');
export const EASY_MODAL_HOC_TYPE: symbol = Symbol.for('easy_modal_hoc_type');
export const REACT_FORWARD_TYPE = Symbol.for('react.forward_ref');

export const MODAL_REGISTRY: Record<
  string,
  {
    props: any;
    Component: EasyModalHOC<any, any>;
  }
> = {};

let id = 0;
export const getUid = () => `_easy_modal_${id++}`;

export function isValidEasyHOC(object: any) {
  const is = object && (object as any).__typeof_easy_modal__ === EASY_MODAL_HOC_TYPE;

  if (!is) {
    throw new Error('Please use EasyModal.create(!!Your Component!!)! Otherwise, it cannot be destroyed correctly');
  }

  return is;
}
