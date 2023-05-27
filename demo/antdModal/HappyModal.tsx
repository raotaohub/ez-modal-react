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
    modal.hide(remark); // ts(2345)
    modal.resolve(remark); // ts(2345)

    message.success('eazy');
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

export default function HappyModal() {
  return (
    <Space>
      <Button
        type="primary"
        onClick={async () => {
          // setTimeout(() => {
          //   EasyModal.hide(MyAntdModal1);
          // }, 3000);

          // setTimeout(() => {
          //   EasyModal.remove(MyAntdModal1);
          // }, 3000);

          EasyModal.show(
            Info,
            { name: 'happy', age: 19 },
            {
              removeOnHide: true,
              resolveOnHide: false,
            },
          )
            .then((result) => {
              console.log('show-result:', result);
            })
            .catch((reason) => {
              console.log('show-reason:', reason);
            });
        }}
      >
        Show Modal
      </Button>
    </Space>
  );
}
