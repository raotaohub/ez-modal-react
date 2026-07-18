![ez-modal-scenario](assets/idea.png)

<p><h2 align='center'>EasyModal</h2></p>

<span style="margin-left:32px">​EasyModal</span> 的理念很简单：将模态框的操作视为异步事件，通过 Promise 管理其生命周期。并且提供类型推导和约束。

<p align='center'>简体中文 | <a href='./README.md'>English</a> </p>

<p align="center">
<a href="https://www.npmjs.com/package/ez-modal-react" target="__blank"><img src="https://img.shields.io/npm/v/ez-modal-react?color=2B90B6&label=" alt="NPM version"></a>
<a href="https://www.npmjs.com/package/ez-modal-react" target="__blank"><img alt="NPM Downloads" src="https://img.shields.io/npm/dm/ez-modal-react?color=349dbe&label="></a>
<a href="https://raotaohub.github.io/ez-modal-react-book/en-US" target="__blank"><img src="https://img.shields.io/static/v1?label=&message=docs&color=45b8cd" alt="Docs & Demos"></a>
<a href="https://raotaohub.github.io/ez-modal-react-book/en-US" target="__blank"><img src="https://img.shields.io/static/v1?label=&message=demos&color=4ec5d4" alt="Themes"></a>
</p>

## ✨ 特性

1. 基于 **Promise** 封装，灵活易用可减少繁琐的状态管理。
2. \>=React 16.8，支持 <a href="#typeinfer" title="使用返回值类型推导">返回值类型推导</a>，和类型校验。
3. 体积小(~1kb gzip)、易接入、无入侵性、支持任意 UI 库。

## 🔨 Documentations

[中文文档](https://raotaohub.github.io/ez-modal-react-book) | [English](https://raotaohub.github.io/ez-modal-react-book/en-US)

[Example](https://raotaohub.github.io/ez-modal-react-book/example) | [codesandbox](https://codesandbox.io/p/sandbox/confident-shape-rt7bzr?embed=1)

## 📦 安装

```shell
# with yarn
yarn add ez-modal-react -S

# or with npm
npm install ez-modal-react -S
```

## 🚀 使用方式

1. 使用 Provider

```tsx
import EasyModal from 'ez-modal-react';

ReactDOM.render(
    <EasyModal.Provider> // 包裹应用
      <YourApp />
    </EasyModal.Provider>
  document.getElementById('root'),
);
```

2. 创建弹窗组件

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

3. 在任何地方使用

```tsx
// 类型 "{ name: string; }" 中缺少属性 "age"，但类型 "ModalProps<Props, "modal">" 中需要该属性。
const res = await EasyModal.show(InfoModal, { name: 'foo' });
console.log(res); // type res:'modal'
```

## 🔄 更新弹窗属性

你可以使用 `update` 函数动态更新弹窗的属性:

### 合并模式 (默认)

默认情况下,`update` 会将新属性与现有属性合并:

```tsx
// 显示弹窗并传入初始属性
EasyModal.show(InfoModal, { name: 'Alice', age: 25, fileList: ['file1'] });

// 只更新 name,保留 age 和 fileList
EasyModal.update(InfoModal, { name: 'Bob' });
// 结果: { name: 'Bob', age: 25, fileList: ['file1'] }
```

### 替换模式 (v1.0.5+ 新增)

使用 `{ merge: false }` 完全替换属性:

```tsx
// 显示弹窗并传入初始属性
EasyModal.show(InfoModal, { name: 'Alice', age: 25, fileList: ['file1'] });

// 用新属性完全替换所有属性
EasyModal.update(InfoModal, { name: 'Bob' }, { merge: false });
// 结果: { name: 'Bob' } - age 和 fileList 被移除
```

当你需要精确控制更新哪些属性,而不携带之前的值时,这非常有用。

### 使用场景

**表单数据更新:**
```tsx
// 保持表单结构,更新加载状态
EasyModal.update(FormModal, { isLoading: true });

// 完全重置表单
EasyModal.update(FormModal, { formData: newFormData }, { merge: false });
```

**文件列表管理:**
```tsx
// 添加文件的同时保留其他属性
EasyModal.update(UploadModal, { files: [...oldFiles, newFile] });

// 替换文件列表配置
EasyModal.update(UploadModal, { files: newFiles, maxFiles: 1 }, { merge: false });
```

## 鸣谢

1. 风火递 @xpf
2. [nice-modal-react](https://github.com/eBay/nice-modal-react)
3. 感谢[SevenOutman (Doma)](https://github.com/SevenOutman) 仓库搭建的支持, 我借鉴与参考了他的 [aplayer-react](https://github.com/SevenOutman/aplayer-react) 项目。

## LICENSE

[MIT](https://github.com/raotaohub/ez-modal-react/blob/main/LICENSE)

---
