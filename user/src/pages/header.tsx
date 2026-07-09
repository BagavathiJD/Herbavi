import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
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
  const headerClass =
    'tf-header header-v4' + (variant === 'home' ? ' offset-top' : ' header-inner-page');
  const displayName = user?.name ? formatDisplayName(user.name).split(/\s+/)[0] : 'Account';

  return (
    <header className={headerClass}>
      <div className="header-inner">
        <div className="container-full">
          <div className="row align-items-center">
            <div className="col-3 col-md-4 col-lg-5">
              <div className="header-left">
                <div className="box-btn-open-menu d-flex">
                  <a href="#mobileMenu" data-bs-toggle="offcanvas" className="d-xl-none">
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
            <div className="col-6 col-md-4 col-lg-2">
              <div className="header-center d-flex justify-content-center">
                <Link to="/" className="logo-site">
                  <img
                    loading="lazy"
                    width={136}
                    height={32}
                    src={assetUrl('assets/images/herbavi-imgs/herbavi-logo.svg')}
                    alt="Herbavi"
                  />
                </Link>
              </div>
            </div>
            <div className="col-3 col-md-4 col-lg-5">
              <div className="header-right">
                <ul className="tf-list nav-icon-list justify-content-end gap-16">
                  <li className="sm-d-none">
                    <a href="#modalSearch" data-bs-toggle="modal" className="nav-icon-item fw-normal">
                      <i className="icon icon-Search"></i>
                    </a>
                  </li>
                  <li className="nav-account">
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
                        href="/"
                        className="nav-icon-item fw-normal herbavi-account-trigger"
                        aria-label="Sign in"
                      >
                        <i className="icon icon-UserCircle"></i>
                        <span className="herbavi-account-label d-none d-xl-inline">Login</span>
                      </a>
                    )}
                  </li>
                  <li>
                    <Link to="/wish-list" className="nav-icon-item shop-wishlist fw-normal">
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
