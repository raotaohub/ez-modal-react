import { Modal, Button } from 'antd';
import EasyModal from '../../src';

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
        {props.name ?? 'default'}
        <ul>
          {new Array<number>(10).fill(0, 0, 10).map((t, idx) => (
            <li key={idx}>{++t}</li>
          ))}
        </ul>
      </div>
    </Modal>
  );
});

export default function RemoveModal() {
  return (
    <Button
      type="primary"
      onClick={async () => {
        EasyModal.show(Info).then((result) => {
          console.log('show-result:', result);
        });

        setTimeout(() => EasyModal.hide('22', { name: 'hide' }), 2000);

        setTimeout(() => EasyModal.update('22', { name: 'update' }), 2000);

        setTimeout(() => EasyModal.remove('22'), 2000);
      }}
    >
      Remove Modal
    </Button>
  );
}
