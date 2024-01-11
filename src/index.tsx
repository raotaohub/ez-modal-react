/* *********************************************************
 * Copyright 2023 raotaohub <raotao@outlook.com>
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 *********************************************************** */

import React, { useCallback, useContext, useMemo, useReducer, useRef } from 'react';
import usage, { HowUse } from './howUse';
import {
  EASY_MODAL_HOC_TYPE,
  findModal,
  getEasyHoc,
  getModalId,
  isValidEasyHOC,
  isValidId,
  MODAL_REGISTRY,
} from './share';
import type {
  EasyModalAction,
  EasyModalHOC,
  EasyModalItem,
  GenerateTypeInfer,
  Id,
  innerDispatch,
  InnerModalProps,
  ModalPromise,
  ModalProps,
  ModalResolveType,
} from './type';
export * from './type';

const ModalContext = React.createContext<EasyModalItem[]>([]);
const ModalIdContext = React.createContext<Id | null>(null);

let dispatch: innerDispatch = () => {
  throw new Error(usage(HowUse.dispatch));
};

function reducer<P, V>(state: EasyModalItem<P, V>[], action: EasyModalAction<P, V>): EasyModalItem<P, V>[] {
  const { id, ...rest } = action.payload;
  const newState = [...state];
  const index = newState.findIndex((v) => v.id === id);

  if (MODAL_REGISTRY[id]) Object.assign(MODAL_REGISTRY[id], { ...rest });

  switch (action.type) {
    case 'easy_modal/show': {
      if (index > -1) {
        newState[index] = {
          ...newState[index],
          ...action.payload,
        };
      } else {
        newState.push({
          ...newState[index],
          ...action.payload,
        });
      }
      break;
    }

    case 'easy_modal/update': {
      newState[index] = {
        ...newState[index],
        ...action.payload,
      };
      break;
    }

    case 'easy_modal/hide': {
      newState[index] = {
        ...newState[index],
        ...action.payload,
      };
      break;
    }

    case 'easy_modal/remove': {
      newState.splice(index, 1);
      delete MODAL_REGISTRY[id];
      break;
    }
  }
  return newState;
}

function showModal<P = any, V = any>(
  id: Id,
  props: ModalProps<P, V>,
  promise: ModalPromise<V>,
  config: EasyModalItem<P, V>['config'],
): EasyModalAction {
  return {
    type: 'easy_modal/show',
    payload: {
      id,
      props,
      promise,
      config,
      visible: true,
    },
  };
}

function updateModal<P = any, V = any>(id: Id, props: ModalProps<P, V>): EasyModalAction {
  return {
    type: 'easy_modal/update',
    payload: {
      id,
      props,
    },
  };
}

function hideModal(id: Id): EasyModalAction {
  return {
    type: 'easy_modal/hide',
    payload: {
      id,
      visible: false,
    },
  };
}

function removeModal(id: Id): EasyModalAction {
  return {
    type: 'easy_modal/remove',
    payload: {
      id,
    },
  };
}

function create<P extends ModalProps<P, V> = InnerModalProps, V = ModalResolveType<P>>(
  Comp: React.ComponentType<P>,
  single = true,
): EasyModalHOC<P, V> {
  if (!Comp) throw new Error(usage(HowUse.create));
  const EasyModalHOCWrapper: EasyModalHOC<P, V> = ({ id }) => {
    const inject = useModal<P>(id);

    EasyModalHOCWrapper.displayName = 'EasyModalHOCWrapper' + id;

    return (
      <ModalIdContext.Provider value={id}>
        <Comp {...inject} />
      </ModalIdContext.Provider>
    );
  };

  EasyModalHOCWrapper.__typeof_easy_modal__ = EASY_MODAL_HOC_TYPE;
  EasyModalHOCWrapper.__easy_modal_is_single__ = single;
  return EasyModalHOCWrapper;
}

function register<P, V>(id: Id, Modal: EasyModalHOC<P, V>, props: ModalProps<P, V>) {
  if (!MODAL_REGISTRY[id]) {
    MODAL_REGISTRY[id] = { Component: Modal, props, id };
  }
}

