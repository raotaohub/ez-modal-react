import { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (props.visible) {
      console.log(
        '%c [-dev-log:] ',
        'color: #fff; border-radius: 12px; padding: 3px 10px; background: linear-gradient(315deg, #1fd1f9 0%, #b621fe 74%)',
        '\n',
        JSON.parse(JSON.stringify(props)),
      );
    } else {
      console.log(
        '%c [-dev-log:] ',
        'color: #fff; border-radius: 12px; padding: 3px 10px; background: linear-gradient(315deg, #1fd1f9 0%, #b621fe 74%)',
        '\n',
        JSON.parse(JSON.stringify(props)),
      );
    }
  }, [props, props.visible]);

  return (
    <Modal title="Update Modal" open={modal.visible} onOk={() => handleSave()} onCancel={() => modal.hide(null)}>
      Greetings: {props.name}!
      <div style={{ padding: '10px 0' }}>
        remark:
        <Input value={remark} onChange={(e) => setRemark(e.target.value)} style={{ width: 180 }} />
      </div>
      <div style={{ padding: '10px 0' }}>age:{props.age}</div>
      <Button
        onClick={() => {
          EasyModal.update(Info, { name: 'update happy', age: 20 });
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
          EasyModal.show(Info, { name: 'happy', age: 19 }, { removeOnHide: false }).then((result) => {
            console.log('show-result:', result);
          });
        }}
      >
        Update Modal
      </Button>
    </Space>
  );
}
