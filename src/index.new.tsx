/* *********************************************************
 * Copyright 2023 raotaohub <raotao@outlook.com>
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 *********************************************************** */

import React, { useEffect, useContext, useReducer, useCallback } from 'react';
import { ForwardRefExoticComponent, PropsWithoutRef, RefAttributes } from 'react';

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

const initialConfig: ConfigContextProps = {
  resolveOnHide: true,
  removeOnHide: true,
};

let id = 0;
export const getUid = () => `_easy_modal_${id++}`;

const ModalContext = React.createContext<EasyModalItem[]>([]);
const ModalIdContext = React.createContext<string | null>(null);
const ConfigContext = React.createContext<ConfigContextProps>(initialConfig);

export function isValidEasyHOC(object: any) {
  const is = object && (object as any).__typeof_easy_modal__ === EASY_MODAL_HOC_TYPE;

  if (!is) {
    throw new Error('Please use EasyModal.create(Component)! Otherwise, it cannot be destroyed correctly');
  }

  return is;
}

export type ConfigContextProps = {
  resolveOnHide?: boolean;
  removeOnHide?: boolean;
};

type ModalPromise<V> = {
  resolve: (result?: V) => void;
  reject: (result?: V) => void;
};

type EasyModalItem<P = any, V = any> = {
  id: string;
  props?: P;
  visible?: boolean;
  promise?: ModalPromise<V>;
};
type innerDispatch = <P, V>(action: EasyModalAction<P, V>) => void;

type ActionPayload<P, V> = {
  id: string;
  props?: P;
  visible?: boolean;
  promise?: ModalPromise<V>;
};

type EasyModalAction<P = any, V = any> =
  | { type: 'easy_modal/show'; payload: ActionPayload<P, V> }
  | { type: 'easy_modal/hide'; payload: ActionPayload<P, V> }
  | { type: 'easy_modal/remove'; payload: ActionPayload<P, V> };

// type Get Generics Type
type NoVoidValue<T> = T extends void ? never : T; /* if else */
type BuildFnInterfaceCheck<T> = NoVoidValue<T> extends never ? () => void : (result: T) => void;
type ModalResolveType<V> = NoVoidValue<V> extends never
  ? never
  : V extends InnerModalProps<infer Result>
  ? Result
  : never;

// Easy Modal Inner Props
export type InnerModalProps<V = never> = {
  id: string;
  visible: boolean;
  hide: BuildFnInterfaceCheck<V>;
  resolve: BuildFnInterfaceCheck<V>;
  reject: BuildFnInterfaceCheck<V>;
  remove: () => void;
};

type ModalProps<P, V> = Omit<P, keyof InnerModalProps<V>>;

interface NormalModal<P, V> {
  (props: P & InnerModalProps<V>): JSX.Element;
}

type WithRefModal<P, V, R> = ForwardRefExoticComponent<PropsWithoutRef<P & InnerModalProps<V>> & RefAttributes<R>>;

// type isNever<T> = [T] extends [never] ? true : false;
// type IsEqual<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

// export type EasyModalHOC<P = any, V = any, R = any> = NormalModal<P, V> & {
//   [EASY_MODAL_ID]?: string;
//   __typeof_easy_modal__?: symbol;
// } & (isNever<R> extends false ? ModalProps<P, V> : WithRefModal<P, V, R>);

// export interface EasyModalHOC<P, V, R> extends NormalModal<P, V> {
//   [EASY_MODAL_ID]?: string;
//   __typeof_easy_modal__?: symbol;
// }

// export interface EasyModalHOC<P, V, R> {
//   [EASY_MODAL_ID]?: string;
//   __typeof_easy_modal__?: symbol;
//   (): R extends never ? NormalModal<P, V> : WithRefModal<P, V, R>;
// }
// extends NormalModal<P, V>

interface EasyModalHOC<P, V> extends NormalModal<P, V>, ModalBase {}

interface EasyModalRefHOC<P, V, R> extends WithRefModal<P, V, R>, ModalBase {}

interface ModalBase {
  [EASY_MODAL_ID]?: string;
  __typeof_easy_modal__?: symbol;
}

