const assert = require('node:assert/strict');
const { Window } = require('happy-dom');

const browser = new Window({ url: 'http://localhost/' });
global.window = browser;
global.document = browser.document;
global.navigator = browser.navigator;
global.HTMLElement = browser.HTMLElement;
global.MouseEvent = browser.MouseEvent;
global.IS_REACT_ACT_ENVIRONMENT = true;

const React = require('react');
const { createRoot } = require('react-dom/client');
const { act: legacyAct } = require('react-dom/test-utils');
const act = React.act || legacyAct;
const { createEasyModal, EasyModalProviderUnmountedError } = require('../dist/index.js');

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function main() {
  const manager = createEasyModal();
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  const RawModal = (props) => {
    React.useEffect(() => {
      props.hide('strict-done');
    }, []);
    return React.createElement('span', { 'data-modal': 'raw' }, props.label);
  };

  const Trigger = () => {
    const started = React.useRef(false);
    React.useEffect(() => {
      if (started.current) return;
      started.current = true;
      void manager.show(RawModal, { label: 'Strict modal' }).catch(() => undefined);
    }, []);
    return null;
  };

  await act(async () => {
    root.render(
      React.createElement(
        React.StrictMode,
        null,
        React.createElement(manager.Provider, null, React.createElement(Trigger)),
      ),
    );
    await wait(0);
  });
  await act(async () => {
    await wait(350);
  });
  assert.equal(container.querySelector('[data-modal="raw"]'), null, 'Strict Mode must preserve delayed removal');

  const CreatedModal = manager.create((props) =>
    React.createElement('span', { 'data-modal': 'created', 'data-visible': String(props.visible) }, props.label),
  );
  let pending;
  await act(async () => {
    pending = manager.show(CreatedModal, { label: 'Concurrent root' });
    await wait(0);
  });
  assert.equal(container.querySelector('[data-modal="created"]').textContent, 'Concurrent root');

  await act(async () => {
    root.unmount();
    await wait(0);
  });
  await assert.rejects(pending, EasyModalProviderUnmountedError);

  console.log(`Modern React smoke test passed with React ${React.version}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
