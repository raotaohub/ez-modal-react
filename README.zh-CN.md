<h1 align='center'>Ez Modal</h1></p>

一个简单易用的 Modal 状态管理库，用于 React 应用。基于 Context 实现。

[![NPM](https://img.shields.io/npm/v/ez-modal-react.svg)](https://www.npmjs.com/package/ez-modal-react) [![Downloads](https://img.shields.io/npm/dm/ez-modal-react.svg)](https://www.npmjs.com/package/ez-modal-react) [![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/raotaohub/ez-modal-react/blob/main/LICENSE)

<p align='center'>简体中文 | <a href='./README.md'>English</a> </p>

## ✨ 特性

1. 基于 **Promise** ，使 Modal 和业务代码分离。
2. 支持 **hook** 和 **props** 注入 2 种方式，获得状态和控制权.
3. 支持 <a href="#typeinfer" title="使用返回值类型推导">返回值类型推导</a>，提高使用体验.
4. 支持 **React 16.8** 以上版本。
5. 支持 <a href="#config" title="配置hide时默认行为">配置</a>（隐藏弹窗时，是否默认销毁以及 resolve）。

## 📦 安装

```shell
# with yarn
yarn add ez-modal-react

# or with npm
npm install ez-modal-react
```

## 🚀 使用方式

1. **引入 EasyModal 使用 Provider**

```tsx
import EasyModal from 'ez-modal-react';

function App() {/* ... */}

ReactDOM.render(
    <EasyModal.Provider> // 包裹应用
      <App />
    </EasyModal.Provider>
  document.getElementById('root'),
);
```

2. **创建弹窗组件**

```tsx
const Info = (props) => {};
export const Info = EasyModal.create(Info);
```

3. **在任何地方使用**

- 调用 EasyModal.show，传入创建好的组件，打开弹窗

```tsx
import EasyModal from 'ez-modal-react';
import { Info } from './Info';

EasyModal.show(Info, { name: 'foo' }).then((resolve) => {
  console.log(resolve);
});
```

4. **组件中使用 EasyMdaol 提供的方法**

```tsx
import EasyModal from 'ez-modal-react';
import { Info } from './Info';

export const Info = EasyModal.create((props) => {
  return (
    <Modal title="Hello" open={props.visible} onOk={props.hide} onCancel={props.hide}>
      <h1>{props.age}</h1>
    </Modal>
  );
});
```

- 以上就是 EasyModal 的主要功能。

---

## ☀️ 更多

1.  <a name="typeinfer" id="typeinfer">使用返回值类型推导</a>

- 组件使用的 props 类型需要继承 **InnerModalProps**,确保正确的推导。

```diff
import EasyModal, { InnerModalProps } from 'ez-modal-react';

+ interface IProps extends InnerModalProps<'modal'> /*传入返回值类型*/ {
+   age: number;
+   name: string;
+ }

export const Info = EasyModal.create(
+ (props: Props) => {
  return (
    <Modal
      title="Hello"
      open={props.visible}
      onOk={() => {
+       props.hide(); //应有 1 个参数，但获得 0 个。 (property) hide: (result: "modal") => void ts(2554)
      }}
      onCancel={() => {
+       props.hide(null); // hide 接受 null 作为参数。它兼具 hide resolve 两种功能。使用null避免则可以 ts 校验失败
      }}
    >
      <h1>{props.age}</h1>
    </Modal>
  );
});

// 类型 "{ name: string; }" 中缺少属性 "age"，但类型 "ModalProps<Props, "modal">" 中需要该属性。
EasyModal.show(MyModal, { name: 'foo' }).then((resolve) => {
  console.log(resolve); // 一切正常将得到 "modal"
});
```

2. <a name="使用hook" id="usehook">使用 hook - useModal</a>

- 如需获得 ts 推导需要给 `useModal`方法传入泛型参数

```diff
import { useModal } from 'ez-modal-react';

+ interface IProps extends InnerModalProps<'modal'>/* 指定返回值类型 */ {
+   age: number;
+   name: string;
+ }

export const Info = EasyModal.create((props: Props) => {
+  const modal = useModal<Props>(); // 传入当前组件props的类型

  modal.hide(); // 应有 1 个参数，但获得 0 个。ts(2554) (property) hide: (result: "modal") => void ts(2554)

  return <Moda>/*...*/</Moda>;
});
```

3. <a name="config" id="config">配置默认行为</a>

> EasyModal 的默认行为：
>
> 1.  hide 时默认调用 resolve 给 promise 抛出成功
> 2.  hide 时默认调用 remove 销毁组件

> 为什么这么做？
>
> 1. 默认 remove:通常来说，弹窗关闭意味着销毁这个弹窗。
>
> 2. 默认 resolve:通过 resolve 足以满足绝大部分场景。reject 意味着调用方还需要额外处理。完全可以通过 resolve(false) 实现。

- 当然如果你需要，也可以改变这个默认行为，操作如下：

```diff
EasyModal.open(Component, {},
+  config:{
+    resolveOnHide:false,
+    removeOnHide:false,
+  }
);
```

## 📚 API

```tsx
const CreatedModal = EasyModal.create(Component); // 创建合规的 EasyModal 弹窗 返回值:EasyModalHOC

const result = EasyModal.open(CreatedModal, Props); // 打开 CreatedModal 弹窗 返回值:promise

const ______ = EasyModal.hide(CreatedModal); // 关闭 CreatedModal 弹窗 返回值:undefined

props; // 在组件内 EasyModal 会注入除用户自己的参数外，的额外属性

const modal = useModal(); // 在 CreatedModal 组件内使用；返回值同props


type props | modal :
 {
  id: string; // 当前 Modal id
  visible: boolean; // 当前 Modal 显示状态 ；
  hide: function;  // 隐藏当前 Modal 方法 ；默认调用 resolve & remove
  remove: function; // 销毁当前 Modal 方法 ；
  resolve: function;// 当前 Modal resolve 方法 ；
  reject: function; // 当前 Modal reject 方法 ；
  ...
}
```

- 关于 useModal 和 注入的 props 区别

> 1. 在组件内部得到的 **props** 和 **useModal()** 返回值 **具有相同的属性和方> 法**。
> 2. **useModal()** 返回值的`hide` `resolve`方法 ，和大多数 hook 一样默认不具备类型推导。你必须显式给 useModal 方法传入当前组件的 props 类型。
>
>    > btw 这正是我做这个项目的原因，我喜欢直接使用 props。而是市面上如 nice-modal-react 无法提供。

<a href="#usehook" title="使用 hook">使用 hook</a>

## ⭐ 灵感来源

1. fhd @xpf
2. [nice-modal-react](https://github.com/eBay/nice-modal-react)

## ⌨️ 其他

[Issues](https://github.com/raotaohub/ez-modal-react/issues)

## LICENSE

[MIT](https://github.com/raotaohub/ez-modal-react/blob/main/LICENSE)

---
