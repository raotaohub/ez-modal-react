<h1 align='center'>Easy Modal React</h1></p>

This is a easy-to-use modal state management of React. It use React's context.

[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/raotaohub/easy-modal-react/blob/main/LICENSE)

<p align='center'>English | <a href='./README.zh-CN.md'>简体中文</a> </p>

## ✨Feature

1. Based on **Promise**.
2. Supports **hook** and **props** injection.
3. Supports **return value type inference**.
4. Supports **>=React 16.8 version**.
5. Supports **<a href="#config" title="">config</a>** (When modal is hidden, Whether to remove and resolve by default)

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

## 🚀Examples

1. **use EasyModal Provider**

```tsx
import EasyModal from '@easy-modal-react';

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
import easyModal from '@easy-modal-react';
import MyModal from './MyModal';

EasyModal.show(MyModal, { name: 'foo' }).then((resolve) => {
  console.log(resolve);
});
```

3. **Modal Component use method provided**

```tsx
import EasyModal from '@easy-modal-react';
import { Info } from './Info';

export const Info = EasyModal.create((props: Props) => {
  return (
    <Modal title="Hello" open={props.visible} onOk={props.hide} onCancel={props.hide}>
      <h1>{props.age}</h1>
    </Modal>
  );
});
```

- That's the core functionality，Here's the better experience

---

1. **Inferred the return value type**

Your Component Props should **extends InnerModalProps**,to enable it to derive the correct return value type

```tsx
import EasyModal, { InnerModalProps } from '@easy-modal-react';

// For example
interface IProps extends InnerModalProps<'modal'> {
  age: number;
  name: string;
}
export const Info = EasyModal.create((props: Props) => {
  return (
    <Modal
      title="Hello"
      open={props.visible}
      onOk={() => {
        props.hide(); //(property) hide: (result: 'modal') => void ts(2554)
      }}
    >
      <h1>{props.age}</h1>
    </Modal>
  );
});

// "The property 'age' is missing in the type '{ name: string; }'... ts(2345)"
EasyModal.show(MyModal, { name: 'foo' }).then((resolve) => {
  console.log(resolve); // if everything is in order. we will get 'modal'
});
```

2. **If you like to use hook**

Please note. Generics need to

```tsx
interface IProps extends InnerModalProps<'modal'> {
  age: number;
  name: string;
}

export const Info = EasyModal.create((props: Props) => {
  const modal = useModal<Props /* here */>();

  modal.hide(); // (property) hide: (result: 'modal') => void ts(2554)

  return <Moda>/*...*/</Moda>;
});
```

3. <a name="config" id="config">**config default**</a>

> 1. When the modal is hidden, it is remove by default;
> 2. When the modal is hidden, it is resolve by default;

- Allows you to customize the configuration

```tsx
EasyModal.open(Component, {}, config:{
  resolveOnHide:true,
  removeOnHide:true,
});
```

## source of inspiration

1. fhd Inc @xpf
2. [nice-modal-react](https://github.com/eBay/nice-modal-react)

## Ohter

It has not yet been released，gradually improving.

[Issues](https://github.com/raotaohub/easy-modal-react/issues)

## LICENSE

[MIT](https://github.com/raotaohub/easy-modal-react/blob/main/LICENSE)
