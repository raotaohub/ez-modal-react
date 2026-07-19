/* *********************************************************
 * Copyright 2023 raotaohub <raotao@outlook.com>
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 *********************************************************** */

/* eslint-disable @typescript-eslint/no-explicit-any -- heterogeneous modal records are erased inside the store */

import React, { useCallback, useContext, useEffect, useLayoutEffect, useRef } from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';
import usage, { HowUse } from './howUse';
import { EASY_MODAL_HOC_TYPE, EASY_MODAL_ID, getModalId, isValidEasyHOC, isValidId } from './share';
import type {
  EasyModalHOC,
  EasyModalItem,
  EasyModalManager,
  GenerateTypeInfer,
  Id,
  InnerModalProps,
  ItemConfig,
  ModalPromise,
  ModalProps,
  ModalResolveType,
  ProviderProps,
  UpdateOptions,
} from './type';

export * from './type';

export class EasyModalProviderUnmountedError extends Error {
  constructor() {
    super('The EasyModal Provider was unmounted before the modal promise settled.');
    this.name = 'EasyModalProviderUnmountedError';
  }
}

type ModalRecord = EasyModalItem<any, any> & {
  Component: EasyModalHOC<any, any>;
};

type ModalStore = {
  getSnapshot: () => ReadonlyArray<ModalRecord>;
  assertAvailable: () => void;
  subscribe: (listener: () => void) => () => void;
  registerPromise: (disposePromise: () => void) => () => void;
  findById: (id: Id) => ModalRecord | undefined;
  findByComponent: (Component: EasyModalHOC<any, any>) => ModalRecord | undefined;
  show: (modal: ModalRecord) => void;
  update: (id: Id, updater: (modal: ModalRecord) => ModalRecord) => void;
  remove: (id: Id) => void;
  scheduleRemove: (id: Id, promise: ModalPromise<any>, callback: () => void) => void;
  dispose: () => void;
};

const canUseDOM = () => typeof window !== 'undefined' && typeof window.document !== 'undefined';
const useIsomorphicLayoutEffect = canUseDOM() ? useLayoutEffect : useEffect;

