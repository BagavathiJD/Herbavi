import { type SubmitEventHandler, useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { fetchProducts, submitCheckout, type CheckoutCartItem } from '../api/client.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useCartActions } from '../hooks/useCartActions.ts';
import { useNotification } from '../context/NotificationContext.tsx';
import { assetUrl } from '../utils/assets.ts';
import { downloadOrderReceipt } from '../utils/downloadOrderReceipt.ts';
import { formatMoney, formatProductTitle } from '../utils/format.tsx';
import { fireConfettiBurst } from '../utils/confettiBurst.ts';

type DeliveryMethod = 'Delivery' | 'Pickup';

interface OrderSummary {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  city: string;
  state: string;
  zipCode: string;
  deliveryMethod: DeliveryMethod;
  discountCode: string;
  discountAmount: number;
  subtotal: number;
  shippingAmount: number;
  totalAmount: number;
  items: CheckoutCartItem[];
  placedAt: string;
}

const DISCOUNT_CODES: Record<string, { type: 'percent' | 'flat'; value: number }> = {
  HERBAVI10: { type: 'percent', value: 10 },
  SAVE100: { type: 'flat', value: 100 },
};

function calculateShipping(subtotal: number, method: DeliveryMethod): number {
  if (method === 'Pickup') return 0;
  return subtotal >= 999 ? 0 : 49;
}

export default function Checkout() {
  const { cart, cartTotal, clearCart, syncStockFromProducts, changeCartQty, removeCartItem } =
    useCartActions();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('Delivery');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('India');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [discountInput, setDiscountInput] = useState('');
  const [appliedDiscountCode, setAppliedDiscountCode] = useState('');
  const [discountError, setDiscountError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);

  useEffect(() => {
    if (!completed) return;
    fireConfettiBurst();
  }, [completed]);

  useEffect(() => {
    if (!user) return;
    setFullName(user.name || '');
    setEmail(user.email || '');
    setPhone(user.phone || '');
  }, [user]);

  useEffect(() => {
    let active = true;
    fetchProducts()
      .then((products) => {
        if (active) {
          syncStockFromProducts(products);
        }
      })
      .catch(() => {
        // Keep cart as-is if stock refresh fails.
      });
    return () => {
      active = false;
    };
  }, [syncStockFromProducts]);

  const subtotal = cartTotal;
  const discountAmount = useMemo(() => {
    if (!appliedDiscountCode) return 0;
    const rule = DISCOUNT_CODES[appliedDiscountCode];
    if (!rule) return 0;
    if (rule.type === 'flat') return Math.min(rule.value, subtotal);
    return Math.round((subtotal * rule.value) / 100);
  }, [appliedDiscountCode, subtotal]);

  const shippingAmount = calculateShipping(subtotal, deliveryMethod);
  const totalAmount = Math.max(0, subtotal + shippingAmount - discountAmount);

  if (cart.length === 0 && !completed) {
    return <Navigate to="/add-to-cart" replace />;
  }

  const applyDiscount = () => {
    const code = discountInput.trim().toUpperCase();
    if (!code) {
      setDiscountError('Enter a discount code.');
      return;
    }
    if (!DISCOUNT_CODES[code]) {
      setDiscountError('Invalid discount code.');
      return;
    }
    setAppliedDiscountCode(code);
    setDiscountError('');
  };

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (!termsAccepted) {
      showError('Please accept the Terms and Conditions.');
      return;
    }

    const trimmedAddress = address.trim();
    if (deliveryMethod === 'Delivery' && !trimmedAddress) {
      showError('Please enter your delivery address.');
      return;
    }

    const overStockItem = cart.find((item) => {
      const maxStock = Math.max(0, Math.floor(Number(item.stock ?? 0)));
      return (Number(item.qty) || 1) > maxStock;
    });
    if (overStockItem) {
      showError(
        `Only ${overStockItem.stock ?? 0} unit(s) left for "${formatProductTitle(overStockItem.name)}".`,
      );
      return;
    }

    setSubmitting(true);
    try {
      const items = cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        qty: item.qty || 1,
        priceDisplay: item.priceDisplay,
        image: item.image,
      }));

      const summary: OrderSummary = {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: trimmedAddress,
        country: country.trim(),
        city: city.trim(),
        state: state.trim(),
        zipCode: zipCode.trim(),
        deliveryMethod,
        discountCode: appliedDiscountCode,
        discountAmount,
        subtotal,
        shippingAmount,
        totalAmount,
        items,
        placedAt: new Date().toISOString(),
      };

      await submitCheckout({
        fullName: summary.fullName,
        email: summary.email,
        phone: summary.phone,
        address: summary.address,
        country: summary.country,
        city: summary.city,
        state: summary.state,
        zipCode: summary.zipCode,
        deliveryMethod: summary.deliveryMethod,
        discountCode: appliedDiscountCode || undefined,
        discountAmount,
        subtotal,
        shippingAmount,
        totalAmount,
        cartItems: items,
        termsAccepted,
      });

      setOrderSummary(summary);
      clearCart();
      setCompleted(true);
      showSuccess('Your order has been placed successfully!');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Checkout failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (completed) {
    const handleDownload = () => {
      if (!orderSummary) return;
      downloadOrderReceipt({
        fullName: orderSummary.fullName,
        email: orderSummary.email,
        phone: orderSummary.phone,
        address: orderSummary.address,
        country: orderSummary.country,
        city: orderSummary.city,
        state: orderSummary.state,
        zipCode: orderSummary.zipCode,
        deliveryMethod: orderSummary.deliveryMethod,
        discountCode: orderSummary.discountCode || undefined,
        discountAmount: orderSummary.discountAmount,
        subtotal: orderSummary.subtotal,
        shippingAmount: orderSummary.shippingAmount,
        totalAmount: orderSummary.totalAmount,
        items: orderSummary.items,
        placedAt: orderSummary.placedAt,
      });
    };

    return (
      <section className="herbavi-checkout-page flat-spacing">
        <div className="container">
          <div className="herbavi-checkout-success herbavi-checkout-success--celebrate herbavi-checkout-success--with-details">
            <div className="herbavi-checkout-success-header">
              <div className="herbavi-checkout-success-icon" aria-hidden="true">✓</div>
              <h1 className="herbavi-checkout-title">Order placed successfully!</h1>
              <p className="herbavi-checkout-subtitle">
                Thank you for shopping with Herbavi. Your order details have been saved and our team will
                confirm your secure payment shortly.
              </p>
            </div>

            {orderSummary && (
              <div className="herbavi-checkout-success-body">
                <div className="herbavi-checkout-success-grid">
                  <div className="herbavi-checkout-success-section">
                    <h2 className="herbavi-checkout-success-heading">Customer Details</h2>
                    <dl className="herbavi-checkout-success-dl">
                      <div>
                        <dt>Full name</dt>
                        <dd>{orderSummary.fullName}</dd>
                      </div>
                      <div>
                        <dt>Email</dt>
                        <dd>{orderSummary.email}</dd>
                      </div>
                      <div>
                        <dt>Phone</dt>
                        <dd>+91 {orderSummary.phone}</dd>
                      </div>
                      <div>
                        <dt>Street address</dt>
                        <dd style={{ whiteSpace: 'pre-line' }}>{orderSummary.address || '—'}</dd>
                      </div>
                      <div>
                        <dt>City / State / PIN</dt>
                        <dd>
                          {orderSummary.city}, {orderSummary.state} {orderSummary.zipCode}
                          <br />
                          {orderSummary.country}
                        </dd>
                      </div>
                      <div>
                        <dt>Delivery method</dt>
                        <dd>{orderSummary.deliveryMethod}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="herbavi-checkout-success-section">
                    <h2 className="herbavi-checkout-success-heading">Order Summary</h2>
                    <ul className="herbavi-checkout-success-items">
                      {orderSummary.items.map((item) => (
                        <li key={item.id} className="herbavi-checkout-success-item">
                          {item.image && (
                            <img
                              src={assetUrl(item.image)}
                              alt={item.name}
                              className="herbavi-checkout-success-item-image"
                            />
                          )}
                          <div className="herbavi-checkout-success-item-info">
                            <p className="herbavi-checkout-success-item-name">
                              {formatProductTitle(item.name)}
                            </p>
                            <p className="herbavi-checkout-success-item-qty">Qty: {item.qty}</p>
                          </div>
                          <p className="herbavi-checkout-success-item-price">
                            {formatMoney(item.price * item.qty, item.priceDisplay)}
                          </p>
                        </li>
                      ))}
                    </ul>

                    <dl className="herbavi-checkout-summary herbavi-checkout-summary--success">
                      <div className="herbavi-checkout-summary-row">
                        <dt>Subtotal</dt>
                        <dd>{formatMoney(orderSummary.subtotal)}</dd>
                      </div>
                      <div className="herbavi-checkout-summary-row">
                        <dt>Shipping</dt>
                        <dd>
                          {orderSummary.shippingAmount === 0
                            ? 'Free'
                            : formatMoney(orderSummary.shippingAmount)}
                        </dd>
                      </div>
                      {orderSummary.discountAmount > 0 && (
                        <div className="herbavi-checkout-summary-row is-discount">
                          <dt>Discount{orderSummary.discountCode ? ` (${orderSummary.discountCode})` : ''}</dt>
                          <dd>-{formatMoney(orderSummary.discountAmount)}</dd>
                        </div>
                      )}
                      <div className="herbavi-checkout-summary-row is-total">
                        <dt>Total</dt>
                        <dd>{formatMoney(orderSummary.totalAmount)}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            )}

            <div className="herbavi-checkout-success-actions">
              {orderSummary && (
                <button type="button" className="herbavi-checkout-download-btn" onClick={handleDownload}>
                  Download Receipt
                </button>
              )}
              <Link to="/products" className="herbavi-checkout-pay-btn">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="herbavi-checkout-page flat-spacing" data-herbavi-react="true">
      <div className="container">
        <h1 className="herbavi-checkout-title">Checkout</h1>

        <form className="herbavi-checkout-layout" onSubmit={handleSubmit}>
          <div className="herbavi-checkout-main">
            <h2 className="herbavi-checkout-section-title">Shipping Information</h2>

            <div className="herbavi-checkout-delivery-toggle" role="radiogroup" aria-label="Delivery method">
              <label className={`herbavi-delivery-option${deliveryMethod === 'Delivery' ? ' is-active' : ''}`}>
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="Delivery"
                  checked={deliveryMethod === 'Delivery'}
                  onChange={() => setDeliveryMethod('Delivery')}
                />
                <span className="herbavi-delivery-option-icon">
                  <i className="icon icon-Truck" />
                </span>
                <span className="herbavi-delivery-option-label">Delivery</span>
              </label>
              <label className={`herbavi-delivery-option${deliveryMethod === 'Pickup' ? ' is-active' : ''}`}>
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="Pickup"
                  checked={deliveryMethod === 'Pickup'}
                  onChange={() => setDeliveryMethod('Pickup')}
                />
                <span className="herbavi-delivery-option-icon">
                  <i className="icon icon-Box" />
                </span>
                <span className="herbavi-delivery-option-label">Pick up</span>
              </label>
            </div>

            <div className="herbavi-checkout-field">
              <label htmlFor="checkout-full-name">
                Full name <span className="herbavi-required">*</span>
              </label>
              <input
                id="checkout-full-name"
                type="text"
                placeholder="Enter full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="herbavi-checkout-field">
              <label htmlFor="checkout-email">
                Email address <span className="herbavi-required">*</span>
              </label>
              <input
                id="checkout-email"
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="herbavi-checkout-field">
              <label htmlFor="checkout-phone">
                Phone number <span className="herbavi-required">*</span>
              </label>
              <div className="herbavi-phone-input">
                <span className="herbavi-phone-prefix">+91</span>
                <input
                  id="checkout-phone"
                  type="tel"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  required
                />
              </div>
            </div>

            <div className="herbavi-checkout-field">
              <label htmlFor="checkout-address">
                Street address
                {deliveryMethod === 'Delivery' && <span className="herbavi-required"> *</span>}
              </label>
              <textarea
                id="checkout-address"
                placeholder="House no., street, area, landmark"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                maxLength={500}
                required={deliveryMethod === 'Delivery'}
              />
            </div>

            <div className="herbavi-checkout-field">
              <label htmlFor="checkout-country">
                Country <span className="herbavi-required">*</span>
              </label>
              <select
                id="checkout-country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
              >
                <option value="India">India</option>
              </select>
            </div>

            <div className="herbavi-checkout-row">
              <div className="herbavi-checkout-field">
                <label htmlFor="checkout-city">
                  City <span className="herbavi-required">*</span>
                </label>
                <input
                  id="checkout-city"
                  type="text"
                  placeholder="Enter city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
              <div className="herbavi-checkout-field">
                <label htmlFor="checkout-state">
                  State <span className="herbavi-required">*</span>
                </label>
                <input
                  id="checkout-state"
                  type="text"
                  placeholder="Enter state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                />
              </div>
              <div className="herbavi-checkout-field">
                <label htmlFor="checkout-zip">
                  ZIP Code <span className="herbavi-required">*</span>
                </label>
                <input
                  id="checkout-zip"
                  type="text"
                  placeholder="Enter ZIP code"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                />
              </div>
            </div>

            <label className="herbavi-checkout-terms">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              <span>
                I have read and agree to the{' '}
                <Link to="/faq" target="_blank" rel="noreferrer">
                  Terms and Conditions
                </Link>
                .
              </span>
            </label>
          </div>

          <aside className="herbavi-checkout-sidebar">
            <h2 className="herbavi-checkout-section-title">Review your cart</h2>

            <ul className="herbavi-checkout-items">
              {cart.map((item) => {
                const qty = Number(item.qty) || 1;
                const maxStock = Math.max(0, Math.floor(Number(item.stock ?? 0)));

                return (
                  <li key={item.id} className="herbavi-checkout-item">
                    <img src={assetUrl(item.image)} alt={item.name} className="herbavi-checkout-item-image" />
                    <div className="herbavi-checkout-item-info">
                      <p className="herbavi-checkout-item-name">{formatProductTitle(item.name)}</p>
                      <p className="herbavi-checkout-item-stock">{maxStock} left in stock</p>
                      <div className="herbavi-checkout-item-qty-controls">
                        <button
                          type="button"
                          className="herbavi-checkout-qty-btn herbavi-checkout-qty-btn--minus"
                          aria-label="Decrease quantity"
                          onClick={() => changeCartQty(item, qty - 1)}
                          disabled={qty <= 1}
                        >
                          -
                        </button>
                        <span className="herbavi-checkout-qty-value">{qty}</span>
                        <button
                          type="button"
                          className="herbavi-checkout-qty-btn herbavi-checkout-qty-btn--plus"
                          aria-label="Increase quantity"
                          onClick={() => changeCartQty(item, qty + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <p className="herbavi-checkout-item-price">
                      {formatMoney(item.price * qty, item.priceDisplay)}
                    </p>
                    <button
                      type="button"
                      className="herbavi-checkout-item-remove"
                      aria-label={`Remove ${formatProductTitle(item.name)} from cart`}
                      onClick={() => {
                        void removeCartItem(item, true);
                      }}
                    >
                      Cancel
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="herbavi-checkout-discount">
              <div className="herbavi-checkout-discount-input">
                <span className="herbavi-checkout-discount-icon" aria-hidden="true">%</span>
                <input
                  type="text"
                  placeholder="Discount code"
                  value={discountInput}
                  onChange={(e) => setDiscountInput(e.target.value)}
                />
                <button type="button" className="herbavi-checkout-apply-btn" onClick={applyDiscount}>
                  Apply
                </button>
              </div>
              {discountError && <p className="herbavi-checkout-discount-error">{discountError}</p>}
              {appliedDiscountCode && (
                <p className="herbavi-checkout-discount-applied">Code {appliedDiscountCode} applied</p>
              )}
            </div>

            <dl className="herbavi-checkout-summary">
              <div className="herbavi-checkout-summary-row">
                <dt>Subtotal</dt>
                <dd>{formatMoney(subtotal)}</dd>
              </div>
              <div className="herbavi-checkout-summary-row">
                <dt>Shipping</dt>
                <dd>{shippingAmount === 0 ? 'Free' : formatMoney(shippingAmount)}</dd>
              </div>
              {discountAmount > 0 && (
                <div className="herbavi-checkout-summary-row is-discount">
                  <dt>Discount</dt>
                  <dd>-{formatMoney(discountAmount)}</dd>
                </div>
              )}
              <div className="herbavi-checkout-summary-row is-total">
                <dt>Total</dt>
                <dd>{formatMoney(totalAmount)}</dd>
              </div>
            </dl>

            <button type="submit" className="herbavi-checkout-pay-btn" disabled={submitting}>
              {submitting ? 'Placing order...' : 'Place Order'}
            </button>

            <div className="herbavi-checkout-secure">
              <i className="icon icon-FingerPrint" aria-hidden="true" />
              <div>
                <p className="herbavi-checkout-secure-title">Secure Payment — SSL Encrypted</p>
                <p className="herbavi-checkout-secure-text">
                  All payment information is encrypted and processed through trusted, secure payment
                  gateways to protect your card and personal details.
                </p>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </section>
  );
}
