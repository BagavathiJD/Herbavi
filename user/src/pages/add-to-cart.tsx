import { Link } from 'react-router-dom';
import { useCartActions } from '../hooks/useCartActions.ts';
import { useCartTotalDisplay } from '../context/CartContext.tsx';
import { formatMoney } from '../utils/format.tsx';
import { assetUrl } from '../utils/assets.ts';

export default function AddToCart() {
  const { cart, cartCount, cartTotal, removeCartItem, changeCartQty } = useCartActions();
  const totalDisplay = useCartTotalDisplay(cart, cartTotal);

  return (
    <>
      <section className="tf-page-heading flat-spacing">
        <div className="container">
          <div className="row">
            <div className="col-9 col-sm-6">
              <div className="content text-start">
                <ul className="breadcrumb">
                  <li>
                    <Link to="/" className="link">
                      HOME
                    </Link>
                  </li>
                  <li>
                    <i className="icon icon-ArrowCaretRight"></i>
                  </li>
                  <li>CART</li>
                </ul>
                <h3 className="page-title font-instrument_serif fw-normal mb-0">
                  Your Cart ({String(cartCount).padStart(2, '0')})
                </h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-shopping-cart each-list-prd flat-spacing-2 pb-0" data-herbavi-react="true">
        <div className="container">
          {cartCount === 0 ? (
            <div className="box-text_empty type-shop_cart text-center flat-spacing-4">
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
          ) : (
            <div className="row gy-30">
              <div className="col-lg-7">
                <div className="overflow-auto">
                  <div className="tf-table-page-cart list-file-delete">
                    {cart.map((item) => {
                      const qty = Number(item.qty) || 1;
                      const lineTotal = item.price * qty;
                      return (
                        <div key={item.id} className="tf-cart_item each-prd file-delete" data-id={item.id}>
                          <div className="cart-col cart_product">
                            <a href={item.url} className="img-prd">
                              <img
                                loading="lazy"
                                width={128}
                                height={154}
                                src={assetUrl(item.image)}
                                alt={item.name}
                              />
                            </a>
                            <div className="infor-prd">
                              <a href={item.url} className="prd_name fw-normal link-underline">
                                {item.name}
                              </a>
                              <div className="price-wrap fw-normal gap-6">
                                <p className="price-new text-primary cart_price each-price">{item.priceDisplay}</p>
                                {item.oldPrice && <p className="price-old cl-text-6">{item.oldPrice}</p>}
                              </div>
                              <button
                                type="button"
                                className="cart_remove tf-btn-line fw-normal herbavi-cart-remove"
                                onClick={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  void removeCartItem(item);
                                }}
                              >
                                REMOVE
                              </button>
                            </div>
                          </div>
                          <div className="cart-col cart_quantity" data-cart-title="Quantity">
                            <div className="wg-quantity">
                              <button
                                type="button"
                                className="btn-quantity minus-quantity"
                                onClick={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  changeCartQty(item, qty - 1);
                                }}
                              >
                                <i className="icon icon-Minus"></i>
                              </button>
                              <input className="quantity-product" type="text" name="number" value={qty} readOnly />
                              <button
                                type="button"
                                className="btn-quantity plus-quantity"
                                onClick={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  changeCartQty(item, qty + 1);
                                }}
                              >
                                <i className="icon icon-Plus"></i>
                              </button>
                            </div>
                          </div>
                          <div className="cart-col cart_total fw-normal each-subtotal-price" data-cart-title="Total">
                            {formatMoney(lineTotal, item.priceDisplay)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="col-lg-5">
                <div className="tf-page-cart-sidebar">
                  <div className="tf-cart-totals">
                    <h6 className="font-instrument_serif mb-24">Order Summary</h6>
                    <div className="d-flex justify-content-between mb-16">
                      <span className="text-body-l fw-normal">Subtotal</span>
                      <span className="each-total-price fw-normal">{totalDisplay}</span>
                    </div>
                    <Link to="/checkout" className="tf-btn style-2 type-2 w-100 mb-16">
                      Check out
                    </Link>
                    <Link to="/products" className="tf-btn-line fw-normal w-100 text-center">
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