function createModalStore(): ModalStore {
  let snapshot: ModalRecord[] = [];
  let disposed = false;
  const listeners = new Set<() => void>();
  const pendingPromises = new Set<() => void>();
  const removeTimers = new Map<Id, ReturnType<typeof setTimeout>>();

  const assertAvailable = () => {
    if (disposed) throw new Error('This EasyModal Provider has been unmounted and its store is no longer available.');
  };

  const publish = (nextSnapshot: ModalRecord[]) => {
    assertAvailable();
    snapshot = nextSnapshot;
    listeners.forEach((listener) => listener());
  };

  const clearRemoveTimer = (id: Id) => {
    const timer = removeTimers.get(id);
    if (timer) clearTimeout(timer);
    removeTimers.delete(id);
  };

  return {
    getSnapshot: () => snapshot,
    assertAvailable,
    subscribe: (listener) => {
      if (disposed) return () => undefined;
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    registerPromise: (disposePromise) => {
      assertAvailable();
      pendingPromises.add(disposePromise);
      return () => pendingPromises.delete(disposePromise);
    },
    findById: (id) => {
      assertAvailable();
      return snapshot.find((modal) => modal.id === id);
    },
    findByComponent: (Component) => {
      assertAvailable();
      return snapshot.find((modal) => modal.Component === Component);
    },
    show: (modal) => {
      assertAvailable();
      clearRemoveTimer(modal.id);
      const index = snapshot.findIndex((item) => item.id === modal.id);
      if (index < 0) {
        publish([...snapshot, modal]);
        return;
      }

      const nextSnapshot = [...snapshot];
      nextSnapshot[index] = modal;
      publish(nextSnapshot);
    },
    update: (id, updater) => {
      assertAvailable();
      const index = snapshot.findIndex((modal) => modal.id === id);
      if (index < 0) return;

      const nextSnapshot = [...snapshot];
      nextSnapshot[index] = updater(snapshot[index]);
      publish(nextSnapshot);
    },
    remove: (id) => {
      assertAvailable();
      clearRemoveTimer(id);
      const nextSnapshot = snapshot.filter((modal) => modal.id !== id);
      if (nextSnapshot.length !== snapshot.length) publish(nextSnapshot);
    },
    scheduleRemove: (id, promise, callback) => {
      assertAvailable();
      clearRemoveTimer(id);
      const timer = setTimeout(() => {
        removeTimers.delete(id);
        const current = snapshot.find((modal) => modal.id === id);
        if (current && current.promise === promise && !current.visible) callback();
      }, 300);
      removeTimers.set(id, timer);
    },
    dispose: () => {
      if (disposed) return;
      disposed = true;
      removeTimers.forEach((timer) => clearTimeout(timer));
      removeTimers.clear();
      listeners.clear();
      snapshot = [];
      const disposePromises = Array.from(pendingPromises);
      pendingPromises.clear();
      disposePromises.forEach((disposePromise) => disposePromise());
    },
  };
}

export function createEasyModal(): EasyModalManager {
  const managerIdentity = {};
  const ModalContext = React.createContext<ReadonlyArray<EasyModalItem>>([]);
  const ModalRecordContext = React.createContext<ReadonlyArray<ModalRecord>>([]);
  const ModalStoreContext = React.createContext<ModalStore | null>(null);
  const ModalIdContext = React.createContext<Id | null>(null);
  const mountedStores = new Set<ModalStore>();
  const disposalTimers = new Map<ModalStore, ReturnType<typeof setTimeout>>();
  let activeStore: ModalStore | null = null;
  let warnedAboutMultipleProviders = false;

  const activateStore = (store: ModalStore) => {
    const disposalTimer = disposalTimers.get(store);
    if (disposalTimer) clearTimeout(disposalTimer);
    disposalTimers.delete(store);
    store.assertAvailable();
    mountedStores.add(store);
    activeStore = store;

    if (mountedStores.size > 1 && !warnedAboutMultipleProviders) {
      warnedAboutMultipleProviders = true;
      console.warn(
        'Multiple Providers are using the same EasyModal manager. Create isolated managers with createEasyModal() for deterministic routing.',
      );
    }
  };

  const deactivateStore = (store: ModalStore) => {
    mountedStores.delete(store);
    const previousTimer = disposalTimers.get(store);
    if (previousTimer) clearTimeout(previousTimer);
    const disposalTimer = setTimeout(() => {
      disposalTimers.delete(store);
      store.dispose();
      if (activeStore === store) {
        const remainingStores = Array.from(mountedStores);
        activeStore = remainingStores[remainingStores.length - 1] ?? null;
      }
    }, 0);
    disposalTimers.set(store, disposalTimer);
  };

  const requireStore = (method: string): ModalStore => {
    if (!canUseDOM()) {
      throw new Error(`EasyModal.${method} is client-only and cannot be called during server rendering.`);
    }
    if (!activeStore) throw new Error(usage(HowUse.dispatch));
    return activeStore;
  };

  const assertModalOwner = (Modal: EasyModalHOC<any, any>) => {
    if (Modal.__easy_modal_manager__ && Modal.__easy_modal_manager__ !== managerIdentity) {
      throw new Error(
        'This modal was created by another EasyModal manager. Use the Provider and methods from the same createEasyModal() instance.',
      );
    }
  };

  const findModal = (store: ModalStore, ModalOrId: EasyModalHOC<any, any> | Id) => {
    if (isValidId(ModalOrId)) return store.findById(ModalOrId);
    assertModalOwner(ModalOrId);
    const id = ModalOrId[EASY_MODAL_ID];
    return (isValidId(id) ? store.findById(id) : undefined) ?? store.findByComponent(ModalOrId);
  };

  const getModal = (store: ModalStore, ModalOrId: EasyModalHOC<any, any> | Id, method: string) => {
    const modal = findModal(store, ModalOrId);
    if (!modal) {
      console.warn(`No Component found in EasyModal.${method}.\nIt may have been pre-removed, which is allowed`);
    }
    return modal;
  };

  const removeFromStore = (store: ModalStore, ModalOrId: EasyModalHOC<any, any> | Id) => {
    const modal = getModal(store, ModalOrId, 'remove');
    if (modal) store.remove(modal.id);
  };

  const hideInStore = <V,>(store: ModalStore, ModalOrId: EasyModalHOC<any, V> | Id, result?: V | null) => {
    const modal = getModal(store, ModalOrId, 'hide');
    if (!modal) return;

    store.update(modal.id, (current) => ({ ...current, visible: false }));
    if (modal.config.resolveOnHide) modal.promise.resolve(result);

    if (!modal.Component.__easy_modal_is_single__ && !isValidId(modal.config.id)) {
      store.scheduleRemove(modal.id, modal.promise, () => removeFromStore(store, modal.id));
    }
  };

  const useManagerModal = <
    P extends ModalProps<P, V>,
    V extends ModalResolveType<P> = ModalResolveType<P>,
  >(
    id?: Id,
  ): Readonly<P & InnerModalProps<V>> => {
    const modals = useContext(ModalRecordContext);
    const store = useContext(ModalStoreContext);
    const contextModalId = useContext(ModalIdContext);
    const modalId = isValidId(id) ? id : contextModalId;

    if (!store) throw new Error('EasyModal.useModal must be used inside its matching EasyModal.Provider.');
    if (!isValidId(modalId)) throw new Error('No modal id found in EasyModal.useModal.');

    const modalInfo = modals.find((modal) => modal.id === modalId) as ModalRecord | undefined;
    if (!modalInfo) throw new Error('No modalInfo found in EasyModal.useModal.');

    const hideCallback: GenerateTypeInfer<V> = useCallback(
      (result?: V | null) => hideInStore<V>(store, modalId, result),
      [store, modalId],
    ) as GenerateTypeInfer<V>;

    const removeCallback = useCallback(() => removeFromStore(store, modalId), [store, modalId]);
    const args = {
      ...modalInfo.props,
      ...modalInfo.promise,
      id: modalId,
      visible: modalInfo.visible,
      config: modalInfo.config,
      hide: hideCallback,
      remove: removeCallback,
    } as P & InnerModalProps<V>;

    return Object.freeze(args);
  };

  const create = <
    P extends ModalProps<P, V> = InnerModalProps,
    V extends ModalResolveType<P> = ModalResolveType<P>,
  >(
    Comp: React.ComponentType<P>,
    single = true,
  ): EasyModalHOC<P, V> => {
    if (!Comp) throw new Error(usage(HowUse.create));

    const EasyModalHOCWrapper = (({ id }: { id: Id }) => {
      const inject = useManagerModal<P, V>(id);
      return (
        <ModalIdContext.Provider value={id}>
          <Comp {...(inject as P)} />
        </ModalIdContext.Provider>
      );
    }) as unknown as EasyModalHOC<P, V>;

    EasyModalHOCWrapper.displayName = `EasyModal(${Comp.displayName || Comp.name || 'Component'})`;
    EasyModalHOCWrapper.__typeof_easy_modal__ = EASY_MODAL_HOC_TYPE;
    EasyModalHOCWrapper.__easy_modal_is_single__ = single;
    EasyModalHOCWrapper.__easy_modal_manager__ = managerIdentity;
    return EasyModalHOCWrapper;
  };

  const show = <P extends ModalProps<P, V>, V extends ModalResolveType<P> = ModalResolveType<P>>(
    Modal: EasyModalHOC<P, V> | React.ComponentType<P>,
    props: ModalProps<P, V> = {} as ModalProps<P, V>,
    config: ItemConfig = {},
  ): Promise<V> => {
    const store = requireStore('show');
    const ModalComponent = (isValidEasyHOC(Modal)
      ? (Modal as EasyModalHOC<P, V>)
      : create<P, V>(Modal as React.ComponentType<P>, false)) as EasyModalHOC<P, V>;
    assertModalOwner(ModalComponent);

    const normalizedConfig: ItemConfig = {
      ...config,
      resolveOnHide: config.resolveOnHide ?? true,
      id: config.id ?? '',
    };
    const id = getModalId(ModalComponent, normalizedConfig.id);

    let settled = false;
    let unregisterPromise: () => void = () => undefined;
    let nativeResolve!: (value: V | PromiseLike<V>) => void;
    let nativeReject!: (reason?: any) => void;
    const result = new Promise<V>((resolve, reject) => {
      nativeResolve = resolve;
      nativeReject = reject;
    });
    // Keep ignored modal promises from becoming unhandled when their Provider is unmounted.
    void result.catch(() => undefined);

    const resolvePromise = ((value?: V | null) => {
      if (settled) return;
      settled = true;
      unregisterPromise();
      nativeResolve(value as V);
    }) as GenerateTypeInfer<V>;
    const rejectPromise = (reason?: any) => {
      if (settled) return;
      settled = true;
      unregisterPromise();
      nativeReject(reason);
    };

    unregisterPromise = store.registerPromise(() => rejectPromise(new EasyModalProviderUnmountedError()));
    store.show({
      id,
      Component: ModalComponent,
      props,
      promise: { resolve: resolvePromise, reject: rejectPromise },
      config: normalizedConfig,
      visible: true,
    });
    return result;
  };

  const update = <P extends ModalProps<P, V>, V extends ModalResolveType<P> = ModalResolveType<P>>(
    ModalOrId: EasyModalHOC<P, V> | Id,
    props: Partial<ModalProps<P, V>> = {},
    options?: UpdateOptions,
  ) => {
    if (!isValidEasyHOC(ModalOrId) && !isValidId(ModalOrId)) {
      console.warn(usage(HowUse.update));
      return;
    }

    const store = requireStore('update');
    const modal = getModal(store, ModalOrId, 'update');
    if (!modal) return;

    store.update(modal.id, (current) => ({
      ...current,
      props: options?.merge === false ? props : { ...current.props, ...props },
    }));
  };

  const hide = <P, V>(ModalOrId: EasyModalHOC<P, V> | Id, result?: V | null) => {
    hideInStore(requireStore('hide'), ModalOrId, result);
  };

  const remove = <P, V>(ModalOrId: EasyModalHOC<P, V> | Id) => {
    removeFromStore(requireStore('remove'), ModalOrId);
  };

  const StoreActivator: React.FC<{ store: ModalStore }> = ({ store }) => {
    useIsomorphicLayoutEffect(() => {
      activateStore(store);
      return () => deactivateStore(store);
    }, [store]);
    return null;
  };
  StoreActivator.displayName = 'EasyModalStoreActivator';

  const EasyModalPlaceholder: React.FC = () => {
    const modals = useContext(ModalRecordContext);
    return (
      <>
        {modals.map((modal) => (
          <modal.Component key={modal.id} id={modal.id} />
        ))}
      </>
    );
  };
  EasyModalPlaceholder.displayName = 'EasyModalPlaceholder';

  const Provider: React.FC<ProviderProps> = ({ children }) => {
    const storeRef = useRef<ModalStore>();
    if (!storeRef.current) storeRef.current = createModalStore();
    const store = storeRef.current;
    const modals = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

    return (
      <ModalStoreContext.Provider value={store}>
        <ModalContext.Provider value={modals}>
          <ModalRecordContext.Provider value={modals}>
            <StoreActivator store={store} />
            {children}
            <EasyModalPlaceholder />
          </ModalRecordContext.Provider>
        </ModalContext.Provider>
      </ModalStoreContext.Provider>
    );
  };
  Provider.displayName = 'EasyModalProvider';

  return {
    ModalContext,
    Provider,
    create: <
      P extends ModalProps<P, V> = InnerModalProps,
      V extends ModalResolveType<P> = ModalResolveType<P>,
    >(
      Comp: React.ComponentType<P>,
    ) => create<P, V>(Comp),
    show,
    update,
    hide,
    remove,
    useModal: useManagerModal,
  };
}

const EasyModal = createEasyModal();

export const useModal = EasyModal.useModal;
export default EasyModal;
