import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import EasyModal, { createEasyModal, EasyModalProviderUnmountedError, useModal } from '../index';
import type { InnerModalProps } from '../type';

interface ModalProps extends InnerModalProps<string> {
  label: string;
}

describe('EasyModal public API integration', () => {
  let containers: HTMLDivElement[];

  const createContainer = () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    containers.push(container);
    return container;
  };

  beforeEach(() => {
    containers = [];
  });

  afterEach(() => {
    containers.forEach((container) => {
      act(() => {
        ReactDOM.unmountComponentAtNode(container);
      });
      container.remove();
    });
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('shows, hides, resolves, and removes a created modal', async () => {
    const manager = createEasyModal();
    const container = createContainer();
    const Modal = manager.create((props: ModalProps) => (
      <button data-testid="modal" data-visible={String(props.visible)} onClick={() => props.hide('done')}>
        {props.label}
      </button>
    ));

    act(() => {
      ReactDOM.render(<manager.Provider />, container);
    });
    let resultPromise!: Promise<string>;
    act(() => {
      resultPromise = manager.show(Modal, { label: 'Open' });
    });

    const button = container.querySelector('[data-testid="modal"]') as HTMLButtonElement;
    expect(button.textContent).toBe('Open');
    expect(button.dataset.visible).toBe('true');

    act(() => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await expect(resultPromise).resolves.toBe('done');
    expect((container.querySelector('[data-testid="modal"]') as HTMLElement).dataset.visible).toBe('false');

    act(() => manager.remove(Modal));
    expect(container.querySelector('[data-testid="modal"]')).toBeNull();
  });

  it('supports direct resolve and reject controls injected into modal props', async () => {
    const manager = createEasyModal();
    const container = createContainer();
    const ResolveModal = manager.create((props: ModalProps) => (
      <button data-testid="resolve" onClick={() => props.resolve('manual')}>resolve</button>
    ));
    const RejectModal = manager.create((props: ModalProps) => (
      <button data-testid="reject" onClick={() => props.reject(new Error('rejected'))}>reject</button>
    ));

    act(() => {
      ReactDOM.render(<manager.Provider />, container);
    });
    let resolved!: Promise<string>;
    act(() => {
      resolved = manager.show(ResolveModal, { label: 'resolve' });
    });
    act(() => (container.querySelector('[data-testid="resolve"]') as HTMLButtonElement).click());
    await expect(resolved).resolves.toBe('manual');
    act(() => manager.remove(ResolveModal));

    let rejected!: Promise<string>;
    act(() => {
      rejected = manager.show(RejectModal, { label: 'reject' });
    });
    act(() => (container.querySelector('[data-testid="reject"]') as HTMLButtonElement).click());
    await expect(rejected).rejects.toThrow('rejected');
  });

  it('does not resolve on hide when resolveOnHide is false', async () => {
    const manager = createEasyModal();
    const container = createContainer();
    const Modal = manager.create((props: ModalProps) => (
      <button data-testid="hide" data-visible={String(props.visible)} onClick={() => props.hide('ignored')} />
    ));

    act(() => {
      ReactDOM.render(<manager.Provider />, container);
    });
    let settled = false;
    act(() => {
      void manager.show(Modal, { label: 'Open' }, { resolveOnHide: false }).then(
        () => {
          settled = true;
        },
        () => undefined,
      );
    });
    act(() => (container.querySelector('[data-testid="hide"]') as HTMLButtonElement).click());
    await Promise.resolve();

    expect(settled).toBe(false);
    expect((container.querySelector('[data-testid="hide"]') as HTMLElement).dataset.visible).toBe('false');
  });

  it('automatically removes a raw component after hide', () => {
    vi.useFakeTimers();
    const manager = createEasyModal();
    const container = createContainer();
    const RawModal = (props: ModalProps) => (
      <button data-testid="raw" onClick={() => props.hide('done')}>raw</button>
    );

    act(() => {
      ReactDOM.render(<manager.Provider />, container);
    });
    act(() => {
      void manager.show(RawModal, { label: 'Raw' });
    });
    act(() => (container.querySelector('[data-testid="raw"]') as HTMLButtonElement).click());
    expect(container.querySelector('[data-testid="raw"]')).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(container.querySelector('[data-testid="raw"]')).toBeNull();
  });

  it('keeps independent manager instances isolated', () => {
    const first = createEasyModal();
    const second = createEasyModal();
    const firstContainer = createContainer();
    const secondContainer = createContainer();
    const FirstModal = first.create((props: ModalProps) => <span>{props.label}</span>);
    const SecondModal = second.create((props: ModalProps) => <span>{props.label}</span>);

    act(() => {
      ReactDOM.render(<first.Provider />, firstContainer);
      ReactDOM.render(<second.Provider />, secondContainer);
      void first.show(FirstModal, { label: 'First' });
      void second.show(SecondModal, { label: 'Second' });
    });

    expect(firstContainer.textContent).toBe('First');
    expect(secondContainer.textContent).toBe('Second');
    expect(() => first.show(SecondModal, { label: 'Wrong owner' })).toThrow(/another EasyModal manager/);
    expect(firstContainer.textContent).toBe('First');
    expect(secondContainer.textContent).toBe('Second');
  });

  it('throws after its Provider has fully unmounted instead of dispatching to stale state', () => {
    vi.useFakeTimers();
    const manager = createEasyModal();
    const container = createContainer();
    const Modal = manager.create((props: ModalProps) => <span>{props.label}</span>);

    act(() => {
      ReactDOM.render(<manager.Provider />, container);
    });
    act(() => {
      ReactDOM.unmountComponentAtNode(container);
      vi.advanceTimersByTime(0);
    });

    expect(() => manager.show(Modal, { label: 'No provider' })).toThrow(/Provider/);
  });

  it('is available to descendant layout effects on the initial commit', () => {
    const manager = createEasyModal();
    const container = createContainer();
    const Modal = manager.create((props: ModalProps) => <span>{props.label}</span>);
    const Opener = () => {
      React.useLayoutEffect(() => {
        void manager.show(Modal, { label: 'Layout effect' });
      }, []);
      return null;
    };

    act(() => {
      ReactDOM.render(
        <manager.Provider>
          <Opener />
        </manager.Provider>,
        container,
      );
    });

    expect(container.textContent).toBe('Layout effect');
  });

  it('allows descendant cleanup to settle a modal before store disposal', async () => {
    vi.useFakeTimers();
    const manager = createEasyModal();
    const container = createContainer();
    const Modal = manager.create((props: ModalProps) => <span>{props.label}</span>);
    let resultPromise: Promise<string> | undefined;
    const Owner = () => {
      React.useLayoutEffect(() => {
        resultPromise = manager.show(Modal, { label: 'Owned' });
        return () => manager.hide(Modal, 'cleanup');
      }, []);
      return null;
    };

    act(() => {
      ReactDOM.render(
        <manager.Provider>
          <Owner />
        </manager.Provider>,
        container,
      );
    });
    act(() => {
      ReactDOM.unmountComponentAtNode(container);
      vi.advanceTimersByTime(0);
    });

    await expect(resultPromise).resolves.toBe('cleanup');
  });

  it('rejects pending modal promises when the Provider is disposed', async () => {
    vi.useFakeTimers();
    const manager = createEasyModal();
    const container = createContainer();
    const Modal = manager.create((props: ModalProps) => <span>{props.label}</span>);

    act(() => {
      ReactDOM.render(<manager.Provider />, container);
    });
    let pending!: Promise<string>;
    act(() => {
      pending = manager.show(Modal, { label: 'Pending' });
    });
    act(() => {
      ReactDOM.unmountComponentAtNode(container);
      vi.advanceTimersByTime(0);
    });

    await expect(pending).rejects.toBeInstanceOf(EasyModalProviderUnmountedError);
  });

  it('tracks promises after a same-id modal record is replaced', async () => {
    vi.useFakeTimers();
    const manager = createEasyModal();
    const container = createContainer();
    const Modal = manager.create((props: ModalProps) => <span>{props.label}</span>);

    act(() => {
      ReactDOM.render(<manager.Provider />, container);
    });
    let first!: Promise<string>;
    let second!: Promise<string>;
    act(() => {
      first = manager.show(Modal, { label: 'First' });
      second = manager.show(Modal, { label: 'Second' });
      ReactDOM.unmountComponentAtNode(container);
      vi.advanceTimersByTime(0);
    });

    await expect(first).rejects.toBeInstanceOf(EasyModalProviderUnmountedError);
    await expect(second).rejects.toBeInstanceOf(EasyModalProviderUnmountedError);
  });

  it('tracks unresolved promises after their modal record is explicitly removed', async () => {
    vi.useFakeTimers();
    const manager = createEasyModal();
    const container = createContainer();
    const Modal = manager.create((props: ModalProps) => <span>{props.label}</span>);

    act(() => {
      ReactDOM.render(<manager.Provider />, container);
    });
    let pending!: Promise<string>;
    act(() => {
      pending = manager.show(Modal, { label: 'Removed' });
      manager.remove(Modal);
      ReactDOM.unmountComponentAtNode(container);
      vi.advanceTimersByTime(0);
    });

    await expect(pending).rejects.toBeInstanceOf(EasyModalProviderUnmountedError);
  });

  it('tracks unresolved raw-modal promises after automatic removal', async () => {
    vi.useFakeTimers();
    const manager = createEasyModal();
    const container = createContainer();
    const RawModal = (props: ModalProps) => <button onClick={() => props.hide('ignored')}>hide</button>;

    act(() => {
      ReactDOM.render(<manager.Provider />, container);
    });
    let pending!: Promise<string>;
    act(() => {
      pending = manager.show(RawModal, { label: 'Raw' }, { resolveOnHide: false });
    });
    act(() => {
      (container.querySelector('button') as HTMLButtonElement).click();
      vi.advanceTimersByTime(300);
    });
    expect(container.querySelector('button')).toBeNull();
    act(() => {
      ReactDOM.unmountComponentAtNode(container);
      vi.advanceTimersByTime(0);
    });

    await expect(pending).rejects.toBeInstanceOf(EasyModalProviderUnmountedError);
  });

  it('invalidates callbacks captured from a disposed Provider', () => {
    vi.useFakeTimers();
    const manager = createEasyModal();
    const container = createContainer();
    let capturedHide: (() => void) | undefined;
    const Modal = manager.create((props: ModalProps) => {
      capturedHide = () => props.hide('late');
      return <span>{props.label}</span>;
    });

    act(() => {
      ReactDOM.render(<manager.Provider />, container);
      void manager.show(Modal, { label: 'Capture' });
    });
    act(() => {
      ReactDOM.unmountComponentAtNode(container);
      vi.advanceTimersByTime(0);
    });

    expect(capturedHide).toBeDefined();
    expect(() => capturedHide?.()).toThrow(/unmounted/);
  });

  it('retains the default singleton and named useModal API', () => {
    const container = createContainer();
    const Modal = EasyModal.create((props: ModalProps) => {
      const modal = useModal<ModalProps>();
      return <span>{props.label}:{String(modal.visible)}</span>;
    });

    act(() => {
      ReactDOM.render(<EasyModal.Provider />, container);
    });
    act(() => {
      void EasyModal.show(Modal, { label: 'Default' });
    });

    expect(container.textContent).toBe('Default:true');
  });
});
