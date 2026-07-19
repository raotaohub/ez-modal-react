'use client';

import type { PropsWithChildren } from 'react';
import EasyModal from 'ez-modal-react';

export function Providers({ children }: PropsWithChildren) {
  return <EasyModal.Provider>{children}</EasyModal.Provider>;
}
