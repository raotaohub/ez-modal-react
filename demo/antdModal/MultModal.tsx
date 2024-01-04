import { Modal, Button, Space } from 'antd';
import EasyModal, { useModal } from '../../src';
import { InnerModalProps } from '../../src/type';

interface Props extends InnerModalProps<number> {
  index: number;
}

/* 1. not use EasyModal.create function */
export const ExampleModal = (props: Props) => {
  const modal = useModal<Props>();

  return (
    <Modal
      title={`Hello Antd:${props.index}`}
      open={modal.visible}
      onOk={() => modal.hide(props.index)}
      onCancel={() => modal.hide(null)}
      afterClose={() => modal.remove}
    >
      Modal:{props.index}
    </Modal>
  );
};

export default function MultModal() {
  return (
    <Space>
      <Button
        type="primary"
        onClick={async () => {
          /* 2. still use EasyModal.show*/

          EasyModal.show(ExampleModal, { index: 1 }).then((result) => {
            console.log('show-result:', result);
          });

          EasyModal.show(ExampleModal, { index: 2 }).then((result) => {
            console.log('show-result:', result);
          });

          /* 3. if you want update  Component */
          EasyModal.show(EasyModal.create(ExampleModal), { index: 3 }, { id: 'hello' }).then((result) => {
            console.log('show-result:', result);
          });

          setTimeout(() => {
            EasyModal.update('hello', { index: 66 });
          }, 5000);

          /* or */
          EasyModal.show(ExampleModal, { index: 4 }, { id: 'world' }).then((result) => {
            console.log('show-result:', result);
          });
          setTimeout(() => {
            EasyModal.update('world', { index: 122 });
          }, 2000);
        }}
      >
        MultModal
      </Button>
    </Space>
  );
}
