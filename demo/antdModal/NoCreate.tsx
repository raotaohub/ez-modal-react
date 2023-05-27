import { useState } from 'react';
import { Modal, Button, Space, Input, message } from 'antd';
import EasyModal, { useModal } from '../../src';
import { InnerModalProps } from '../../src/type';

interface NoCreateProps extends InnerModalProps<boolean> {
  name: string;
  value: Record<string, any>;
  flag: string;
}

export const NoCreateModal = (props: NoCreateProps) => {
  const modal = useModal();
  const [remark, setRemark] = useState('');

  const handleSave = async () => {
    const value = remark.trim();

    modal.hide(value); // warn ts(2554)
    props.hide(value); // warn ts(2554)
    message.success('easy');
  };
  return (
    <Modal title="Hello Antd" open={modal.visible} onOk={() => handleSave()} onCancel={() => modal.hide()} centered>
      Greetings: {props.name}!
      <div style={{ padding: '10px 0' }}>
        remark:
        <Input value={remark} onChange={(e) => setRemark(e.target.value)} style={{ width: 180 }} />
      </div>
    </Modal>
  );
};

export default function NoCreate() {
  return (
    <Space>
      <Button
        type="primary"
        onClick={async () => {
          const res = await EasyModal.show(NoCreateModal, {
            name: 'no create',
            value: {},
            flag: '19',
          }); // !error
        }}
      >
        No Create Modal
      </Button>
    </Space>
  );
}
