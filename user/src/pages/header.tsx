import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useSearch } from '../context/SearchContext.tsx';
import { assetUrl } from '../utils/assets.ts';

interface HeaderProps {
  variant?: 'home' | 'inner';
}

function formatDisplayName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export default function Header({ variant = 'home' }: HeaderProps) {
  const { cartCount, wishlistCount } = useCart();
  const { user, logout } = useAuth();
  const { openSearch } = useSearch();
  const headerClass =
    'tf-header header-v4' + (variant === 'home' ? ' offset-top' : ' header-inner-page');
  const displayName = user?.name ? formatDisplayName(user.name).split(/\s+/)[0] : 'Account';

  return (
    <header className={headerClass}>
      <div className="header-inner">
        <div className="container-full">
          <div className="row align-items-center">
            <div className="col-3 col-md-4 col-lg-5 herbavi-header-col herbavi-header-col--left">
              <div className="header-left">
                <div className="box-btn-open-menu d-flex">
                  <a
                    href="#mobileMenu"
                    data-bs-toggle="offcanvas"
                    className="herbavi-mobile-menu-btn d-xl-none"
                    aria-label="Open menu"
                  >
                    <i className="icon icon-OpenMenu fs-24"></i>
                  </a>
                </div>
                <nav className="box-navigation d-none d-xl-block">
                  <ul className="box-nav-menu font-geist">
                    <li className="menu-item">
                      <Link to="/" className="item-link">
                        <span className="text">HOME</span>
                      </Link>
                    </li>
                    <li className="menu-item">
                      <Link to="/products" className="item-link">
                        <span className="text">PRODUCT</span>
                      </Link>
                    </li>
                    <li className="menu-item position-relative">
                      <a href="#" className="item-link">
                        <span className="text">BLOG</span>
                      </a>
                    </li>
                    <li className="menu-item position-relative">
                      <a href="#" className="item-link">
                        <span className="text">PAGE</span>
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
            <div className="col-6 col-md-4 col-lg-2 herbavi-header-col herbavi-header-col--center">
              <div className="header-center d-flex justify-content-center">
                <Link to="/" className="logo-site">
                  <img
                    loading="lazy"
                    width={136}
                    height={32}
                    src={assetUrl('assets/images/section/t-logo.png')}
                    alt="Herbavi"
                  />
                </Link>
              </div>
            </div>
            <div className="col-3 col-md-4 col-lg-5 herbavi-header-col herbavi-header-col--right">
              <div className="header-right d-flex align-items-center justify-content-end">
                <button
                  type="button"
                  className="herbavi-header-search-btn d-none d-xl-inline-flex"
                  onClick={openSearch}
                  aria-label="Open search"
                >
                  <i className="icon icon-Search"></i>
                  <span className="herbavi-header-search-placeholder font-geist">Search products...</span>
                </button>
                <ul className="tf-list nav-icon-list justify-content-end gap-16 mb-0 herbavi-header-icons">
                  <li className="d-none d-md-block d-xl-none">
                    <button
                      type="button"
                      className="nav-icon-item fw-normal herbavi-search-icon-btn"
                      onClick={openSearch}
                      aria-label="Search products"
                    >
                      <i className="icon icon-Search"></i>
                    </button>
                  </li>
                  <li className="nav-account d-none d-md-block">
                    {user ? (
                      <>
                        <a href="#;" className="nav-icon-item fw-normal herbavi-account-trigger">
                          <i className="icon icon-UserCircle"></i>
                          <span className="herbavi-account-label herbavi-account-label--user d-none d-xl-inline">
                            {displayName}
                          </span>
                        </a>
                        <div className="dropdown-account">
                          <ul className="list-menu-item">
                            <li className="herbavi-account-meta">
                              <div className="herbavi-account-name">{formatDisplayName(user.name)}</div>
                              <div className="herbavi-account-email">{user.email}</div>
                            </li>
                            <li>
                              <Link to="/account-setting">Account settings</Link>
                            </li>
                            <li>
                              <button type="button" className="herbavi-logout-btn" onClick={logout}>
                                Sign out
                              </button>
                            </li>
                          </ul>
                        </div>
                      </>
                    ) : (
                      <a
                        href="/admin"
                        className="nav-icon-item fw-normal herbavi-account-trigger"
                        aria-label="Sign in"
                      >
                        <i className="icon icon-UserCircle"></i>
                        <span className="herbavi-account-label d-none d-xl-inline">Login</span>
                      </a>
                    )}
                  </li>
                  <li>
                    <Link to="/wish-list" className="nav-icon-item shop-wishlist fw-normal" aria-label="Wish list">
                      <i className="icon icon-Hearth"></i>
                      {wishlistCount > 0 && (
                        <span className="number-order nav-wishlist-count text-body-xs">
                          {wishlistCount}
                        </span>
                      )}
                    </Link>
                  </li>
                  <li>
                    <a
                      href="#shoppingCart"
                      data-bs-toggle="offcanvas"
                      className="nav-icon-item shop-cart fw-medium"
                      aria-label="Add to cart"
                    >
                      <i className="icon icon-ShoppingCart"></i>
                      <span className="number-order text-body-xs">{cartCount > 0 ? cartCount : '0'}</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
