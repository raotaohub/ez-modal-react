import { useState } from 'react';
import { Modal, Button, Space, Input, message } from 'antd';
import EasyModal, { useModal } from '../../src';
import { InnerModalProps } from '../../src/type';

interface Props extends InnerModalProps<string> {
  name: string;
  age: number;
}

export const Info = EasyModal.create((props: Props) => {
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
    <Modal title="Hello Antd1" open={modal.visible} onOk={() => handleSave()} onCancel={() => modal.hide(null)}>
      Greetings: {props.name}!
      <div style={{ padding: '10px 0' }}>
        remark:
        <Input value={remark} onChange={(e) => setRemark(e.target.value)} style={{ width: 180 }} />
      </div>
    </Modal>
  );
});

export default function ComplexModal() {
  return (
    <Space>
      <Button
        type="primary"
        onClick={async () => {
          EasyModal.show(Info, { name: 'happy', age: 19 }).then((result) => {
            console.log('show-result:', result);
          });

          EasyModal.show(Info, { name: 'happy2', age: 19 }).then((result) => {
            console.log('show-result:', result);
          });

          EasyModal.update(Info, { name: 'happy3' });
        }}
      >
        Complex Modal
      </Button>
    </Space>
  );
}
