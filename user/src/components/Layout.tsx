import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../pages/header.tsx';
import Footer from '../pages/footer.tsx';
import CartSidebar from './CartSidebar.tsx';
import MobileMenu from './MobileMenu.tsx';
import QuickViewModal from './QuickViewModal.tsx';
import SearchModal from './SearchModal.tsx';
import AuthToast from './AuthToast.tsx';
import AppToast from './AppToast.tsx';
import { SearchProvider } from '../context/SearchContext.tsx';
import { useLegacyScripts } from '../hooks/useLegacyScripts.tsx';
import { closeCartPanel, closeMobileMenu } from '../utils/cartPanel.ts';

interface LayoutProps {
  headerVariant?: 'home' | 'inner';
  showFooterFeatures?: boolean;
}

function hidePreloadOverlay() {
  const preload = document.getElementById('preload');
  if (!preload) return;
  preload.style.display = 'none';
  preload.remove();
}

export default function Layout({ headerVariant = 'inner', showFooterFeatures = false }: LayoutProps) {
  useLegacyScripts();
  const location = useLocation();

  useEffect(() => {
    document.body.classList.add('herbavi-theme');
    hidePreloadOverlay();
    const timeout = window.setTimeout(hidePreloadOverlay, 600);
    return () => {
      document.body.classList.remove('herbavi-theme');
      window.clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    closeCartPanel();
    closeMobileMenu();
  }, [location.pathname]);

  return (
    <SearchProvider>
      <button id="goTop" type="button">
        <span className="border-progress"></span>
        <span className="ic-wrap">
          <span className="icon icon-ArrowCaretUp"></span>
        </span>
      </button>

      <main id="wrapper">
        <div className="menu-overlay-enabled" id="menu-overlay-enabled"></div>
        <Header variant={headerVariant} />
        <Outlet />
        <Footer showFeatures={showFooterFeatures} />
      </main>

      <CartSidebar />
      <MobileMenu />
      <QuickViewModal />
      <SearchModal />
      <AuthToast />
      <AppToast />
    </SearchProvider>
  );
}
