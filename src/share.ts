import EasyModal from './index';
import { EasyModalHOC, EasyModalItem, Id } from './type';
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
  return (typeof id === 'string' && id !== '') || (typeof id === 'number' && !Number.isNaN(id));
}

export function isValidEasyHOC(object: any) {
  return object && (object as any).__typeof_easy_modal__ === EASY_MODAL_HOC_TYPE;
}

export function getModalId<P, V>(Modal: EasyModalHOC<P, V> | Id, id?: Id): Id {
  if (isValidId(Modal)) return Modal;

  if (!Modal[EASY_MODAL_ID]) Modal[EASY_MODAL_ID] = getUid(id);

  return Modal[EASY_MODAL_ID];
}

export function findModal<P, V>(Modal: EasyModalHOC<P, V> | Id) {
  if (isValidId(Modal) && MODAL_REGISTRY[Modal]) return MODAL_REGISTRY[Modal];

  const find = Object.values(MODAL_REGISTRY).find((item) => item.Component === (Modal as EasyModalHOC<P, V>));

  return find ? find : void 0;
}

export function getEasyHoc(Modal: EasyModalHOC<any, any> | Id, where: keyof typeof EasyModal) {
  let warnText = '';
  const id = getModalId(Modal);
  if (!isValidId(id)) warnText = `No id found in EasyModal.${where}`;

  const hoc = findModal(id);
  if (!hoc) warnText += '\n' + `No Component found in EasyModal.${where}.`;

  const get = Boolean(hoc);

  if (!get && warnText) console.warn(warnText + '\n' + 'It may have been pre-removed, which is allowed');

  return { id, hoc, get };
}
