/* eslint-disable @typescript-eslint/no-explicit-any -- Public compatibility types intentionally retain the 1.x API. */
import type { ComponentType, Context, FunctionComponent, ReactElement, ReactNode } from 'react';
import { EASY_MODAL_ID } from './share';

type Id = string | number;

type ModalPromise<V> = {
  resolve: GenerateTypeInfer<V>;
  reject: (reason?: any) => void;
};

type ItemConfig = {
  /**
   * @deprecated It is up to the user to remove a modal after its transition completes.
   */
  removeOnHide?: boolean;
  /** Whether hide resolves the promise returned by show. @default true */
  resolveOnHide?: boolean;
  /** A custom modal instance id. */
  id?: Id;
};

type UpdateOptions = {
  /**
   * Whether to merge new props with current props.
   * Set to false to replace all current props.
   * @default true
   */
  merge?: boolean;
};

type EasyModalItem<P = any, V = any> = {
  id: Id;
  props: P;
  visible: boolean;
  promise: ModalPromise<V>;
  config: ItemConfig;
};

/** @deprecated Internal action types are retained for source compatibility only. */
type ActionPayload<P, V> = {
  id: Id;
} & Partial<Omit<EasyModalItem<P, V>, 'id'>>;

/** @deprecated The 2.x store no longer exposes a reducer dispatch pipeline. */
type EasyModalAction<P = any, V = any> =
  | { type: 'easy_modal/show'; payload: ActionPayload<P, V> }
  | { type: 'easy_modal/hide'; payload: ActionPayload<P, V> }
  | { type: 'easy_modal/remove'; payload: ActionPayload<P, V> }
  | { type: 'easy_modal/update'; payload: ActionPayload<P, V> };

/** @deprecated The 2.x store no longer exposes a reducer dispatch pipeline. */
type innerDispatch = <P, V>(action: EasyModalAction<P, V>) => void;

type NoVoidValue<T> = T extends void ? never : T;
type GenerateTypeInfer<V> = NoVoidValue<V> extends never ? () => void : (result: V | null) => void;

type InnerModalProps<V = never> = {
  id: Id;
  visible: boolean;
  hide: GenerateTypeInfer<V>;
  resolve: GenerateTypeInfer<V>;
  reject: (reason?: any) => void;
  remove: () => void;
  config?: ItemConfig;
};

interface EasyModal<P, V> {
  (props: P & InnerModalProps<V>): ReactElement | null;
}

interface EasyModalHOC<P = unknown, V = unknown> extends EasyModal<P, V>, Omit<FunctionComponent<P>, ''> {
  [EASY_MODAL_ID]?: Id;
  __typeof_easy_modal__?: symbol;
  __easy_modal_is_single__?: boolean;
  /** @internal Prevents a modal HOC from being used with a different manager instance. */
  __easy_modal_manager__?: object;
}

type ModalProps<P, V> = Omit<P, keyof InnerModalProps<V>>;

type ModalResolveType<V> = NoVoidValue<V> extends never
  ? never
  : V extends InnerModalProps<infer Result>
  ? Result
  : never;

type ProviderProps = {
  children?: ReactNode;
};

interface EasyModalManager {
  ModalContext: Context<ReadonlyArray<EasyModalItem>>;
  Provider: FunctionComponent<ProviderProps>;
  create<
    P extends ModalProps<P, V> = InnerModalProps,
    V extends ModalResolveType<P> = ModalResolveType<P>,
  >(
    Comp: ComponentType<P>,
  ): EasyModalHOC<P, V>;
  show<P extends ModalProps<P, V>, V extends ModalResolveType<P> = ModalResolveType<P>>(
    Modal: EasyModalHOC<P, V> | ComponentType<P>,
    props?: ModalProps<P, V>,
    config?: ItemConfig,
  ): Promise<V>;
  update<P extends ModalProps<P, V>, V extends ModalResolveType<P> = ModalResolveType<P>>(
    ModalOrId: EasyModalHOC<P, V> | Id,
    props?: Partial<ModalProps<P, V>>,
    options?: UpdateOptions,
  ): void;
  hide<P, V>(ModalOrId: EasyModalHOC<P, V> | Id, result?: V | null): void;
  remove<P, V>(ModalOrId: EasyModalHOC<P, V> | Id): void;
  useModal<P extends ModalProps<P, V>, V extends ModalResolveType<P> = ModalResolveType<P>>(
    id?: Id,
  ): Readonly<P & InnerModalProps<V>>;
}

export type {
  EasyModal,
  EasyModalAction,
  EasyModalHOC,
  EasyModalItem,
  EasyModalManager,
  GenerateTypeInfer,
  Id,
  innerDispatch,
  InnerModalProps,
  ItemConfig,
  ModalPromise,
  ModalProps,
  ModalResolveType,
  ProviderProps,
  UpdateOptions,
};
