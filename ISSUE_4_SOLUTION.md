# Issue #4: precise update control

Issue: [update function supplement](https://github.com/raotaohub/ez-modal-react/issues/4)

## Resolution

`EasyModal.update` supports merge and replace strategies:

```tsx
EasyModal.update(InfoModal, { name: 'Bob' });
// merge is true by default; all other current props remain

EasyModal.update(InfoModal, { name: 'Bob' }, { merge: false });
// replaces the current props with only the supplied fields
```

The implementation always reads from the owning Provider store. It no longer merges against a process-wide registry, so sequential updates use the latest state and separate manager instances cannot leak props into each other.

## 2.0 architecture

Starting in `2.0.0-alpha.0`:

- Modal state and delayed removal timers belong to a Provider-scoped store.
- Reducers no longer mutate external registries.
- The default `EasyModal` API remains available.
- `createEasyModal()` creates isolated managers for multiple roots, tests, and micro-frontends.
- Imperative calls require a mounted matching Provider and a browser environment.

```tsx
import { createEasyModal } from 'ez-modal-react';

const modalManager = createEasyModal();

<modalManager.Provider>
  <App />
</modalManager.Provider>;
```

## Verification

The test suite executes the public React API rather than simulating object merges. Coverage includes:

- default merge and explicit replace updates;
- sequential updates and custom IDs;
- Promise resolve/reject and `resolveOnHide`;
- delayed removal of raw components;
- manager isolation and Provider unmount behavior;
- default singleton and named `useModal` compatibility.
