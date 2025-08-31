import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 传递一个符合 AppProps 类型的 title 属性 */}
    <App title="Hello, TypeScript!" />
  </React.StrictMode>
);