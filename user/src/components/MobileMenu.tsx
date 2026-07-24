import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { useSearch } from '../context/SearchContext.tsx';
import { closeMobileMenu } from '../utils/cartPanel.ts';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/add-to-cart', label: 'Add to cart' },
  { to: '/wish-list', label: 'Wish list' },
] as const;

function formatDisplayName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export default function MobileMenu() {
  const { cartCount, wishlistCount } = useCart();
  const { user, logout } = useAuth();
  const { openSearch } = useSearch();

  const handleNavigate = () => {
    closeMobileMenu();
  };

  const handleSearch = () => {
    closeMobileMenu();
    openSearch();
  };

  return (
    <div
      className="offcanvas offcanvas-start canvas-mb herbavi-mobile-menu"
      id="mobileMenu"
      tabIndex={-1}
      aria-labelledby="mobileMenuLabel"
      data-herbavi-react="true"
    >
      <div className="canvas-wrapper">
        <div className="canvas-header">
          <button
            type="button"
            className="herbavi-mobile-menu-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close menu"
          >
            <i className="icon icon-Close fs-24"></i>
          </button>
          <ul className="tf-list nav-icon-list mb-0">
            <li>
              <button
                type="button"
                className="nav-icon-item fw-normal herbavi-search-icon-btn"
                onClick={handleSearch}
                aria-label="Search products"
              >
                <i className="icon icon-Search"></i>
              </button>
            </li>
            <li>
              {user ? (
                <Link to="/account-setting" className="nav-icon-item fw-normal" onClick={handleNavigate}>
                  <i className="icon icon-UserCircle"></i>
                </Link>
              ) : (
                <a href="/admin" className="nav-icon-item fw-normal" aria-label="Sign in">
                  <i className="icon icon-UserCircle"></i>
                </a>
              )}
            </li>
            <li>
              <Link to="/wish-list" className="nav-icon-item shop-wishlist fw-normal" onClick={handleNavigate}>
                <i className="icon icon-Hearth"></i>
                {wishlistCount > 0 && (
                  <span className="number-order nav-wishlist-count text-body-xs">{wishlistCount}</span>
                )}
              </Link>
            </li>
            <li>
              <a
                href="#shoppingCart"
                data-bs-toggle="offcanvas"
                className="nav-icon-item shop-cart fw-medium"
                onClick={closeMobileMenu}
              >
                <i className="icon icon-ShoppingCart"></i>
                <span className="number-order text-body-xs">{cartCount > 0 ? cartCount : '0'}</span>
              </a>
            </li>
          </ul>
        </div>

        <div className="canvas-body">
          <div className="mb-content-top">
            {user && (
              <div className="herbavi-mobile-menu-user">
                <p className="herbavi-mobile-menu-user-name">{formatDisplayName(user.name)}</p>
                <p className="herbavi-mobile-menu-user-email">{user.email}</p>
              </div>
            )}

            <ul className="nav-ul-mb herbavi-mobile-nav">
              {NAV_LINKS.map((link) => (
                <li key={link.to} className="nav-mb-item">
                  <Link to={link.to} className="mb-menu-link text-body-l" onClick={handleNavigate}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {user && (
              <div className="herbavi-mobile-menu-actions">
                <button type="button" className="herbavi-logout-btn" onClick={() => { logout(); handleNavigate(); }}>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
