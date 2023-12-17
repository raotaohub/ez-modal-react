/* *********************************************************
 * Copyright 2023 raotaohub <raotao@outlook.com>
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 *********************************************************** */

import React, { useEffect, useContext, useReducer, useCallback, useMemo, useRef } from 'react';
import { EASY_MODAL_HOC_TYPE, EASY_MODAL_ID, MODAL_REGISTRY, getUid, isValidEasyHOC } from './share';
import {
  EasyModalItem,
  EasyModalHOC,
  innerDispatch,
  EasyModalAction,
  ModalPromise,
  ModalResolveType,
  ModalProps,
  BuildFnInterfaceCheck,
  InnerModalProps,
} from './type';

export * from './type';

const ModalContext = React.createContext<EasyModalItem[]>([]);
const ModalIdContext = React.createContext<string | null>(null);

let dispatch: innerDispatch = () => {
  throw new Error('No dispatch method detected, did you embed your app with EasyModal.Provider?');
};

let timer: any;

function reducer<P, V>(state: EasyModalItem<P, V>[], action: EasyModalAction<P, V>): EasyModalItem<P, V>[] {
  const { id } = action.payload;
  const newState = [...state];
  const index = newState.findIndex((v) => v.id === id);

  switch (action.type) {
    case 'easy_modal/show': {
      if (index > -1) {
        newState[index] = {
          ...newState[index],
          ...action.payload,
          visible: true,
        };
      } else {
        newState.push({
          ...newState[index],
          ...action.payload,
          visible: true,
        });
      }

      return newState;
    }

    case 'easy_modal/update': {
      newState[index] = {
        ...newState[index],
        ...action.payload,
      };
      return newState;
    }

    case 'easy_modal/hide': {
      newState[index] = {
        ...newState[index],
        ...action.payload,
        visible: false,
      };

      return newState;
    }

    case 'easy_modal/remove': {
      newState.splice(index, 1);

      return newState;
    }
    default:
      return state;
  }
}

function showModal<P = any, V = any>(
  id: string,
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
    },
  };
}

function updateModal<P = any, V = any>(id: string, props: ModalProps<P, V>): EasyModalAction {
  return {
    type: 'easy_modal/update',
    payload: {
      id,
      props,
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

const getModalId = <P, V>(Modal: EasyModalHOC<P, V> | string): string => {
  if (typeof Modal === 'string') return Modal as string;

  if (!Modal[EASY_MODAL_ID]) Modal[EASY_MODAL_ID] = getUid();

  return Modal[EASY_MODAL_ID];
};

function findModal<P, V>(Modal: EasyModalHOC<P, V> | string) {
  if (typeof Modal === 'string' && MODAL_REGISTRY[Modal]) {
    return MODAL_REGISTRY[Modal].Component;
  }

  const find = Object.values(MODAL_REGISTRY).find((item) => item.Component === (Modal as EasyModalHOC<P, V>));

  return find ? find.Component : void 0;
}

function create<P extends ModalProps<P, V> = InnerModalProps, V = ModalResolveType<P>>(
  Comp: React.ComponentType<P>,
): EasyModalHOC<P, V> {
  if (!Comp) new Error('Please pass in the react component.');
  const EasyModalHOCWrapper: EasyModalHOC<P, V> = ({ id: modalId }) => {
    const { id, props, promise, ...innerProps } = useModal(modalId);

    return (
      <ModalIdContext.Provider value={id}>
        <Comp {...(props as P)} {...promise} {...innerProps} />
      </ModalIdContext.Provider>
    );
  };

  EasyModalHOCWrapper.__typeof_easy_modal__ = EASY_MODAL_HOC_TYPE;
  EasyModalHOCWrapper.displayName = 'EasyModalHOCWrapper';
  return EasyModalHOCWrapper;
}

function register<P, V>(id: string, Modal: EasyModalHOC<P, V>, props: ModalProps<P, V>) {
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
  config.removeOnHide = config.removeOnHide ?? true;
  config.resolveOnHide = config.resolveOnHide ?? true;

  // Check & Create
  const _Modal = (isValidEasyHOC(Modal) ? Modal : create<P, V>(Modal as React.ComponentType<P>)) as EasyModalHOC<
    P,
    V
  >; /* `as` tell ts that _Modal's type */

  // Find & Register
  const id = getModalId<P, V>(_Modal);
  const find = findModal<P, V>(_Modal) ?? findModal<P, V>(id);
  if (!find) register<P, V>(id, _Modal, props);

  // Promise Control
  // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html#non-null-assertion-operator
  let theResolve!: BuildFnInterfaceCheck<V>;
  let theReject!: (reason: any) => void; //Reject any, forever.

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
  Modal: EasyModalHOC<P, V>,
  props: Partial<ModalProps<P, V>> = {} as any,
) {
  if (!isValidEasyHOC(Modal)) {
    new Error('If you want to update Comp ,Please use EasyModal.create and pass in EasyModal.update(/* Comp */)');
  }
  // Find & Register
  const id = getModalId<P, V>(Modal);
  if (!id) throw new Error('No id found in EasyModal.update.');
  const originProps = MODAL_REGISTRY[id]?.props;
  dispatch<P, V>(updateModal<P, V>(id, { ...originProps, ...props }));
}

function hide<P, V>(Modal: EasyModalHOC<P, V> | string) {
  const id = getModalId<P, V>(Modal);
  if (!id) throw new Error('No id found in EasyModal.hide.');
  dispatch<P, V>(hideModal(id));
}

function remove<P, V>(Modal: EasyModalHOC<P, V> | string) {
  const id = getModalId<P, V>(Modal);
  if (!id) throw new Error('No id found in EasyModal.remove.');
  dispatch<P, V>(removeModal(id));
  delete MODAL_REGISTRY[id];
  clearTimeout(timer);
}

export function useModal<P extends ModalProps<P, V>, V extends ModalResolveType<P> = ModalResolveType<P>>(id?: string) {
  const modals = useContext(ModalContext);
  const contextModalId = useContext(ModalIdContext);

  if (!id) id = contextModalId as string;
  if (!id) throw new Error('No modal id found in EasyModal.useModal.');

  const modalInfo = modals.find((t) => t.id === id) as EasyModalItem<P, V>;
  if (!modalInfo) throw new Error('No modalInfo found in EasyModal.useModal.');

  const { promise, config } = modalInfo as EasyModalItem<P, V>;

  const modalId: string = id;

  const hideCallback: BuildFnInterfaceCheck<V> = useCallback(
    (result?: V | null) => {
      hide(modalId);
      config?.resolveOnHide && promise?.resolve(result as any); // TypeScript can only infer the type at runtime.
    },
    [modalId, promise, config?.resolveOnHide],
  );

  const removeCallback = useCallback(() => {
    remove(modalId);
  }, [modalId]);

  return {
    hide: hideCallback,
    remove: removeCallback,
    ...promise,
    ...modalInfo,
  };
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

const EasyModal = {
  Provider,
  ModalContext,
  create,
  show,
  update,
  hide,
  remove,
  useModal,
};

export default EasyModal;
