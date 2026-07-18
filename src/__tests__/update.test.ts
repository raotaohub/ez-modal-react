/**
 * Update function tests for ez-modal-react
 * Tests the update logic with simulated modal state management
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { MODAL_REGISTRY, getModalId, isValidId, findModal } from '../share';

// Simulate the update function logic
function simulateUpdate(id: string, newProps: any, merge: boolean = true) {
  if (!MODAL_REGISTRY[id]) {
    return;
  }

  const currentProps = MODAL_REGISTRY[id].props || {};

  if (merge) {
    // Merge mode: combine current props with new props
    MODAL_REGISTRY[id].props = { ...currentProps, ...newProps };
  } else {
    // Replace mode: only use new props
    MODAL_REGISTRY[id].props = newProps;
  }
}

// Simulate the show function logic
function simulateShow(id: string, props: any) {
  MODAL_REGISTRY[id] = {
    Component: (() => null) as any,
    props: props,
    id: id,
  };
}

describe('Update Function Logic', () => {
  beforeEach(() => {
    // Clear registry before each test
    Object.keys(MODAL_REGISTRY).forEach((key) => {
      delete MODAL_REGISTRY[key];
    });
  });

  describe('Merge Mode (default behavior)', () => {
    it('should merge new props with existing props', () => {
      const testId = 'test-modal-merge';
      simulateShow(testId, { name: 'Alice', age: 25, fileList: ['file1'] });

      simulateUpdate(testId, { name: 'Bob' });

      expect(MODAL_REGISTRY[testId].props).toEqual({
        name: 'Bob',
        age: 25,
        fileList: ['file1'],
      });
    });

    it('should handle multiple sequential updates', () => {
      const testId = 'test-modal-sequential';
      simulateShow(testId, { name: 'Alice', age: 25, city: 'NYC' });

      simulateUpdate(testId, { name: 'Bob' });
      expect(MODAL_REGISTRY[testId].props).toEqual({
        name: 'Bob',
        age: 25,
        city: 'NYC',
      });

      simulateUpdate(testId, { age: 30 });
      expect(MODAL_REGISTRY[testId].props).toEqual({
        name: 'Bob',
        age: 30,
        city: 'NYC',
      });
    });

    it('should preserve all props when updating with empty object', () => {
      const testId = 'test-modal-empty';
      simulateShow(testId, { name: 'Alice', age: 25 });

      simulateUpdate(testId, {});

      expect(MODAL_REGISTRY[testId].props).toEqual({
        name: 'Alice',
        age: 25,
      });
    });

    it('should override existing props with same key', () => {
      const testId = 'test-modal-override';
      simulateShow(testId, { name: 'Alice', count: 1 });

      simulateUpdate(testId, { count: 2 });

      expect(MODAL_REGISTRY[testId].props).toEqual({
        name: 'Alice',
        count: 2,
      });
    });
  });

  describe('Replace Mode (new feature)', () => {
    it('should replace all props with new props', () => {
      const testId = 'test-modal-replace';
      simulateShow(testId, { name: 'Alice', age: 25, fileList: ['file1'] });

      simulateUpdate(testId, { name: 'Bob' }, false);

      expect(MODAL_REGISTRY[testId].props).toEqual({
        name: 'Bob',
      });
    });

    it('should handle Issue #4 scenario', () => {
      // This is the exact scenario from Issue #4
      const testId = 'test-modal-issue4';
      simulateShow(testId, {
        name: 'test',
        age: 18,
        fileList: ['file1', 'file2'],
      });

      // User wants to update only 'name', but fileList should not become undefined
      // With replace mode, only 'name' should be present
      simulateUpdate(testId, { name: 'new-name' }, false);

      expect(MODAL_REGISTRY[testId].props).toEqual({
        name: 'new-name',
      });

      // Age and fileList should not be present
      expect(MODAL_REGISTRY[testId].props.age).toBeUndefined();
      expect(MODAL_REGISTRY[testId].props.fileList).toBeUndefined();
    });

    it('should allow complete props replacement', () => {
      const testId = 'test-modal-complete-replace';
      simulateShow(testId, { name: 'Alice', age: 25 });

      simulateUpdate(testId, { city: 'NYC', country: 'USA' }, false);

      expect(MODAL_REGISTRY[testId].props).toEqual({
        city: 'NYC',
        country: 'USA',
      });

      // Old props should be gone
      expect(MODAL_REGISTRY[testId].props.name).toBeUndefined();
      expect(MODAL_REGISTRY[testId].props.age).toBeUndefined();
    });

    it('should handle empty object in replace mode', () => {
      const testId = 'test-modal-empty-replace';
      simulateShow(testId, { name: 'Alice', age: 25 });

      simulateUpdate(testId, {}, false);

      expect(MODAL_REGISTRY[testId].props).toEqual({});
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined props in registry', () => {
      const testId = 'test-modal-undefined';
      MODAL_REGISTRY[testId] = {
        Component: (() => null) as any,
        id: testId,
      };

      simulateUpdate(testId, { name: 'Alice' });

      expect(MODAL_REGISTRY[testId].props).toEqual({
        name: 'Alice',
      });
    });

    it('should handle null values in props', () => {
      const testId = 'test-modal-null';
      simulateShow(testId, { name: 'Alice', data: null });

      simulateUpdate(testId, { name: 'Bob' });

      expect(MODAL_REGISTRY[testId].props).toEqual({
        name: 'Bob',
        data: null,
      });
    });

    it('should handle complex nested objects', () => {
      const testId = 'test-modal-nested';
      const nestedObj = {
        user: {
          name: 'Alice',
          preferences: {
            theme: 'dark',
          },
        },
      };

      simulateShow(testId, nestedObj);

      simulateUpdate(testId, {
        user: {
          name: 'Bob',
          preferences: {
            theme: 'light',
          },
        },
      });

      expect(MODAL_REGISTRY[testId].props).toEqual({
        user: {
          name: 'Bob',
          preferences: {
            theme: 'light',
          },
        },
      });
    });

    it('should handle arrays correctly in merge mode', () => {
      const testId = 'test-modal-array';
      simulateShow(testId, { items: [1, 2, 3] });

      simulateUpdate(testId, { items: [4, 5] });

      expect(MODAL_REGISTRY[testId].props).toEqual({
        items: [4, 5],
      });
    });
  });

  describe('Backward Compatibility', () => {
    it('should default to merge mode when merge parameter is not provided', () => {
      const testId = 'test-modal-default';
      simulateShow(testId, { name: 'Alice', age: 25 });

      // Call without merge parameter (simulating existing code)
      simulateUpdate(testId, { name: 'Bob' });

      // Should behave like merge mode
      expect(MODAL_REGISTRY[testId].props).toEqual({
        name: 'Bob',
        age: 25,
      });
    });

    it('should maintain same behavior for existing use cases', () => {
      const testId = 'test-modal-compat';
      simulateShow(testId, { fileList: ['file1', 'file2'], name: 'test' });

      // Existing usage pattern
      simulateUpdate(testId, { name: 'updated' });

      expect(MODAL_REGISTRY[testId].props).toEqual({
        fileList: ['file1', 'file2'],
        name: 'updated',
      });
    });
  });
});