type HOC<P = any, V = any, R = any> = R extends never ? EasyModalHOC<P, V> : EasyModalRefHOC<P, V, R>;

let dispatch: innerDispatch = () => {
  throw new Error('No dispatch method detected, did you embed your app with EasyModal.Provider?');
};

function reducer<P, V>(state: EasyModalItem<P, V>[], action: EasyModalAction<P, V>): EasyModalItem<P, V>[] {
  switch (action.type) {
    case 'easy_modal/show': {
      const { id } = action.payload;
      const newState = [...state];
      const index = newState.findIndex((v) => v.id === id);

      if (index > -1) {
        newState[index] = {
          ...newState[index],
          ...action.payload,
          visible: true,
        };
      } else {
        newState.push({
          ...action.payload,
          visible: true,
        });
      }

      return newState;
    }
    case 'easy_modal/hide': {
      const { id } = action.payload;
      const newState = [...state];
      const index = newState.findIndex((v) => v.id === id);

      newState[index] = {
        ...newState[index],
        ...action.payload,
        visible: false,
      };

      return newState;
    }
    case 'easy_modal/remove': {
      const { id } = action.payload;
      const newState = [...state];
      const index = newState.findIndex((v) => v.id === id);
      newState.splice(index, 1);

      return newState;
    }
    default:
      return state;
  }
}

function showModal<P = any, V = any>(id: string, props: ModalProps<P, V>, promise: ModalPromise<V>): EasyModalAction {
  return {
    type: 'easy_modal/show',
    payload: {
      id,
      props,
      promise,
    },
  };
}

function hideModal(id: string): EasyModalAction {
  return {
    type: 'easy_modal/hide',
    payload: {
      id,
    },
  };
}

function removeModal(id: string): EasyModalAction {
  return {
    type: 'easy_modal/remove',
    payload: {
      id,
    },
  };
}

const getModalId = <P, V>(Modal: HOC<P, V> | string): string => {
  if (typeof Modal === 'string') return Modal as string;

  if (!Modal[EASY_MODAL_ID]) Modal[EASY_MODAL_ID] = getUid();

  return Modal[EASY_MODAL_ID];
};

function findModal<P, V, R>(Modal: HOC<P, V, R> | string) {
  if (typeof Modal === 'string' && MODAL_REGISTRY[Modal]) {
    return MODAL_REGISTRY[Modal].Component;
  }

  const find = Object.values(MODAL_REGISTRY).find((item) => item.Component === (Modal as HOC<P, V, R>));

  return find ? find.Component : void 0;
}

function create<P extends ModalProps<P, V>, V = ModalResolveType<P>>(Comp: NormalModal<P, V>): HOC<P, V>;

function create<
  P extends ModalProps<P, V>,
  V = ModalResolveType<P>,
  R = unknown,
  // R extends 'ref' extends keyof P ? Pick<P, 'ref'> : never = 'ref' extends keyof P ? Pick<P, 'ref'> : never,
>(Comp: NormalModal<P, V> | WithRefModal<P, V, R>): HOC<P, V, R>;

function create<P extends ModalProps<P, V>, V, R>(Comp: NormalModal<P, V> | WithRefModal<P, V, R>): unknown {
  const isForward = (Comp as WithRefModal<P, V, R>).$$typeof === REACT_FORWARD_TYPE;

  const EasyModalHOCWrapper = isForward
    ? ({ ..._props }) => {
        const { id, props, promise, ...innerProps } = useModal(_props.id);
        const { removeOnHide } = useContext(ConfigContext);

        useEffect(() => {
          return () => {
            removeOnHide && delete MODAL_REGISTRY[id];
          };
        }, [id, removeOnHide]);

        return (
          <ModalIdContext.Provider value={id}>
            <Comp
              id={id}
              ref={isForward ? _props.ref : undefined}
              {...(props as P)}
              {...(promise as any)}
              {...(innerProps as any)}
            />
          </ModalIdContext.Provider>
        );
      }
    : ({ ..._props }) => {
        const { id, props, promise, ...innerProps } = useModal(_props.id);
        const { removeOnHide } = useContext(ConfigContext);

        useEffect(() => {
          return () => {
            removeOnHide && delete MODAL_REGISTRY[id];
          };
        }, [id, removeOnHide]);

        return (
          <ModalIdContext.Provider value={id}>
            <Comp id={id} {...(props as P)} {...(promise as any)} {...(innerProps as any)} />
          </ModalIdContext.Provider>
        );
      };

  (EasyModalHOCWrapper as ModalBase).__typeof_easy_modal__ = EASY_MODAL_HOC_TYPE;

  // if ((Comp as WithRefModal<P, V, R>).$$typeof === REACT_FORWARD_TYPE) return EasyModalHOCWrapper as HOC<P, V, R>;

  return EasyModalHOCWrapper as unknown as HOC<P, V, R>;
}

