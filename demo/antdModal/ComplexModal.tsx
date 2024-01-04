import { useState } from 'react';
import { Modal, Button, Space, Input, message } from 'antd';
import EasyModal, { useModal } from '../../src';
import { InnerModalProps } from '../../src/type';

interface Props extends InnerModalProps<string> {
  name: string;
  age: number;
}

// eslint-disable-next-line @typescript-eslint/ban-types
const sleep = (cb: Function, delay = 1000) =>
  new Promise(() => {
    setTimeout(() => {
      cb();
    }, delay);
  });

export const Info = (props: Props) => {
  const [remark, setRemark] = useState('');
  const [ing, setIng] = useState(false);

  const handleSave = async () => {
    setIng(true);
    try {
      const val = await new Promise((resolve) => {
        return setTimeout(() => {
          resolve('request' + remark);
        }, 1000);
      });

      props.hide(remark);
      message.success('easy' + val);
    } catch (error) {
      // ...
    } finally {
      setIng(false);
    }
  };

  return (
    <Modal
      title="Hello Antd1"
      open={props.visible}
      onOk={() => handleSave()}
      onCancel={() => props.hide(null)}
      confirmLoading={ing}
    >
      Greetings: {props.name}!
      <div style={{ padding: '10px 0' }}>
        remark:
        <Input value={remark} onChange={(e) => setRemark(e.target.value)} style={{ width: 180 }} />
      </div>
      <div>age:{props.age}</div>
    </Modal>
  );
};

const Coyp = EasyModal.create(Info);

export default function ComplexModal() {
  return (
    <Space>
      <Button
        type="primary"
        onClick={async () => {
          // mult1
          sleep(() => {
            EasyModal.show(Info, { name: 'mult1', age: 19 }, { id: 'info1' }).then((result) => {
              console.log('show-result-1:', result);
            });
          }, 0);

          sleep(() => {
            // mult2
            EasyModal.show(Info, { name: 'mult2', age: 20 }, { id: 'info2' }).then((result) => {
              console.log('show-result-2:', result);
            });
          }, 2000);

          sleep(() => {
            // single
            EasyModal.show(Coyp, { name: 'single', age: 18 }).then((result) => {
              console.log('show-result-3:', result);
            });
          }, 3000);

          sleep(() => {
            // single
            EasyModal.show(Coyp, { name: 'single', age: 18 }).then((result) => {
              console.log('show-result-4:', result);
            });
          }, 3500);

          // operator
          sleep(() => {
            EasyModal.update(Coyp, { name: 'update1 single success, await next update...', age: 100 });
          }, 4000);

          sleep(() => {
            EasyModal.update(Coyp, { name: 'update2 single success', age: 200 });
          }, 5000);

          sleep(() => {
            EasyModal.hide(Coyp, 'hide!'); // show-result-4:hide!
          }, 6000);

          sleep(() => {
            EasyModal.show(Coyp, { name: 'show single ~~success', age: 240 });
          }, 7000);

          sleep(() => {
            EasyModal.hide('info1', 'info1!'); // show-result-1: info1!
          }, 8000);

          sleep(() => {
            EasyModal.hide('info2', 'info2!'); // show-result-2: info2!
          }, 9000);

          sleep(() => {
            EasyModal.remove(Coyp);
          }, 10000);
        }}
      >
        Complex Modal
      </Button>
    </Space>
  );
}
