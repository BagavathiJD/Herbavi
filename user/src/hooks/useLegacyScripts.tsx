import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { LEGACY_SCRIPT_BASE } from '../utils/assets.ts';

const SCRIPTS = [
  `${LEGACY_SCRIPT_BASE}/plugin/jquery.min.js`,
  `${LEGACY_SCRIPT_BASE}/plugin/bootstrap.min.js`,
  `${LEGACY_SCRIPT_BASE}/plugin/swiper-bundle.min.js`,
  `${LEGACY_SCRIPT_BASE}/plugin/bootstrap-select.min.js`,
  `${LEGACY_SCRIPT_BASE}/plugin/count-down.js`,
  `${LEGACY_SCRIPT_BASE}/plugin/infinityslide.js`,
  `${LEGACY_SCRIPT_BASE}/plugin/wow.min.js`,
  `${LEGACY_SCRIPT_BASE}/plugin/drift.min.js`,
  `${LEGACY_SCRIPT_BASE}/plugin/countto.js`,
  `${LEGACY_SCRIPT_BASE}/plugin/image-compare-viewer.min.js`,
  `${LEGACY_SCRIPT_BASE}/plugin/image-compare-viewer.js`,
  `${LEGACY_SCRIPT_BASE}/plugin/gsap.min.js`,
  `${LEGACY_SCRIPT_BASE}/plugin/lenis.min.js`,
  `${LEGACY_SCRIPT_BASE}/carousel.js`,
  `${LEGACY_SCRIPT_BASE}/gsapCustom.js`,
  `${LEGACY_SCRIPT_BASE}/main.js`,
  `${LEGACY_SCRIPT_BASE}/cart-wishlist.js`,
  `${LEGACY_SCRIPT_BASE}/zoom.js`,
  `${LEGACY_SCRIPT_BASE}/plugin/photoswipe-lightbox.umd.min.js`,
  `${LEGACY_SCRIPT_BASE}/plugin/photoswipe.umd.min.js`,
];

let scriptsLoaded = false;
let scriptsLoading: Promise<void> | null = null;

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

export function loadLegacyScripts() {
  if (scriptsLoaded) {
    return Promise.resolve();
  }

  if (scriptsLoading) {
    return scriptsLoading;
  }

  scriptsLoading = (async () => {
    for (const src of SCRIPTS) {
      if (document.querySelector(`script[src="${src}"]`) || document.querySelector(`script[src^="${src.split('?')[0]}"]`)) {
        continue;
      }
      try {
        await loadScript(src);
      } catch {
        // Optional scripts should not block the app shell.
      }
    }
    scriptsLoaded = true;
    hidePreloadOverlay();
  })();

  return scriptsLoading;
}

function reloadCarouselScript() {
  document.querySelectorAll('script[src*="carousel.js"]').forEach((node) => node.remove());

  return loadScript(`${LEGACY_SCRIPT_BASE}/carousel.js?reload=${Date.now()}`);
}

function hidePreloadOverlay() {
  const preload = document.getElementById('preload');
  if (!preload) return;
  preload.style.display = 'none';
  preload.remove();
}

export function refreshThemeComponents() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const $ = (window as any).jQuery;
  if (!$) {
    return;
  }

  $('.tf-swiper.swiper-initialized').each(function (this: HTMLElement) {
    const element = this as HTMLElement & { swiper?: { destroy: (deleteInstance?: boolean, cleanStyles?: boolean) => void } };
    element.swiper?.destroy(true, true);
  });

  void reloadCarouselScript();

  $('.infiniteSlide').each(function (this: HTMLElement) {
    const $el = $(this);
    if ($el.data('infiniteslide-init')) {
      return;
    }

    $el.infiniteslide({
      speed: Number($el.data('speed')) || 50,
      direction: String($el.data('style') || 'left'),
      clone: Number($el.data('clone')) || 2,
    });
    $el.data('infiniteslide-init', true);
  });

  const Wow = (window as Window & { WOW?: new (options?: { live?: boolean }) => { init: () => void } }).WOW;
  if (Wow) {
    new Wow({ live: true }).init();
  }

  const $preload = $('#preload');
  if ($preload.length) {
    $preload.fadeOut(300, function (this: HTMLElement) {
      $(this).remove();
    });
  } else {
    hidePreloadOverlay();
  }

  $(window).trigger('scroll');
}

export function useLegacyScripts() {
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      await loadLegacyScripts();
      if (cancelled) {
        return;
      }

      window.setTimeout(() => {
        if (!cancelled) {
          refreshThemeComponents();
        }
      }, 100);
    })();

    return () => {
      cancelled = true;
    };
  }, [location.pathname]);
}

export function usePageThemeRefresh() {
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      await loadLegacyScripts();
      if (cancelled) {
        return;
      }

      window.setTimeout(() => {
        if (!cancelled) {
          refreshThemeComponents();
        }
      }, 50);
    })();

    return () => {
      cancelled = true;
    };
  }, [location.pathname]);
}
