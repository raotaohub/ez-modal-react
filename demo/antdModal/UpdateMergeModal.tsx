import { useState } from 'react';
import { Modal, Button, Space, Input, message } from 'antd';
import EasyModal, { useModal } from '../../src';
import { InnerModalProps } from '../../src/type';

/**
 * Demonstrates the new update function features (Issue #4)
 * Shows both merge mode (default) and replace mode
 */

interface Props extends InnerModalProps<string> {
  name: string;
  age: number;
  fileList?: string[];
}

export const UpdateMergeModal = EasyModal.create((props: Props) => {
  const modal = useModal<Props>();
  const [remark, setRemark] = useState('');

  const handleSave = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      modal.hide(remark);
      message.success('Saved successfully');
    } catch (error) {
      message.error('Failed to save');
    }
  };

  return (
    <Modal title="Update Merge Modal" open={modal.visible} onOk={handleSave} onCancel={() => modal.hide(null)} width={600}>
      <div style={{ padding: '10px 0' }}>
        <h3>Current Props:</h3>
        <p>Name: {props.name}</p>
        <p>Age: {props.age}</p>
        <p>File List: {props.fileList?.join(', ') || 'undefined'}</p>
      </div>

      <div style={{ padding: '10px 0' }}>
        remark: <Input value={remark} onChange={(e) => setRemark(e.target.value)} style={{ width: 180 }} />
      </div>

      <Space direction="vertical" style={{ width: '100%', marginTop: 16 }}>
        <h4>Merge Mode (Default):</h4>
        <Space>
          <Button
            type="primary"
            onClick={() => {
              // Merge mode: only update name, keep age and fileList
              EasyModal.update(UpdateMergeModal, { name: 'Updated Name (Merge)' });
            }}
          >
            Update Name (Merge)
          </Button>
          <Button
            onClick={() => {
              // Merge mode: only update age
              EasyModal.update(UpdateMergeModal, { age: 99 });
            }}
          >
            Update Age (Merge)
          </Button>
        </Space>

        <h4>Replace Mode (New):</h4>
        <Space>
          <Button
            danger
            onClick={() => {
              // Replace mode: only keep name, remove age and fileList
              EasyModal.update(UpdateMergeModal, { name: 'Only Name (Replace)' }, { merge: false });
            }}
          >
            Replace with Name Only
          </Button>
          <Button
            danger
            onClick={() => {
              // Replace mode: completely new props
              EasyModal.update(
                UpdateMergeModal,
                {
                  name: 'New Config',
                  age: 0,
                  fileList: ['new-file-1.txt'],
                },
                { merge: false }
              );
            }}
          >
            Replace All Props
          </Button>
        </Space>

        <h4>Use Case: File Upload Simulation</h4>
        <Button
          onClick={() => {
            // Simulate file upload completion in finally block
            // Using replace mode to avoid carrying over old fileList
            EasyModal.update(
              UpdateMergeModal,
              {
                name: 'After Upload',
                fileList: ['uploaded-file.pdf'],
              },
              { merge: false }
            );
          }}
        >
          Simulate Upload Complete
        </Button>
      </Space>
    </Modal>
  );
});

export default function UpdateMergeDemo() {
  return (
    <Space>
      <Button
        type="primary"
        onClick={async () => {
          // Show with initial props including fileList
          EasyModal.show(UpdateMergeModal, {
            name: 'Initial Name',
            age: 25,
            fileList: ['initial-file1.txt', 'initial-file2.txt'],
          }).then((result) => {
            console.log('Modal result:', result);
          });
        }}
      >
        Update Merge Modal
      </Button>
    </Space>
  );
}
