import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createEasyModal } from '../index';
import type { InnerModalProps } from '../type';

interface ModalProps extends InnerModalProps<string> {
  name: string;
  age?: number;
  fileList?: string[];
}

describe('EasyModal.update', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    act(() => {
      ReactDOM.unmountComponentAtNode(container);
    });
    container.remove();
  });

  const setup = () => {
    const manager = createEasyModal();
    const Modal = manager.create((props: ModalProps) => (
      <section
        data-testid="modal"
        data-name={props.name}
        data-age={props.age === undefined ? 'undefined' : String(props.age)}
        data-files={props.fileList?.join(',') ?? 'undefined'}
        data-visible={String(props.visible)}
      />
    ));

    act(() => {
      ReactDOM.render(<manager.Provider />, container);
    });
    return { manager, Modal };
  };

  const modalElement = () => container.querySelector('[data-testid="modal"]') as HTMLElement;

  it('merges partial props by default', () => {
    const { manager, Modal } = setup();
    act(() => {
      void manager.show(Modal, { name: 'Alice', age: 25, fileList: ['a.txt', 'b.txt'] });
    });
    act(() => manager.update(Modal, { name: 'Bob' }));

    expect(modalElement().dataset.name).toBe('Bob');
    expect(modalElement().dataset.age).toBe('25');
    expect(modalElement().dataset.files).toBe('a.txt,b.txt');
  });

  it('replaces props when merge is false', () => {
    const { manager, Modal } = setup();
    act(() => {
      void manager.show(Modal, { name: 'Alice', age: 25, fileList: ['a.txt'] });
    });
    act(() => manager.update(Modal, { name: 'Bob' }, { merge: false }));

    expect(modalElement().dataset.name).toBe('Bob');
    expect(modalElement().dataset.age).toBe('undefined');
    expect(modalElement().dataset.files).toBe('undefined');
  });

  it('accumulates sequential merge updates from current props', () => {
    const { manager, Modal } = setup();
    act(() => {
      void manager.show(Modal, { name: 'Alice', age: 20 });
      manager.update(Modal, { name: 'Bob' });
      manager.update(Modal, { age: 30 });
    });

    expect(modalElement().dataset.name).toBe('Bob');
    expect(modalElement().dataset.age).toBe('30');
  });

  it('updates a modal by custom id', () => {
    const { manager, Modal } = setup();
    act(() => {
      void manager.show(Modal, { name: 'Before', age: 1 }, { id: 'custom-modal' });
      manager.update('custom-modal', { name: 'After' });
    });

    expect(modalElement().dataset.name).toBe('After');
    expect(modalElement().dataset.age).toBe('1');
  });

  it('does not mutate the props object supplied to show', () => {
    const { manager, Modal } = setup();
    const initialProps = { name: 'Alice', age: 25, fileList: ['a.txt'] };
    act(() => {
      void manager.show(Modal, initialProps);
      manager.update(Modal, { name: 'Bob' });
    });

    expect(initialProps).toEqual({ name: 'Alice', age: 25, fileList: ['a.txt'] });
  });
});
