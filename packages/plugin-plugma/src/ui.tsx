import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './styles.css';

const root = createRoot(document.getElementById('app') || document.createElement('div'));
root.render(<App />);
