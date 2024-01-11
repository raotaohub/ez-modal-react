import { useState } from 'react';
import { Modal, Button, Input, message } from 'antd';
import EasyModal, { InnerModalProps, useModal } from '../../src';

interface Props extends InnerModalProps<string> {
  name: string;
  age: number;
}
useState;

export const Info = EasyModal.create((props: Props) => {
  const modal = useModal<Props>();
  const [remark, setRemark] = useState('');

  console.log('props', props);
  console.log('modal', modal);

  const handleSave = async () => {
    modal.hide(remark);
    modal.resolve('manual resolve:' + remark);
    message.success('eazy~' + ' manual resolve' + remark);
  };

  return (
    <Modal
      title="resolveOnHide:false"
      open={modal.visible}
      onOk={() => handleSave()}
      onCancel={() => modal.hide(null)}
      afterClose={modal.remove}
    >
      Greetings: {props.name}!
      <div style={{ padding: '10px 0' }}>
        remark：{modal.age}
        <Input value={remark} onChange={(e) => setRemark(e.target.value)} style={{ width: 180 }} />
      </div>
    </Modal>
  );
});

export default function HideNotResolveModal() {
  return (
    <Button
      type="primary"
      onClick={async () => {
        EasyModal.show(
          Info,
          { name: 'happy', age: 19 },
          {
            resolveOnHide: false,
          },
        ).then((result) => {
          console.log('show-result:', result);
        });
      }}
    >
      resolveOnHide:false
    </Button>
  );
}
