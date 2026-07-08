import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from './context/CartContext.tsx';
import { QuickViewProvider } from './context/QuickViewContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import UserRoutes from './routes.tsx';

export default function App() {
  return (
    <ErrorBoundary>
      <CartProvider>
        <QuickViewProvider>
          <AuthProvider>
            <BrowserRouter basename="/user">
              <UserRoutes />
            </BrowserRouter>
          </AuthProvider>
        </QuickViewProvider>
      </CartProvider>
    </ErrorBoundary>
  );
}
