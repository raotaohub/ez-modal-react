import ReactDOM from 'react-dom';
import EasyModal from '../src'; /*  */
import { Layout, Space } from 'antd';

/* import comp */
import ComplexModal from './antdModal/ComplexModal';
import UpdateModal from './antdModal/UpdateModal';
import HideNotResolveModal from './antdModal/HideNotResolveModal';
import NoCreate from './antdModal/NoCreateModal';
import NormalModal from './antdModal/NormalModal';
import RefCompDemo from './antdModal/RefModal';
import MultModal from './antdModal/MultModal';

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
      <Space size={[20, 20]} align="start" wrap>
        <ComplexModal></ComplexModal>
        <RefCompDemo></RefCompDemo>
        <NoCreate></NoCreate>
        <NormalModal></NormalModal>
        <HideNotResolveModal></HideNotResolveModal>
        <UpdateModal></UpdateModal>
        <MultModal></MultModal>
      </Space>
    </Layout>
  );
}

ReactDOM.render(
  <EasyModal.Provider>
    <App />
  </EasyModal.Provider>,
  document.getElementById('root') as HTMLElement,
);
