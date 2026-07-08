import { Link } from 'react-router-dom';
import { useCart, useCartTotalDisplay } from '../context/CartContext.tsx';
import { assetUrl } from '../utils/assets.ts';

export default function CartSidebar() {
  const { cart, cartCount, cartTotal, removeFromCart, updateCartQty } = useCart();
  const totalDisplay = useCartTotalDisplay(cart, cartTotal);
  const countDisplay = String(cartCount).padStart(2, '0');
  const isEmpty = cart.length === 0;

  return (
    <div className="offcanvas offcanvas-end popup-shopping-cart" id="shoppingCart">
      <div className="canvas-wrapper overflow-hidden">
        <div className="popup-header">
          <div className="d-flex justify-content-between align-items-start mb-24">
            <h6 className="font-instrument_serif">
              Your Cart (<span className="prd__count">{countDisplay}</span>)
            </h6>
            <i className="icon icon-Close btn-close-popup fs-24" data-bs-dismiss="offcanvas"></i>
          </div>
          <div className="br-line bg-line-5"></div>
        </div>
        <div className="wrap">
          <div className="tf-mini-cart-wrap list-file-delete wrap-empty_text">
            <div className="tf-mini-cart-main">
              <div className="tf-mini-cart-sroll">
                <div className="tf-mini-cart-items list-empty">
                  {isEmpty && (
                    <div className="box-text_empty type-shop_cart">
                      <div className="shop-empty_top">
                        <span className="icon">
                          <i className="icon-Box"></i>
                        </span>
                        <p className="text-emp text-body-l fw-normal">Your cart is empty</p>
                        <p className="text-body-s cl-text-5">
                          Looks like you haven&apos;t added anything yet.
                          <br />
                          Start browsing and find something you&apos;ll love.
                        </p>
                      </div>
                      <div className="shop-empty_bot">
                        <Link to="/products" className="tf-btn style-2 type-2">
                          Continue Shopping
                        </Link>
                      </div>
                    </div>
                  )}
                  {cart.map((item) => (
                    <div key={item.id} className="tf-mini-cart-item file-delete" data-id={item.id}>
                      <a href={item.url} className="tf-mini-cart-image">
                        <img
                          loading="lazy"
                          width={74}
                          height={88}
                          src={assetUrl(item.image)}
                          alt={item.name}
                        />
                      </a>
                      <div className="tf-mini-cart-info">
                        <a href={item.url} className="name fw-normal link-underline text-line-clamp-1">
                          {item.name}
                        </a>
                      </div>
                      <div className="tf-mini-cart-price">
                        <div className="price-wrap gap-6">
                          <span className="price-new fw-normal text-primary tf-mini-card-price">
                            {item.priceDisplay}
                          </span>
                          {item.oldPrice && (
                            <span className="price-old fw-normal cl-text-6">{item.oldPrice}</span>
                          )}
                        </div>
                        <div className="group-action">
                          <div className="wg-quantity style-2">
                            <button
                              type="button"
                              className="btn-quantity minus-btn"
                              onClick={() => updateCartQty(item.id, (item.qty || 1) - 1)}
                            >
                              <i className="icon icon-Minus"></i>
                            </button>
                            <input
                              className="quantity-product"
                              type="text"
                              name="number"
                              value={item.qty || 1}
                              readOnly
                            />
                            <button
                              type="button"
                              className="btn-quantity plus-btn"
                              onClick={() => updateCartQty(item.id, (item.qty || 1) + 1)}
                            >
                              <i className="icon icon-Plus"></i>
                            </button>
                          </div>
                          <button
                            type="button"
                            className="tf-btn-rounded style-2 remove"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <i className="icon icon-Trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {!isEmpty && (
              <div className="tf-mini-cart-bottom box-empty_clear">
                <div className="tf-mini-cart-total text-body-l fw-normal">
                  <span>Estimated total</span>
                  <div className="price-wrap gap-6">
                    <span className="price-new tf-totals-total-value fw-normal">{totalDisplay}</span>
                  </div>
                </div>
                <div className="tf-mini-cart-view-checkout">
                  <Link to="/add-to-cart" className="tf-btn style-2 type-2 btn-light">
                    View cart
                  </Link>
                  <a href="#" className="tf-btn style-2 type-2">
                    Check out
                  </a>
                </div>
                <p className="text-body-s text-center cl-text-5">
                  Tax and shipping calculated at checkout
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
