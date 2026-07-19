'use client';

import EasyModal, { type InnerModalProps } from 'ez-modal-react';

interface MessageModalProps extends InnerModalProps<string> {
  message: string;
}

const MessageModal = EasyModal.create((props: MessageModalProps) => (
  <dialog open={props.visible}>
    <p>{props.message}</p>
    <button onClick={() => props.hide('closed')}>Close</button>
  </dialog>
));

export function ModalButton() {
  return (
    <button onClick={() => void EasyModal.show(MessageModal, { message: 'Next.js App Router' })}>
      Open modal
    </button>
  );
}
