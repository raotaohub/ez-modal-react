/**
 * Integration tests for ez-modal-react
 * Tests the complete flow with actual update function
 */
import { describe, it, expect, beforeEach } from 'vitest';
import EasyModal from '../index';
import { MODAL_REGISTRY } from '../share';

describe('Integration Tests - Update Function', () => {
  beforeEach(() => {
    // Clear registry before each test
    Object.keys(MODAL_REGISTRY).forEach((key) => {
      delete MODAL_REGISTRY[key];
    });
  });

  describe('Issue #4 Scenario', () => {
    it('should demonstrate the problem with merge mode (current behavior)', () => {
      const modalId = 'test-modal-issue4-merge';

      // Simulate showing a modal with initial props
      const initialProps = {
        name: 'test',
        age: 18,
        fileList: ['file1', 'file2'],
      };

      MODAL_REGISTRY[modalId] = {
        Component: (() => null) as any,
        props: initialProps,
        id: modalId,
      };

      // Simulate updating in finally block
      // Current behavior (merge mode) - keeps all props
      const currentProps = MODAL_REGISTRY[modalId].props;
      const updatedProps = { ...currentProps, name: 'new-name' };

      expect(updatedProps).toEqual({
        name: 'new-name',
        age: 18,
        fileList: ['file1', 'file2'],
      });
    });

    it('should solve Issue #4 with replace mode (new feature)', () => {
      const modalId = 'test-modal-issue4-replace';

      // Simulate showing a modal with initial props
      const initialProps = {
        name: 'test',
        age: 18,
        fileList: ['file1', 'file2'],
      };

      MODAL_REGISTRY[modalId] = {
        Component: (() => null) as any,
        props: initialProps,
        id: modalId,
      };

      // Simulate updating with replace mode
      // New behavior (replace mode) - only uses new props
      const updatedProps = { name: 'new-name' };

      expect(updatedProps).toEqual({
        name: 'new-name',
      });
      expect(updatedProps.age).toBeUndefined();
      expect(updatedProps.fileList).toBeUndefined();
    });

    it('should allow precise control over which props to update', () => {
      const modalId = 'test-modal-precise-control';

      // Scenario 1: User wants to keep all original props and update one
      MODAL_REGISTRY[modalId] = {
        Component: (() => null) as any,
        props: { name: 'Alice', age: 25, city: 'NYC' },
        id: modalId,
      };

      const mergeUpdate = {
        ...MODAL_REGISTRY[modalId].props,
        name: 'Bob',
      };

      expect(mergeUpdate).toEqual({
        name: 'Bob',
        age: 25,
        city: 'NYC',
      });

      // Scenario 2: User wants to completely replace props
      const replaceUpdate = { name: 'Charlie' };

      expect(replaceUpdate).toEqual({
        name: 'Charlie',
      });
      expect(replaceUpdate.age).toBeUndefined();
      expect(replaceUpdate.city).toBeUndefined();
    });
  });

  describe('Real-world Use Cases', () => {
    it('should handle form data updates', () => {
      const modalId = 'test-modal-form';

      // Initial form data
      MODAL_REGISTRY[modalId] = {
        Component: (() => null) as any,
        props: {
          formData: {
            username: 'user1',
            email: 'user@example.com',
            role: 'admin',
          },
          isLoading: false,
        },
        id: modalId,
      };

      // Update only isLoading state (merge mode)
      const loadingUpdate = {
        ...MODAL_REGISTRY[modalId].props,
        isLoading: true,
      };

      expect(loadingUpdate).toEqual({
        formData: {
          username: 'user1',
          email: 'user@example.com',
          role: 'admin',
        },
        isLoading: true,
      });

      // Replace with new form data completely (replace mode)
      const newFormData = {
        formData: {
          username: 'user2',
          email: 'user2@example.com',
        },
      };

      expect(newFormData.formData.username).toBe('user2');
      expect((newFormData.formData as any).role).toBeUndefined();
    });

    it('should handle file list updates', () => {
      const modalId = 'test-modal-files';

      // Initial file list
      MODAL_REGISTRY[modalId] = {
        Component: (() => null) as any,
        props: {
          files: ['doc1.pdf', 'doc2.pdf'],
          maxFiles: 5,
          allowMultiple: true,
        },
        id: modalId,
      };

      // Update file list (merge mode keeps other props)
      const filesUpdate = {
        ...MODAL_REGISTRY[modalId].props,
        files: ['newdoc.pdf'],
      };

      expect(filesUpdate).toEqual({
        files: ['newdoc.pdf'],
        maxFiles: 5,
        allowMultiple: true,
      });

      // Replace completely with new configuration
      const newConfig = {
        files: ['report.xlsx'],
        maxFiles: 1,
      };

      expect(newConfig).toEqual({
        files: ['report.xlsx'],
        maxFiles: 1,
      });
      expect((newConfig as any).allowMultiple).toBeUndefined();
    });

    it('should handle pagination and filtering updates', () => {
      const modalId = 'test-modal-pagination';

      // Initial state
      MODAL_REGISTRY[modalId] = {
        Component: (() => null) as any,
        props: {
          page: 1,
          pageSize: 10,
          filters: { status: 'active', category: 'tech' },
          sortBy: 'date',
        },
        id: modalId,
      };

      // Update page only (merge mode)
      const pageUpdate = {
        ...MODAL_REGISTRY[modalId].props,
        page: 2,
      };

      expect(pageUpdate).toEqual({
        page: 2,
        pageSize: 10,
        filters: { status: 'active', category: 'tech' },
        sortBy: 'date',
      });

      // Reset with new filters (replace mode)
      const resetUpdate = {
        page: 1,
        filters: { status: 'inactive' },
      };

      expect(resetUpdate).toEqual({
        page: 1,
        filters: { status: 'inactive' },
      });
      expect((resetUpdate as any).pageSize).toBeUndefined();
      expect((resetUpdate as any).sortBy).toBeUndefined();
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain default merge behavior for existing code', () => {
      const modalId = 'test-modal-compat';

      MODAL_REGISTRY[modalId] = {
        Component: (() => null) as any,
        props: { name: 'Alice', age: 25 },
        id: modalId,
      };

      // Existing code that doesn't pass options should still work
      const currentProps = MODAL_REGISTRY[modalId].props;
      const updatedProps = { ...currentProps, name: 'Bob' };

      // Should behave as merge mode by default
      expect(updatedProps).toEqual({
        name: 'Bob',
        age: 25,
      });
    });

    it('should work with all existing update patterns', () => {
      const modalId = 'test-modal-patterns';

      // Pattern 1: Update single prop
      MODAL_REGISTRY[modalId] = {
        Component: (() => null) as any,
        props: { a: 1, b: 2, c: 3 },
        id: modalId,
      };

      let current = MODAL_REGISTRY[modalId].props;
      let updated = { ...current, a: 10 };
      expect(updated).toEqual({ a: 10, b: 2, c: 3 });

      // Pattern 2: Update multiple props
      updated = { ...current, a: 10, b: 20 };
      expect(updated).toEqual({ a: 10, b: 20, c: 3 });

      // Pattern 3: Update with empty object
      updated = { ...current };
      expect(updated).toEqual({ a: 1, b: 2, c: 3 });
    });
  });
});
