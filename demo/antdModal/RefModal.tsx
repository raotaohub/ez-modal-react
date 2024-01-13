import React, { useState, forwardRef, Ref, useImperativeHandle } from 'react';
import { Modal, Button, Space, Input, InputNumber } from 'antd';
import EasyModal, { useModal } from '../../src';
import { InnerModalProps } from '../../src/type';

interface IProps extends InnerModalProps<string> {
  name: string;
  ref: Ref<number>;
}

export const ForwardRefComp: React.ForwardRefExoticComponent<IProps> = forwardRef((props, ref) => {
  const modal = useModal<IProps>();
  const [remark, setRemark] = useState('');
  const [input, setInput] = useState<number>();

  useImperativeHandle(ref, () => {
    return input!;
  });

  return (
    <Modal title="Hello Antd" open={modal.visible}>
      Hello: {props.name}!
      <div style={{ padding: '10px 0' }}>
        remark:
        <Input value={remark} onChange={(e) => setRemark(e.target.value)} style={{ width: 180 }} />
      </div>
      <div style={{ padding: '10px 0' }}>
        ref:
        <InputNumber<number> value={input} onChange={(e) => setInput(e)} style={{ width: 180 }} />
      </div>
      <div>
        <h1>modal</h1>
        <Button
          onClick={() => {
            modal.hide(remark);
          }}
        >
          modal.hide
        </Button>
        <Button
          onClick={() => {
            modal.remove();
          }}
        >
          modal.remove
        </Button>
      </div>
      <div>
        <h1>props</h1>
        <Button
          onClick={() => {
            props.hide(remark);
          }}
        >
          hide
        </Button>
        <Button
          onClick={() => {
            props.remove();
          }}
        >
          props.remove
        </Button>
      </div>
    </Modal>
  );
});

const RefComp = EasyModal.create(ForwardRefComp);

export default function RefCompDemo() {
  const ref = React.useRef<number>(null);

  return (
    <Space>
      <Button
        type="primary"
        onClick={async () => {
          const res = await EasyModal.show(RefComp, {
            name: 'show ref',
            ref,
          });
          console.log('show-res:', res);
          console.log('show-ref:', ref.current);
        }}
      >
        Ref Modal
      </Button>
    </Space>
  );
}