function register<P, V, R>(id: string, Modal: HOC<P, V, R>, props: ModalProps<P, V>) {
  if (!MODAL_REGISTRY[id]) {
    MODAL_REGISTRY[id] = { Component: Modal, props };
  }
}

function show<P extends ModalProps<P, V>, V extends ModalResolveType<P> = ModalResolveType<P>>(
  Modal: NormalModal<P, V>,
  props: ModalProps<P, V>,
): Promise<V>;

function show<
  P extends ModalProps<P, V>,
  V extends ModalResolveType<P> = ModalResolveType<P>,
  // R,
  // R extends 'ref' extends keyof P ? Pick<P, 'ref'> : never = 'ref' extends keyof P ? Pick<P, 'ref'> : never,
  // R extends 'ref' extends keyof P ? Ref<Pick<P, 'ref'>> : never = 'ref' extends keyof P ? Ref<Pick<P, 'ref'>> : never,
  R extends Omit<ModalProps<P, V>, 'ref'> = Omit<ModalProps<P, V>, 'ref'>,
>(Modal: WithRefModal<P, V, R>, props: ModalProps<P, V>): Promise<V>;

function show<
  P extends ModalProps<P, V>,
  V extends ModalResolveType<P> = ModalResolveType<P>,
  // R,
  // R extends 'ref' extends keyof P ? Pick<P, 'ref'> : never = 'ref' extends keyof P ? Pick<P, 'ref'> : never,
  // R extends 'ref' extends keyof P ? Ref<Pick<P, 'ref'>> : never = 'ref' extends keyof P ? Ref<Pick<P, 'ref'>> : never,
  // R extends Pick<InnerModalProps & { ref: unknown }, 'ref'> = Pick<InnerModalProps & { ref: unknown }, 'ref'>,
  R extends Omit<ModalProps<P, V>, 'ref'> = Omit<ModalProps<P, V>, 'ref'>,
>(Modal: NormalModal<P, V> | WithRefModal<P, V, R>, props: ModalProps<P, V>) {
  // Check & Create
  const _Modal = create<P, V, R>(Modal);
  /* `as` tell ts that _Modal's type */

  // Find & Register
  const id = getModalId<P, V>(_Modal);
  const find = findModal<P, V, R>(_Modal) ?? findModal<P, V, R>(id);
  if (!find) register<P, V, R>(id, _Modal, props);

  // Promise Control
  // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html#non-null-assertion-operator
  let theResolve!: (result?: V) => void;
  let theReject!: (result?: V) => void;

  const promise = new Promise<V>((resolve, reject) => {
    theResolve = resolve as typeof theResolve;
    theReject = reject;
  });

  const modalPromise: ModalPromise<V> = {
    resolve: theResolve,
    reject: theReject,
  };

  dispatch<P, V>(showModal<P, V>(id, props, modalPromise));
  /* Think Return More */
  return promise;
}

function hide<P, V>(Modal: HOC<P, V> | string) {
  const id = getModalId<P, V>(Modal);
  dispatch<P, V>(hideModal(id));
}

function remove<P, V>(Modal: HOC<P, V> | string) {
  const id = getModalId<P, V>(Modal);
  dispatch<P, V>(removeModal(id));
  delete MODAL_REGISTRY[id];
}

export function useModal<
  P extends ModalProps<P, V>,
  V extends ModalResolveType<P> = ModalResolveType<P>,
  R extends 'ref' extends keyof P ? Pick<P, 'ref'> : never = 'ref' extends keyof P ? Pick<P, 'ref'> : never,
  // R extends Pick<InnerModalProps & { ref: unknown }, 'ref'> = Pick<InnerModalProps & { ref: unknown }, 'ref'>,
