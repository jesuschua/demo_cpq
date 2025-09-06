import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import ImprovedApp from './ImprovedApp';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ImprovedApp />
  </React.StrictMode>
);
