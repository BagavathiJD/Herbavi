import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import Home from '@/user/src/pages/Home.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Home />
  </StrictMode>,
);
