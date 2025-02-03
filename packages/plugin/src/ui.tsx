import { createRoot } from 'react-dom/client';
import './styles.css';
import App from './App.tsx';
import { StrictMode } from 'react';

const root = createRoot(document.getElementById('app')!);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
