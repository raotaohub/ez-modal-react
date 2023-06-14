import { StrictMode } from 'react';
import ReactDOM from 'react-dom';

import EasyModal from '../src'; /*  */
import RefCompDemo from './antdModal/RefModal';
import ComplexModal from './antdModal/ComplexModal';
import NoCreate from './antdModal/NoCreateModal';
import NormalModal from './antdModal/NormalModal';

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
      <h2> Ez Modal React </h2>
      <div>
        <ComplexModal></ComplexModal>
        <RefCompDemo></RefCompDemo>
        <NoCreate></NoCreate>
        <NormalModal></NormalModal>
      </div>
    </div>
  );
}

ReactDOM.render(
  <StrictMode>
    <EasyModal.Provider>
      <App />
    </EasyModal.Provider>
  </StrictMode>,
  document.getElementById('root') as HTMLElement,
);
