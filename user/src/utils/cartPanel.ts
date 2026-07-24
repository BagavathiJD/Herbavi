type BootstrapOffcanvas = {
  getOrCreateInstance: (element: HTMLElement) => { show: () => void; hide: () => void };
};

function getBootstrapOffcanvas(): BootstrapOffcanvas | undefined {
  return (
    window as Window & {
      bootstrap?: { Offcanvas: BootstrapOffcanvas };
    }
  ).bootstrap?.Offcanvas;
}

function closeOffcanvasById(id: string): void {
  const element = document.getElementById(id);
  const Offcanvas = getBootstrapOffcanvas();
  if (element && Offcanvas) {
    Offcanvas.getOrCreateInstance(element).hide();
  }
}

export function openCartPanel(): void {
  const element = document.getElementById('shoppingCart');
  const Offcanvas = getBootstrapOffcanvas();
  if (element && Offcanvas) {
    Offcanvas.getOrCreateInstance(element).show();
  }
}

export function closeCartPanel(): void {
  closeOffcanvasById('shoppingCart');
}

export function closeMobileMenu(): void {
  closeOffcanvasById('mobileMenu');
}
