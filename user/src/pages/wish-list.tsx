import { Link, useNavigate } from 'react-router-dom';
import { useCartActions } from '../hooks/useCartActions.ts';
import { assetUrl } from '../utils/assets.ts';

function openCartPanel() {
  const el = document.getElementById('shoppingCart');
  const bootstrap = (window as Window & { bootstrap?: { Offcanvas: { getOrCreateInstance: (el: HTMLElement) => { show: () => void } } } }).bootstrap;
  if (el && bootstrap) {
    bootstrap.Offcanvas.getOrCreateInstance(el).show();
  }
}

export default function WishList() {
  const navigate = useNavigate();
  const { wishlist, wishlistCount, removeWishlistItem, addProductToCart } = useCartActions();

  return (
    <>
      <section className="tf-page-heading_account flat-spacing">
        <div className="container">
          <Link to="/products" className="content">
            <div className="account-icon d-flex">
              <i className="icon icon-ArrowLeft fs-24"></i>
            </div>
            <div className="account-infor">
              <h3 className="info_name font-instrument_serif mb-8">My Wishlist</h3>
              <p className="info_more number-order_wishlist cl-text-5">
                {wishlistCount === 0
                  ? 'Nothing saved yet'
                  : `${wishlistCount} item${wishlistCount === 1 ? '' : 's'} saved`}
              </p>
            </div>
          </Link>
        </div>
      </section>

      {wishlistCount > 0 && (
        <div className="section-wishlist flat-spacing-mix-1" data-herbavi-react="true">
          <div className="container">
            <div className="tf-grid-layout tf-col-2 md-col-3 xl-col-4 wrapper-wishlist">
              {wishlist.map((item) => (
                <div key={item.id} className="card-product" data-id={item.id}>
                  <div className="card-product_wrapper">
                    <div className="product-img">
                      <img
                        className="img-product"
                        loading="lazy"
                        width={348}
                        height={420}
                        src={assetUrl(item.image)}
                        alt={item.name}
                      />
                    </div>
                    <button
                      type="button"
                      className="product-action_remove herbavi-wishlist-remove box-icon hover-tooltip tooltip-left"
                      data-id={item.id}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        void removeWishlistItem(item);
                      }}
                    >
                      <i className="icon icon-HearthFill"></i>
                      <span className="tooltip">Remove Wishlist</span>
                    </button>
                    <ul className="product-action_list herbavi-wishlist-actions">
                      <li>
                        <a
                          href="#shoppingCart"
                          className="hover-tooltip tooltip-left box-icon herbavi-action-icon"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            addProductToCart(item);
                            openCartPanel();
                          }}
                          aria-label="Add to cart"
                        >
                          <span className="icon icon-ShoppingCart"></span>
                          <span className="tooltip">Add to Cart</span>
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div className="card-product_info herbavi-wishlist-info">
                    <a href={item.url} className="name-product fw-normal link-underline">
                      {item.name}
                    </a>
                    <div className="price-wrap">
                      <span className="price-new fw-normal">{item.priceDisplay}</span>
                      {item.oldPrice && <span className="price-old fw-normal cl-text-6">{item.oldPrice}</span>}
                    </div>
                    <div className="herbavi-product-card-actions">
                      <a
                        href="/checkout"
                        className="tf-btn hv-black btn-white type-2 w-100 herbavi-buy-now-btn"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          addProductToCart(item);
                          navigate('/checkout');
                        }}
                      >
                        Buy now
                        <i className="icon icon-ShoppingCart"></i>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {wishlistCount === 0 && (
        <div className="tf-wishlist-empty text-center flat-spacing-5">
          <div className="container">
            <h3 className="emp_title font-instrument_serif">Nothing Saved Yet</h3>
            <p className="emp_desc cl-text-5">
              Start saving the products you love. Explore our collections and add items to your wishlist for later.
            </p>
            <Link to="/products" className="tf-btn type-2">
              Start Shopping
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