>(id?: string) {
  const modals = useContext(ModalContext);
  const contextModalId = useContext(ModalIdContext);

  if (id && typeof id !== 'string' && (id as EasyModalHOC<P, V>).__typeof_easy_modal__ === EASY_MODAL_HOC_TYPE) {
    //...
  }

  const { removeOnHide, resolveOnHide } = useContext(ConfigContext);

  if (!id) id = contextModalId as string;
  if (!id) throw new Error('No modal id found in EasyModal.useModal.');

  const modalInfo = modals.find((t) => t.id === id) as EasyModalItem<P, V>;
  if (!modalInfo) throw new Error('No modalInfo found in EasyModal.useModal.');

  const modalId: string = id;

  const hideCallback: BuildFnInterfaceCheck<V> = useCallback(
    (result?: V) => {
      hide(modalId);
      removeOnHide && remove(modalId);
      resolveOnHide && modalInfo?.promise?.resolve(result);
    },
    [modalId, modalInfo.promise, removeOnHide, resolveOnHide],
  );

  const removeCallback = useCallback(() => {
    remove(modalId);
  }, [modalId]);

  return {
    hide: hideCallback,
    remove: removeCallback,
    ref: (modalInfo as any)?.ref as R,
    ...modalInfo,
  };
}

const EasyModalPlaceholder: React.FC = () => {
  const modals = useContext(ModalContext);
  const { removeOnHide } = useContext(ConfigContext);

  const visibleModals = modals.filter(
    (item) => !!item.visible || !removeOnHide /* If you do not want to destroy, keep on the tree */,
  );

  const toRender = visibleModals.map((item) => {
    return {
      id: item.id,
      Component: MODAL_REGISTRY[item.id].Component,
    };
  });

  return (
    <>
      {toRender.map((item) => (
        //! Render HOC & Just Inject Id
        <item.Component key={item.id} id={item.id} />
      ))}
    </>
  );
};

const Provider: React.FC<React.PropsWithChildren<Record<keyof any, any>>> = ({ children }) => {
  const arr = useReducer(reducer, []);
  const modals = arr[0];
  function innerDispatch<P, V>(action: EasyModalAction<P, V>) {
    (arr[1] as React.Dispatch<EasyModalAction<P, V>>)(action);
  }
  dispatch = innerDispatch;

  return (
    <ModalContext.Provider value={modals}>
      {children}
      <EasyModalPlaceholder />
    </ModalContext.Provider>
  );
};

const ConfigProvider: React.FC<ConfigContextProps> = ({ children, ...props }) => {
  let resolveOnHide = initialConfig.resolveOnHide;
  let removeOnHide = initialConfig.removeOnHide;

  if (typeof props.resolveOnHide !== 'undefined' && !props.resolveOnHide) resolveOnHide = false;
  if (typeof props.removeOnHide !== 'undefined' && !props.removeOnHide) removeOnHide = false;

  return (
    <ConfigContext.Provider
      value={{
        resolveOnHide,
        removeOnHide,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

// export const antdModalV4 = <P extends ModalProps<P, V>, V extends ModalResolveType<P> = ModalResolveType<P>>(
//   modal: ReturnType<typeof useModal<P, V>>,
//   args?: V,
// ): { visible: boolean; onCancel: () => void; onOk: () => void } => {
//   return {
//     visible: modal.visible,
//     onOk: () => modal.hide(args || null),
//     onCancel: () => modal.hide(null),
//   };
// };

// export const antdModalV5 = <P extends ModalProps<P, V>, V extends ModalResolveType<P> = ModalResolveType<P>>(
//   modal: ReturnType<typeof useModal<P, V>>,
//   args?: V,
// ): { open: boolean; onCancel: () => void; onOk: () => void } => {
//   return {
//     open: modal.visible,
//     onOk: () => modal.hide(args || null),
//     onCancel: () => modal.hide(null),
//   };
// };

const EasyModal = {
  Provider,
  ModalContext,
  ConfigProvider,
  create,
  show,
  hide,
  remove,
  useModal,
};

export default EasyModal;
