/**
 * Core functionality tests for ez-modal-react
 * Tests the state management logic without React component rendering
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { MODAL_REGISTRY, isValidId, getUid } from '../share';

describe('Core Utility Functions', () => {
  describe('isValidId', () => {
    it('should return true for valid string id', () => {
      expect(isValidId('test-id')).toBe(true);
      expect(isValidId('123')).toBe(true);
    });

    it('should return true for valid number id', () => {
      expect(isValidId(123)).toBe(true);
      expect(isValidId(0)).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(isValidId('')).toBe(false);
    });

    it('should return false for NaN', () => {
      expect(isValidId(NaN)).toBe(false);
    });

    it('should return false for null and undefined', () => {
      expect(isValidId(null)).toBe(false);
      expect(isValidId(undefined)).toBe(false);
    });
  });

  describe('getUid', () => {
    it('should return provided id if valid', () => {
      expect(getUid('custom-id')).toBe('custom-id');
      expect(getUid(123)).toBe(123);
    });

    it('should generate unique id if no id provided', () => {
      const id1 = getUid();
      const id2 = getUid();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
    });

    it('should generate unique id if invalid id provided', () => {
      const id = getUid('');
      expect(typeof id).toBe('string');
      expect(id).not.toBe('');
    });
  });
});

describe('MODAL_REGISTRY', () => {
  beforeEach(() => {
    // Clear registry before each test
    Object.keys(MODAL_REGISTRY).forEach((key) => {
      delete MODAL_REGISTRY[key];
    });
  });

  it('should be an object', () => {
    expect(typeof MODAL_REGISTRY).toBe('object');
  });

  it('should store modal information', () => {
    const testId = 'test-modal-1';
    MODAL_REGISTRY[testId] = {
      Component: (() => null) as any,
      props: { name: 'test' },
      id: testId,
    };

    expect(MODAL_REGISTRY[testId]).toBeDefined();
    expect(MODAL_REGISTRY[testId].props).toEqual({ name: 'test' });
  });

  it('should allow deletion', () => {
    const testId = 'test-modal-2';
    MODAL_REGISTRY[testId] = {
      Component: (() => null) as any,
      props: {},
      id: testId,
    };

    expect(MODAL_REGISTRY[testId]).toBeDefined();

    delete MODAL_REGISTRY[testId];

    expect(MODAL_REGISTRY[testId]).toBeUndefined();
  });
});
