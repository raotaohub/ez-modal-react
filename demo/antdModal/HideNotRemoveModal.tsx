import { useState } from 'react';
import { Modal, Button, Input, message, Space } from 'antd';
import EasyModal, { InnerModalProps, useModal } from '../../src';

interface IProps extends InnerModalProps<string> {
  name: string;
  age: number;
}
useState;

export const Info = (props: IProps) => {
  const modal = useModal<IProps>();
  const [remark, setRemark] = useState('');

  console.log('props', props);
  console.log('modal', modal);

  const handleSave = async () => {
    modal.hide(remark);
    modal.resolve('manual resolve:' + remark);
    message.success('eazy~' + ' manual resolve' + remark);
  };

  return (
    <Modal title="resolveOnHide:false" open={modal.visible} onOk={() => handleSave()} onCancel={() => modal.hide(null)}>
      Greetings: {props.name}!
      <div style={{ padding: '10px 0' }}>
        remark：{modal.age}
        <Input value={remark} onChange={(e) => setRemark(e.target.value)} style={{ width: 180 }} />
      </div>
    </Modal>
  );
};

// const registerId = EasyModal.register<IProps>('自定义id', Info, {
//   name: '111',
//   age: 2220,
// });

export default function HideNotRemoveeModal() {
  return (
    <Space size={[20, 20]} align="start" wrap>
      <Button
        type="primary"
        onClick={async () => {
          EasyModal.show(
            Info,
            { name: 'happy', age: 19 },
            {
              removeOnHide: false,
            },
          ).then((result) => {
            console.log('show-result:', result);
          });
        }}
      >
        removeOnHide:false
      </Button>
    </Space>
  );
}
