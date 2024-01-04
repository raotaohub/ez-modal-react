import { FunctionComponent } from 'react';
import { EASY_MODAL_ID } from './share';

type Id = string | number;

type ModalPromise<V> = {
  resolve: GenerateTypeInfer<V>;
  reject: (reason: any) => void;
};

type ItemConfig = {
  /**
   * @deprecated
   * It is up to the user to decide when to remove,
   * Because component libraries have transition animations
   */
  removeOnHide?: boolean;
  /**
   * Whether to default to resolve when the hide method is called
   * @name defaultValue = true
   */
  resolveOnHide?: boolean;
  /**
   * @name only custom item's id
   */
  id?: Id;
};

type EasyModalItem<P = any, V = any> = {
  id: Id;
  props: P;
  visible: boolean;
  promise: ModalPromise<V>;
  config: ItemConfig;
};

type innerDispatch = <P, V>(action: EasyModalAction<P, V>) => void;

type ActionPayload<P, V> = {
  id: Id;
  props?: P;
  visible?: boolean;
  promise?: ModalPromise<V>;
  config?: ItemConfig;
};

type EasyModalAction<P = any, V = any> =
  | { type: 'easy_modal/show'; payload: ActionPayload<P, V> }
  | { type: 'easy_modal/hide'; payload: ActionPayload<P, V> }
  | { type: 'easy_modal/remove'; payload: ActionPayload<P, V> }
  | { type: 'easy_modal/update'; payload: ActionPayload<P, V> };

type NoVoidValue<T> = T extends void ? never : T; /* if else */
// type Get Generics Type
type GenerateTypeInfer<V> = NoVoidValue<V> extends never ? () => void : (result: V | null /* hack */) => void;

type InnerModalProps<V = never> = {
  id: Id;
  visible: boolean;
  hide: GenerateTypeInfer<V>;
  resolve: GenerateTypeInfer<V>;
  reject: (reason: any) => void;
  remove: () => void;
  config?: ItemConfig;
};

// Modal Base
interface EasyModal<P, V> {
  (props: P & InnerModalProps<V>): JSX.Element;
}

// Modal HOC Interface
interface EasyModalHOC<P, V> extends EasyModal<P, V>, Omit<FunctionComponent<P>, ''> {
  [EASY_MODAL_ID]?: Id;
  __typeof_easy_modal__?: symbol;
  __easy_modal_is_single__?: boolean;
}

// Props Injected By Users
type ModalProps<P, V> = Omit<P, keyof InnerModalProps<V>>;

type ModalResolveType<V> = NoVoidValue<V> extends never
  ? never
  : V extends InnerModalProps<infer Result>
  ? Result
  : never;

export type {
  EasyModalItem,
  EasyModalHOC,
  innerDispatch,
  EasyModalAction,
  ModalPromise,
  ModalResolveType,
  ModalProps,
  GenerateTypeInfer,
  InnerModalProps,
  Id,
};
