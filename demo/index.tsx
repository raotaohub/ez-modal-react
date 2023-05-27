import { StrictMode } from 'react';
import ReactDOM from 'react-dom';

import EasyModal from '../src'; /*  */
import RefCompDemo from './antdModal/RefModal';
import HappyModal from './antdModal/HappyModal';
import NoCreate from './antdModal/NoCreate';

function App() {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <h2> Easy Modal React </h2>
      <div>
        <HappyModal></HappyModal>
        <RefCompDemo></RefCompDemo>
        <NoCreate></NoCreate>
      </div>
    </div>
  );
}

ReactDOM.render(
  <StrictMode>
    {/* <EasyModal.ConfigProvider resolveOnHide={false} removeOnHide={false}> */}
    <EasyModal.Provider>
      <App />
    </EasyModal.Provider>
    {/* </EasyModal.ConfigProvider> */}
  </StrictMode>,
  document.getElementById('root') as HTMLElement,
);
