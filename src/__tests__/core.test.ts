import { describe, expect, it } from 'vitest';
import { getModalId, getUid, isValidEasyHOC, isValidId } from '../share';
import { createEasyModal } from '../index';
import type { InnerModalProps } from '../type';

describe('core utilities', () => {
  it('accepts non-empty string, zero, and number ids', () => {
    expect(isValidId('modal')).toBe(true);
    expect(isValidId(0)).toBe(true);
    expect(isValidId(42)).toBe(true);
  });

  it('rejects invalid ids', () => {
    expect(isValidId('')).toBe(false);
    expect(isValidId(Number.NaN)).toBe(false);
    expect(isValidId(null)).toBe(false);
    expect(isValidId(undefined)).toBe(false);
    expect(isValidId({})).toBe(false);
  });

  it('preserves a valid supplied id and generates unique fallback ids', () => {
    expect(getUid('custom')).toBe('custom');
    expect(getUid(0)).toBe(0);
    const first = getUid();
    const second = getUid();
    expect(first).not.toBe(second);
  });

  it('recognizes manager-created modal HOCs', () => {
    const manager = createEasyModal();
    const Modal = manager.create((_props: InnerModalProps) => null);
    expect(isValidEasyHOC(Modal)).toBe(true);
    expect(isValidEasyHOC(() => null)).toBe(false);
  });

  it('assigns a stable id to a modal HOC', () => {
    const manager = createEasyModal();
    const Modal = manager.create((_props: InnerModalProps) => null);
    const id = getModalId(Modal, 'stable-id');
    expect(id).toBe('stable-id');
    expect(getModalId(Modal, 'ignored-later-id')).toBe(id);
  });
});