function show<P extends ModalProps<P, V>, V extends ModalResolveType<P> = ModalResolveType<P>>(
  Modal: EasyModalHOC<P, V>,
  props: ModalProps<P, V> = {} as any,
  config: EasyModalItem<P, V>['config'] = {},
) {
  // Default config
  config.resolveOnHide = config.resolveOnHide ?? true;
  config.id = config.id ?? '';

  // Check & Create
  const _Modal = (isValidEasyHOC(Modal) ? Modal : create<P, V>(Modal as React.ComponentType<P>, false)) as EasyModalHOC<
    P,
    V
  >; /* `as` tell ts that _Modal's type */

  // Find & Register
  const id = getModalId<P, V>(_Modal, config.id);
  const find = findModal<P, V>(_Modal) ?? findModal<P, V>(id);
  if (!find) register<P, V>(id, _Modal, props);

  // Promise Control
  // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html#non-null-assertion-operator
  let theResolve!: GenerateTypeInfer<V>;
  let theReject!: (reason: unknown) => void;

  const promise = new Promise<V>((resolve, reject) => {
    theResolve = resolve as typeof theResolve;
    theReject = reject;
  });

  const modalPromise: ModalPromise<V> = {
    resolve: theResolve,
    reject: theReject,
  };

  dispatch<P, V>(showModal<P, V>(id, props, modalPromise, config));
  /* Think Return More */
  return promise;
}

function update<P extends ModalProps<P, V>, V extends ModalResolveType<P> = ModalResolveType<P>>(
  ModalOrId: EasyModalHOC<P, V> | Id,
  props: Partial<ModalProps<P, V>> = {} as any,
) {
  if (!isValidEasyHOC(ModalOrId) && !isValidId(ModalOrId)) return console.warn(usage(HowUse.update));

  const { id, get } = getEasyHoc(ModalOrId, 'update');
  if (!get) return;

  const originProps = MODAL_REGISTRY[id]?.props || {};
  dispatch<P, V>(updateModal<P, V>(id, { ...originProps, ...props }));
}

function hide<P, V>(Modal: EasyModalHOC<P, V> | Id, result?: V | null) {
  const { id, hoc, get } = getEasyHoc(Modal, 'hide');
  if (!get) return;

  dispatch<P, V>(hideModal(id));

  if (hoc?.config?.resolveOnHide) hoc.promise?.resolve(result);

  /* if not single EasyModalHOC, after hide remove it */
  if (!hoc?.Component.__easy_modal_is_single__) {
    setTimeout(() => remove(id), 300);
  }
}

function remove<P, V>(Modal: EasyModalHOC<P, V> | Id) {
  const { id, get } = getEasyHoc(Modal, 'remove');
  if (!get) return;

  dispatch<P, V>(removeModal(id));
}

export function useModal<P extends ModalProps<P, V>, V extends ModalResolveType<P> = ModalResolveType<P>>(id?: Id) {
  const modals = useContext(ModalContext);
  const contextModalId = useContext(ModalIdContext);

  if (!id) id = contextModalId as Id;
  if (!id) throw new Error('No modal id found in EasyModal.useModal.');

  const modalInfo = modals.find((t) => t.id === id) as EasyModalItem<P, V>;
  if (!modalInfo) throw new Error('No modalInfo found in EasyModal.useModal.');

  const { props, promise, config, visible } = modalInfo as EasyModalItem<P, V>;

  const modalId: Id = id;

  const hideCallback: GenerateTypeInfer<V> = useCallback(
    (result?: V | null) => {
      hide(modalId, result);
    },
    [modalId],
  );

  const removeCallback = useCallback(() => {
    remove(modalId);
  }, [modalId]);

  const args = {
    ...props,
    ...promise,
    visible,
    config,
    hide: hideCallback,
    remove: removeCallback,
  };

  return Object.freeze(args);
}

const EasyModalPlaceholder: React.FC = () => {
  const modals = useContext(ModalContext);

  const validModals = modals.filter((item) => item.id && MODAL_REGISTRY[item.id]); // ensure component is registered

  const toRender = validModals.map((item) => {
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

EasyModalPlaceholder.displayName = 'EasyModalPlaceholder';

const Provider: React.FC<Record<string, any>> = ({ children }) => {
  const arr = useReducer(reducer, []);
  const modals = arr[0];
  // why not write `fnRef.current = fn`? https://github.com/alibaba/hooks/issues/728
  const fnRef = useRef<innerDispatch>();
  fnRef.current = useMemo<innerDispatch>(() => {
    return function innerDispatch<P, V>(action: EasyModalAction<P, V>) {
      (arr[1] as React.Dispatch<EasyModalAction<P, V>>)(action);
    };
  }, [arr]);

  dispatch = fnRef.current;

  return (
    <ModalContext.Provider value={modals}>
      {children}
      <EasyModalPlaceholder />
    </ModalContext.Provider>
  );
};

Provider.displayName = 'EasyModalProvider';

const EasyModal = {
  ModalContext,
  Provider,
  update,
  create: function _create<P extends ModalProps<P, V> = InnerModalProps, V = ModalResolveType<P>>(
    Comp: React.ComponentType<P>,
  ): EasyModalHOC<P, V> {
    return create<P, V>(Comp);
  },
  show,
  hide,
  remove,
};

export default EasyModal;
