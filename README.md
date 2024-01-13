![ez-modal-scenario](assets/idea.png)

<p><h4 align='center'>ez modal react</h4></p>

<span style="margin-left:32px">The</span> concept of EasyModal is simple: to treat the operations of modals as asynchronous events, managing their lifecycle through Promises. It also provides type inference and constraints.

<p align='center'>English | <a href='./README.zh-CN.md'>简体中文</a> </p>

<p align="center">
<a href="https://www.npmjs.com/package/ez-modal-react" target="__blank"><img src="https://img.shields.io/npm/v/ez-modal-react?color=2B90B6&label=" alt="NPM version"></a>
<a href="https://www.npmjs.com/package/ez-modal-react" target="__blank"><img alt="NPM Downloads" src="https://img.shields.io/npm/dm/ez-modal-react?color=349dbe&label="></a>
<a href="https://raotaohub.github.io/ez-modal-react-book/en-US" target="__blank"><img src="https://img.shields.io/static/v1?label=&message=docs&color=45b8cd" alt="Docs & Demos"></a>
<a href="https://raotaohub.github.io/ez-modal-react-book/en-US" target="__blank"><img src="https://img.shields.io/static/v1?label=&message=demos&color=4ec5d4" alt="Themes"></a>
</p>

## ✨ Feature

1. Based on **Promise**,In addition, there is no need to manage the switch status, which can reduce the tedious status management.
2. Supports **<a href="#typeinfer" title="">return value type inference</a>**,elevate the development experience.
3. Small size(~1kb after gzip)、easy access non-intrusive、support any UI library.

## 🔨 Documentations

[中文文档](https://raotaohub.github.io/ez-modal-react-book) | [English](https://raotaohub.github.io/ez-modal-react-book/en-US)

[Example](https://raotaohub.github.io/ez-modal-react-book/example) | [codesandbox](https://codesandbox.io/p/sandbox/confident-shape-rt7bzr?embed=1)

## 📦 install

```shell
# with yarn
yarn add ez-modal-react -S

# or with npm
npm install ez-modal-react -S
```

## 🚀 Examples

1. **use EasyModal Provider**

```tsx
import EasyModal from 'ez-modal-react';

ReactDOM.render(
    <EasyModal.Provider> // wrap your main Componet
      <App />
    </EasyModal.Provider>
  document.getElementById('root'),
);
```

2. **create modal**

```tsx
import EasyModal, { InnerModalProps } from 'ez-modal-react';

interface IProps extends InnerModalProps<'modal'> {
  age: number;
  name: string;
}

const InfoModal = EazyModal.create((props: IProps) => (
  <Modal
    open={props.visible}
    //(property) hide: (result: 'modal') => void ts(2554)
    onOk={() => props.hide('modal')}
    onCancel={() => props.hide(null)}
    afterClose={props.remove}
  >
    <h1>{props.age}</h1>
    <h1>{props.name}</h1>
  </Modal>
));
```

3. **anywhere use it**

```tsx
// "The property 'age' is missing in the type '{ name: string; }'... ts(2345)"
const res = await EasyModal.show(InfoModal, { age: 10 });
console.log(res); // modal
```

## Acknowledgement

1. fhd Inc @xpf
2. [nice-modal-react](https://github.com/eBay/nice-modal-react)
3. Thanks to [SevenOutman (Doma)](https://github.com/SevenOutman) repository building support, I consulted his [aplayer-react](https://github.com/SevenOutman/aplayer-react) project

## LICENSE

[MIT](https://github.com/raotaohub/ez-modal-react/blob/main/LICENSE)

---
