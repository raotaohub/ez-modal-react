import ReactDOM from 'react-dom';
import EasyModal from '../src'; /*  */
import { Card, Col, Layout, Row, Space } from 'antd';

/* import comp */
import ComplexModal from './antdModal/ComplexModal';
import UpdateModal from './antdModal/UpdateModal';
import HideNotResolveModal from './antdModal/HideNotResolveModal';
import NoCreate from './antdModal/NoCreateModal';
import NormalModal from './antdModal/NormalModal';
import RefCompDemo from './antdModal/RefModal';
import MultModal from './antdModal/MultModal';
import RemoveModal from './antdModal/RemoveModal';
import HideNotRemoveeModal from './antdModal/HideNotRemoveModal';
import HideModal from './antdModal/HideModal';

const layoutStyle: React.CSSProperties = {
  width: '100vw',
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
};

function App() {
  return (
    <Layout style={layoutStyle}>
      <h2> Ez Modal React </h2>

      <Card
        title="EasyModal.show({Component,props,{resolveOnHide?:boolean; removeOnHide?:boolean; id?:string|number}})"
        style={{ width: 920 }}
      >
        <Space size={[20, 20]} align="start" wrap>
          <HideNotResolveModal /> <HideNotRemoveeModal /> <MultModal />
        </Space>
      </Card>

      <Card title="EasyModal.update | remove | hide()" style={{ width: 920 }}>
        <Space size={[20, 20]} align="start" wrap>
          <UpdateModal /> <RemoveModal /> <HideModal />
        </Space>
      </Card>

      <Card title="Ohter Example" style={{ width: 920 }}>
        <Space size={[20, 20]} align="start" wrap>
          <ComplexModal></ComplexModal>
          <RefCompDemo></RefCompDemo>
          <NoCreate></NoCreate>
          <NormalModal></NormalModal>
        </Space>
      </Card>
    </Layout>
  );
}

ReactDOM.render(
  <EasyModal.Provider>
    <App />
  </EasyModal.Provider>,
  document.getElementById('root') as HTMLElement,
);
