import { createRoot } from 'react-dom/client';
import './styles.css';
// import App from './App.tsx';
import App from './App.tsx';

const root = createRoot(document.getElementById('app')!);
root.render(<App />);
