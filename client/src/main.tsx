import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { RecoilRoot } from 'recoil';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RecoilRoot>
      <App />
    </RecoilRoot>
  </React.StrictMode>,
);
