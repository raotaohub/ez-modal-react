/*
 * @Author: raotaohub
 * @Date: 2023-08-10 22:39:49
 * @LastEditTime: 2023-08-10 22:44:29
 * @LastEditors: raotaohub
 * @FilePath: /ez-modal-react/demo/antdModal/ComplexModal.new.tsx
 * @Description: Edit......
 */
import { useState } from 'react';
import { Modal, Button, Space, Input, message } from 'antd';
import EasyModalNew, { InnerModalProps, useModal } from '../../src/index.new';

interface Props extends InnerModalProps<string> {
  name: string;
  age: number;
}

export const Info = (props: Props) => {
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
};

export default function ComplexModalNew() {
  return (
    <Space>
      <Button
        type="primary"
        onClick={async () => {
          EasyModalNew.show(Info, { name: 'happy', age: 19 }).then((result) => {
            console.log('show-result:', result);
          });
        }}
      >
        Complex Modal New
      </Button>
    </Space>
  );
}
