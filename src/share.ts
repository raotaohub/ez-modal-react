import type { EasyModalHOC, Id } from './type';

export const EASY_MODAL_ID = Symbol.for('easy_modal_id');
export const EASY_MODAL_HOC_TYPE = Symbol.for('easy_modal_hoc_type');
export const REACT_FORWARD_TYPE = Symbol.for('react.forward_ref');

let idSeed = 0;

export const getUid = (id?: Id): Id => {
  if (isValidId(id)) return id;
  return `_easy_modal_${idSeed++}_`;
};

export function isValidId(id: unknown): id is Id {
  return (typeof id === 'string' && id !== '') || (typeof id === 'number' && !Number.isNaN(id));
}

export function isValidEasyHOC(object: unknown): object is EasyModalHOC<any, any> {
  return Boolean(object && (object as EasyModalHOC<any, any>).__typeof_easy_modal__ === EASY_MODAL_HOC_TYPE);
}

export function getModalId<P, V>(Modal: EasyModalHOC<P, V> | Id, id?: Id): Id {
  if (isValidId(Modal)) return Modal;

  if (!isValidId(Modal[EASY_MODAL_ID])) Modal[EASY_MODAL_ID] = getUid(id);

  return Modal[EASY_MODAL_ID] as Id;
}
