import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import Index from './pages/index.tsx';
import Home from './pages/Home.tsx';
import HomeBoldModern from './pages/HomeBoldModern.tsx';
import Products from './pages/products.tsx';
import AddToCart from './pages/add-to-cart.tsx';
import WishList from './pages/wish-list.tsx';
import Faq from './pages/faq.tsx';
import AccountSetting from './pages/account-setting.tsx';
import ForgotPassword from './pages/forgot-password.tsx';
import ProductDetail from './pages/product-detail.tsx';
import NotFound from './pages/not-found.tsx';

function LegacyRedirect({ to }: { to: string }) {
  return <Navigate to={to} replace />;
}

export default function UserRoutes() {
  return (
    <Routes>
      {/* Legacy PHP / HTML redirects */}
      <Route path="/index.php" element={<LegacyRedirect to="/" />} />
      <Route path="/products.php" element={<LegacyRedirect to="/products" />} />
      <Route path="/add-to-cart.php" element={<LegacyRedirect to="/add-to-cart" />} />
      <Route path="/wish-list.php" element={<LegacyRedirect to="/wish-list" />} />
      <Route path="/faq.html" element={<LegacyRedirect to="/faq" />} />
      <Route path="/account-setting.html" element={<LegacyRedirect to="/account-setting" />} />
      <Route path="/forgot-password.html" element={<LegacyRedirect to="/forgot-password" />} />
      <Route path="/product-right-thumbnail.html" element={<LegacyRedirect to="/product-detail" />} />
      <Route path="/product-detail.html" element={<LegacyRedirect to="/product-detail" />} />
      <Route path="/404-2.html" element={<LegacyRedirect to="/404" />} />

      <Route element={<Layout headerVariant="home" showFooterFeatures />}>
        <Route path="/" element={<Index />} />
        <Route path="/home" element={<Home />} />
        <Route path="/home-bold-modern" element={<HomeBoldModern />} />
      </Route>

      <Route element={<Layout headerVariant="inner" />}>
        <Route path="/products" element={<Products />} />
        <Route path="/add-to-cart" element={<AddToCart />} />
        <Route path="/wish-list" element={<WishList />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/account-setting" element={<ProtectedRoute><AccountSetting /></ProtectedRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/product-detail" element={<ProductDetail />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
