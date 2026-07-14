import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { NotificationProvider } from './context/NotificationContext.tsx';
import AdminToast from './components/AdminToast.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NotificationProvider>
      <App />
      <AdminToast />
    </NotificationProvider>
  </StrictMode>,
);
