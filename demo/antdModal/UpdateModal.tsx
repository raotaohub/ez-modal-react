import { useState } from 'react';
import { Modal, Button, Space, Input, message } from 'antd';
import EasyModal, { useModal } from '../../src';
import { InnerModalProps } from '../../src/type';

interface Props extends InnerModalProps<string> {
  name: string;
  age: number;
}

export const UpdateModal = EasyModal.create((props: Props) => {
  const modal = useModal<Props>();
  const [remark, setRemark] = useState('');

  const handleSave = async () => {
    try {
      const val = await new Promise((resolve) => {
        return setTimeout(() => {
          resolve('request' + remark);
        }, 1000);
      });

      modal.hide(remark);
      message.success('easy' + val);
    } catch (error) {
      // ...
    }
  };

  return (
    <Modal title="Update Modal" open={modal.visible} onOk={() => handleSave()} onCancel={() => modal.hide(null)}>
      Hello: {props.name}!
      <div style={{ padding: '10px 0' }}>
        remark:
        <Input value={remark} onChange={(e) => setRemark(e.target.value)} style={{ width: 180 }} />
      </div>
      <div style={{ padding: '10px 0' }}>age:{props.age}</div>
      <Button
        onClick={() => {
          EasyModal.update(UpdateModal, { name: 'update happy', age: 20 });
        }}
      >
        Update
      </Button>
    </Modal>
  );
});

export default function ComplexModal() {
  return (
    <Space>
      <Button
        type="primary"
        onClick={async () => {
          EasyModal.show(UpdateModal, { name: 'happy', age: 19 }, { removeOnHide: false }).then((result) => {
            console.log('show-result:', result);
          });
        }}
      >
        Update Modal
      </Button>
    </Space>
  );
}
