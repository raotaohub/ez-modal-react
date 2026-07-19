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

1. 基于 **Promise** 管理弹窗生命周期，减少重复的可见状态管理。
2. 支持弹窗属性约束和 Promise 返回值类型推导。
3. 支持 Next.js Pages Router 和 App Router，发布产物自带 `"use client"` 边界。
4. Provider 级状态隔离，并可通过 `createEasyModal()` 创建独立管理器。
5. React 16.8+、体积小、无侵入性、支持任意 UI 库。

## 🔨 Documentations

[中文文档](https://raotaohub.github.io/ez-modal-react-book) | [English](https://raotaohub.github.io/ez-modal-react-book/en-US)

[Example](https://raotaohub.github.io/ez-modal-react-book/example) | [codesandbox](https://codesandbox.io/p/sandbox/confident-shape-rt7bzr?embed=1)

## 📦 安装

```shell
# 2.0 alpha
npm install ez-modal-react@2.0.0-alpha.0

# 或者
yarn add ez-modal-react@2.0.0-alpha.0
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

## Next.js

发布入口已经声明为 Client Component，因此同时支持 Pages Router 和 App Router。`show`、`update`、`hide`、`remove` 都是客户端方法，只能在事件处理函数或 Effect 中调用，不能在 Server Component 或 Server Action 中调用。

### App Router

```tsx
// app/providers.tsx
'use client';

import type { PropsWithChildren } from 'react';
import EasyModal from 'ez-modal-react';

export function Providers({ children }: PropsWithChildren) {
  return <EasyModal.Provider>{children}</EasyModal.Provider>;
}
```

```tsx
// app/layout.tsx（Server Component）
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
```

### Pages Router

在 `pages/_app.tsx` 中使用 `EasyModal.Provider` 包裹 `Component` 即可。

## 独立管理器

默认导出保持向后兼容。多 React 根节点、微前端、测试隔离或嵌套应用应为每个 Provider 创建独立管理器：

```tsx
import { createEasyModal } from 'ez-modal-react';

export const adminModal = createEasyModal();

<adminModal.Provider>
  <AdminApp />
</adminModal.Provider>;

adminModal.show(AdminDialog, props);
```

由某个管理器创建的 Modal 必须通过同一个管理器操作。为了让命令式 API 的路由始终确定，一个管理器只挂载一个 Provider。

## 2.0 Alpha 迁移说明

- 原有 `EasyModal.show()` 等默认单例 API 继续支持。
- 在 Provider 挂载前、完全销毁后或服务端渲染期间调用命令式方法，现在会抛出明确错误，不再写入陈旧的全局状态。
- Provider 销毁时，尚未完成的弹窗 Promise 会通过 `EasyModalProviderUnmountedError` 拒绝。
- 应用需要多个 Provider 时，使用 `createEasyModal()` 创建隔离实例。

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

### 替换模式 (v1.0.6+)

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
