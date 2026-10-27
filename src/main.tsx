import React from 'react';
import ReactDOM from 'react-dom/client';
import 'pretendard/dist/web/static/pretendard.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import './styles/tokens.css';
import './styles/global.css';
import './styles/contrast.css';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
