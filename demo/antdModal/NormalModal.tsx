import { Modal, Button } from 'antd';
import EasyModal, { useModal } from '../../src';

// no type

export const Info = EasyModal.create((props) => {
  // use hooks
  // const modal = useModal();
  // function handle() {
  //   modal.hide(); // move the mouse modal
  // }

  return (
    <Modal title="Hello Antd1" open={props.visible} onOk={props.hide} onCancel={props.hide}>
      <div style={{ padding: '10px 0' }}>
        <ul>
          {new Array<number>(10).fill(0, 0, 10).map((t, idx) => (
            <li key={idx}>{++t}</li>
          ))}
        </ul>
      </div>
    </Modal>
  );
});

export default function NormalModal() {
  return (
    <Button
      type="primary"
      onClick={async () => {
        EasyModal.show(Info).then((result) => {
          console.log('show-result:', result);
        });
      }}
    >
      Normal Modal
    </Button>
  );
}
