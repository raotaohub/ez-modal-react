import { EASY_MODAL_ID } from './share';

export type ModalPromise<V> = {
  resolve: BuildFnInterfaceCheck<V>;
  reject: (reason: any) => void;
};

type ItemConfig = {
  removeOnHide?: boolean;
  resolveOnHide?: boolean;
};

export type EasyModalItem<P = any, V = any> = {
  id: string;
  props: P;
  visible: boolean;
  promise: ModalPromise<V>;
  config: ItemConfig;
};
export type innerDispatch = <P, V>(action: EasyModalAction<P, V>) => void;

export type ActionPayload<P, V> = {
  id: string;
  props?: P;
  visible?: boolean;
  promise?: ModalPromise<V>;
  config?: ItemConfig;
};

export type EasyModalAction<P = any, V = any> =
  | { type: 'easy_modal/show'; payload: ActionPayload<P, V> }
  | { type: 'easy_modal/hide'; payload: ActionPayload<P, V> }
  | { type: 'easy_modal/remove'; payload: ActionPayload<P, V> };

export type NoVoidValue<T> = T extends void ? never : T; /* if else */
// type Get Generics Type
export type BuildFnInterfaceCheck<V> = NoVoidValue<V> extends never
  ? () => void
  : (result: V | null /* hack */) => void;

export type InnerModalProps<V = never> = {
  id: string;
  visible: boolean;
  hide: BuildFnInterfaceCheck<V>;
  resolve: BuildFnInterfaceCheck<V>;
  reject: (reason: any) => void;
  remove: () => void;
  config?: ItemConfig;
};

// Modal Base
interface EasyModal<P, V> {
  (props: P & InnerModalProps<V>): JSX.Element;
}

// Modal HOC Interface
export interface EasyModalHOC<P, V> extends EasyModal<P, V> {
  [EASY_MODAL_ID]?: string;
  __typeof_easy_modal__?: symbol;
}

// Props Injected By Users
export type ModalProps<P, V> = Omit<P, keyof InnerModalProps<V>>;

export type ModalResolveType<V> = NoVoidValue<V> extends never
  ? never
  : V extends InnerModalProps<infer Result>
  ? Result
  : never;
