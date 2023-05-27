<h1 align='center'>Ez Modal</h1></p>

This is a easy-to-use modal state management of React. It use React's context.

[![NPM](https://img.shields.io/npm/v/ez-modal-react.svg)](https://www.npmjs.com/package/ez-modal-react) [![Downloads](https://img.shields.io/npm/dm/ez-modal-react.svg)](https://www.npmjs.com/package/ez-modal-react) [![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/raotaohub/ez-modal-react/blob/main/LICENSE)

<p align='center'>English | <a href='./README.zh-CN.md'>简体中文</a> </p>

## ✨ Feature

1. Based on **Promise**, separate modal and ohter code.
2. Supports **hook** and **props** injection.
3. Supports **<a href="#typeinfer" title="">return value type inference</a>**,elevate the development experience.
4. Supports **>=React 16.8 version**.
5. Supports **<a href="#config" title="">config</a>** (When modal is hidden, Whether to remove and resolve by default)

## 📦 install

```shell
# with yarn
yarn add @ez-modal-react

# or with npm
npm install @ez-modal-react
```

## 🚀 Examples

1. **use EasyModal Provider**

```tsx
import EasyModal from '@ez-modal-react';

function App() {/* ... */}

ReactDOM.render(
    <EasyModal.Provider> // wrap your main Componet
      <App />
    </EasyModal.Provider>
  document.getElementById('root'),
);
```

2. **create modal**

```tsx
const Info = (props) => {};

export const MyModal = EasyModal.create(Info);
```

3. **anywhere use it**

```tsx
import easyModal from '@ez-modal-react';
import MyModal from './MyModal';

EasyModal.show(MyModal, { name: 'foo' }).then((resolve) => {
  console.log(resolve);
});
```

4. **Modal Component use method provided**

```tsx
import EasyModal from '@ez-modal-react';
import { Info } from './Info';

export const Info = EasyModal.create((props) => {
  return (
    <Modal title="Hello" open={props.visible} onOk={props.hide} onCancel={props.hide}>
      <h1>{props.age}</h1>
    </Modal>
  );
});
```

- That's the core functionality，Here's the better experience

---

## ☀️ More

1. **Inferred the return value type**

Your Component Props should **extends InnerModalProps**,to enable it to derive the correct return value type

```diff
import EasyModal, { InnerModalProps } from '@ez-modal-react';

+ interface IProps extends InnerModalProps<'modal'/* here*/> {
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
+       props.hide(); //(property) hide: (result: 'modal') => void ts(2554)
      }}
      onCancel={() => {
+      props.hide(null); // accepts null as a parameter,this makes it not have to worry about type errors, which is great to use
      }}
    >
      <h1>{props.age}</h1>
    </Modal>
  );
});

+ // "The property 'age' is missing in the type '{ name: string; }'... ts(2345)"
EasyModal.show(MyModal, { name: 'foo' }).then((resolve) => {
  console.log(resolve); // if everything is in order. we will get 'modal'
});
```

2. <a name="use hook" id="usehook">**If you like to use hook**</a>

```diff
+ interface IProps extends InnerModalProps<'modal'> {
+   age: number;
+   name: string;
+ }

export const Info = EasyModal.create((props: Props) => {
+  const modal = useModal<Props /* here */>();

+  modal.hide(); // (property) hide: (result: 'modal') => void ts(2554)

  return <Moda>/*...*/</Moda>;
});
```

3. <a name="config" id="config">**config default**</a>

> 1. When the modal is hidden, it is remove by default;
> 2. When the modal is hidden, it is resolve by default;

- Allows you to customize the configuration

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
const CreatedModal = EasyModal.create(Component); // create EasyModal Modal； return EasyModalHOC

const result = EasyModal.open(CreatedModal, Props); // open CreatedModal Modal； return promise

const ______ = EasyModal.hide(CreatedModal); // hide CreatedModal Modal； return undefined

props; // Within a component, EasyModal injects additional properties in addition to the user's own parameters

const modal = useModal(); // in CreatedModal useModal；return same as props

type props | modal :
 {
  id: string; // current Modal id
  visible: boolean; // current Modal open state
  hide: function; // hidden current Modal fn
  remove: function; // remove current Modal fn
  resolve: function;
  reject: function;
  ...
}
```

- About the difference between useModal and injected props

> 1. The **props** and **useModal()** return values obtained inside the component have the same properties and methods>
> 2. The 'hide' 'resolve' method of the **useModal()** return value does not have type inference by default like most hooks. You must explicitly pass the props type of the current component to the useModal method.
>    > btw, That's exactly why I did this project, I like to use props directly, but nice-modal-react can't provide it

<a href="#usehook" title="use hook">use hook</a>

## ⭐ source of inspiration

1. fhd Inc @xpf
2. [nice-modal-react](https://github.com/eBay/nice-modal-react)

## ⌨️ Ohter

[Issues](https://github.com/raotaohub/ez-modal-react/issues)

## LICENSE

[MIT](https://github.com/raotaohub/ez-modal-react/blob/main/LICENSE)

---
