import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import SimplifiedApp from './SimplifiedApp';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <SimplifiedApp />
  </React.StrictMode>
);
