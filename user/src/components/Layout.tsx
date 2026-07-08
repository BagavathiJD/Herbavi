import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../pages/header.tsx';
import Footer from '../pages/footer.tsx';
import CartSidebar from './CartSidebar.tsx';
import QuickViewModal from './QuickViewModal.tsx';
import AuthToast from './AuthToast.tsx';
import { useLegacyScripts } from '../hooks/useLegacyScripts.tsx';

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

  useEffect(() => {
    document.body.classList.add('herbavi-theme');
    hidePreloadOverlay();
    const timeout = window.setTimeout(hidePreloadOverlay, 600);
    return () => {
      document.body.classList.remove('herbavi-theme');
      window.clearTimeout(timeout);
    };
  }, []);

  return (
    <>
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
      <QuickViewModal />
      <AuthToast />
    </>
  );
}
