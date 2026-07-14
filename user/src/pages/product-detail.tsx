import { type FormEvent, type MouseEvent, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchProductById } from '../api/client.ts';
import { useCartActions } from '../hooks/useCartActions.ts';
import type { Product } from '../types/product.tsx';
import { assetUrl } from '../utils/assets.ts';
import { fetchPincodeLocation, getDeliveryEstimate } from '../utils/pincode.ts';
import {
  displayPrice,
  formatProductTitle,
  getDiscountPercent,
  parsePriceAmount,
} from '../utils/format.tsx';

function openCartPanel() {
  const el = document.getElementById('shoppingCart');
  const bootstrap = (
    window as Window & {
      bootstrap?: { Offcanvas: { getOrCreateInstance: (el: HTMLElement) => { show: () => void } } };
    }
  ).bootstrap;
  if (el && bootstrap) {
    bootstrap.Offcanvas.getOrCreateInstance(el).show();
  }
}

function ProductStars({ rating }: { rating: number }) {
  return (
    <div className="herbavi-pdp-rating">
      <div className="herbavi-pdp-stars">
        {Array.from({ length: 5 }).map((_, index) => (
          <i
            key={index}
            className={`icon ${index < Math.floor(rating) ? 'icon-Star' : 'icon-StarSroke'}`}
          />
        ))}
      </div>
      <span className="herbavi-pdp-rating-value font-geist">{rating.toFixed(1)} / 5</span>
    </div>
  );
}

const PRODUCT_HIGHLIGHTS = [
  { icon: 'icon-Leaf', label: '100% natural botanical actives' },
  { icon: 'icon-Box', label: 'Ayurvedic & Siddha inspired formula' },
  { icon: 'icon-FingerPrint', label: 'Dermatologically tested blend' },
  { icon: 'icon-Sparkle', label: 'Cruelty-free & paraben-free' },
] as const;

export default function ProductDetail() {
  const [searchParams] = useSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState<ReturnType<typeof getDeliveryEstimate>>(null);
  const [pincodeError, setPincodeError] = useState('');
  const [pincodeChecking, setPincodeChecking] = useState(false);
  const { addProductToCart, toggleWishlistItem, isInWishlist } = useCartActions();

  useEffect(() => {
    const id = searchParams.get('id');
    let cancelled = false;

    (async () => {
      setLoading(true);
      const result = id ? await fetchProductById(id) : null;
      if (!cancelled) {
        setProduct(result);
        setLoading(false);
        setQuantity(1);
        setPincode('');
        setDeliveryInfo(null);
        setPincodeError('');
        setPincodeChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  if (loading) {
    return (
      <section className="herbavi-product-detail herbavi-product-detail--loading">
        <div className="container">
          <div className="herbavi-pdp-skeleton-breadcrumb" />
          <div className="herbavi-pdp-grid">
            <div className="herbavi-pdp-skeleton-image" />
            <div className="herbavi-pdp-skeleton-content">
              <div className="herbavi-pdp-skeleton-line herbavi-pdp-skeleton-line--sm" />
              <div className="herbavi-pdp-skeleton-line herbavi-pdp-skeleton-line--lg" />
              <div className="herbavi-pdp-skeleton-line herbavi-pdp-skeleton-line--md" />
              <div className="herbavi-pdp-skeleton-line herbavi-pdp-skeleton-line--price" />
              <div className="herbavi-pdp-skeleton-line" />
              <div className="herbavi-pdp-skeleton-line" />
              <div className="herbavi-pdp-skeleton-actions" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="herbavi-product-detail">
        <div className="container text-center py-5">
          <h1 className="font-instrument_serif mb-16">Product not found</h1>
          <Link to="/products" className="tf-btn style-2 type-2">
            Back to shop
          </Link>
        </div>
      </section>
    );
  }

  const productTitle = formatProductTitle(product.name);
  const wished = isInWishlist(product.id);
  const currentPriceLabel = displayPrice(product.priceDisplay, product.price);
  const originalAmount = product.oldPrice ? parsePriceAmount(product.oldPrice) : null;
  const originalPriceLabel =
    originalAmount != null ? displayPrice(product.oldPrice, originalAmount) : null;
  const discountPercent =
    originalAmount != null ? getDiscountPercent(product.price, originalAmount) : null;
  const descriptionText =
    product.description ||
    'a lightweight formula with botanical actives for clearer, smoother-looking skin.';

  const handleAddToCart = (event?: MouseEvent) => {
    event?.preventDefault();
    addProductToCart(product, quantity);
    openCartPanel();
  };

  const handleWishlist = (event: MouseEvent) => {
    event.preventDefault();
    void toggleWishlistItem(product);
  };

  const decreaseQty = () => setQuantity((value) => Math.max(1, value - 1));
  const increaseQty = () => setQuantity((value) => Math.min(10, value + 1));

  const handlePincodeCheck = async (event: FormEvent) => {
    event.preventDefault();
    const code = pincode.replace(/\D/g, '');
    if (code.length !== 6) {
      setPincodeError('Please enter a valid 6-digit pincode.');
      setDeliveryInfo(null);
      return;
    }

    setPincodeChecking(true);
    setPincodeError('');
    setDeliveryInfo(null);

    try {
      const location = await fetchPincodeLocation(code);
      const estimate = getDeliveryEstimate(code, location);
      setDeliveryInfo(estimate);
    } catch (error) {
      setPincodeError(error instanceof Error ? error.message : 'Unable to look up pincode.');
      setDeliveryInfo(null);
    } finally {
      setPincodeChecking(false);
    }
  };

  return (
    <section className="herbavi-product-detail">
      <div className="container">
        <nav className="herbavi-pdp-breadcrumb font-geist" aria-label="Breadcrumb">
          <Link to="/" className="link">
            Home
          </Link>
          <i className="icon icon-ArrowCaretRight" aria-hidden="true" />
          <Link to="/products" className="link">
            Shop
          </Link>
          <i className="icon icon-ArrowCaretRight" aria-hidden="true" />
          <span>{productTitle}</span>
        </nav>

        <div className="herbavi-pdp-grid">
          <div className="herbavi-pdp-media">
            <figure className="herbavi-pdp-gallery herbavi-pdp-animate herbavi-pdp-animate--image">
              {product.badge && (
                <span className="herbavi-pdp-badge font-geist">{product.badge}</span>
              )}
              <img
                src={assetUrl(product.image)}
                alt={productTitle}
                className="herbavi-pdp-image"
                loading="eager"
              />
            </figure>
          </div>

          <div className="herbavi-pdp-buybox">
            <div className="herbavi-pdp-info herbavi-pdp-animate herbavi-pdp-animate--content">
              <div className="herbavi-pdp-header">
                <p className="herbavi-pdp-brand font-geist">{product.brand}</p>
                <h1 className="herbavi-pdp-title font-instrument_serif">{productTitle}</h1>
                <ProductStars rating={product.rating} />
              </div>

              <div className="herbavi-pdp-price-block">
                <span className="herbavi-pdp-price">{currentPriceLabel}</span>
                {originalPriceLabel && (
                  <span className="herbavi-pdp-price-old">{originalPriceLabel}</span>
                )}
                {discountPercent != null && (
                  <span className="herbavi-pdp-discount font-geist">{discountPercent}% OFF</span>
                )}
              </div>

              <p className="herbavi-pdp-description font-geist">{descriptionText}</p>

              <form className="herbavi-pdp-delivery font-geist" onSubmit={handlePincodeCheck}>
                <label className="herbavi-pdp-delivery-label" htmlFor="herbavi-pdp-pincode">
                  Check delivery
                </label>
                <div className="herbavi-pdp-delivery-row">
                  <div className="herbavi-pdp-delivery-input-wrap">
                    <input
                      id="herbavi-pdp-pincode"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Enter pincode"
                      className="herbavi-pdp-delivery-input"
                      value={pincode}
                      onChange={(event) => {
                        setPincode(event.target.value.replace(/\D/g, '').slice(0, 6));
                        setDeliveryInfo(null);
                        setPincodeError('');
                      }}
                    />
                    {deliveryInfo?.locationLabel && (
                      <span className="herbavi-pdp-delivery-district herbavi-pdp-delivery-district--inline font-geist">
                        {deliveryInfo.locationLabel}
                      </span>
                    )}
                  </div>
                  <button type="submit" className="herbavi-pdp-delivery-btn" disabled={pincodeChecking}>
                    {pincodeChecking ? 'Checking…' : 'Check'}
                  </button>
                </div>
                {pincodeError && <p className="herbavi-pdp-delivery-error">{pincodeError}</p>}
                {deliveryInfo && (
                  <p className="herbavi-pdp-delivery-success">
                    <i className="icon icon-Box" />
                    <span>
                      Delivery to{' '}
                      <span className="herbavi-pdp-delivery-location">
                        <strong>{deliveryInfo.pincode}</strong>
                        {deliveryInfo.locationLabel && (
                          <span className="herbavi-pdp-delivery-district">{deliveryInfo.locationLabel}</span>
                        )}
                      </span>{' '}
                      in <strong>{deliveryInfo.leadDays}–{deliveryInfo.leadDays + 1} days</strong> — by{' '}
                      <strong>{deliveryInfo.label}</strong>
                    </span>
                  </p>
                )}
              </form>

              <div className="herbavi-pdp-purchase">
                <div className="herbavi-pdp-quantity">
                  <span className="herbavi-pdp-quantity-label font-geist">Quantity</span>
                  <div className="herbavi-pdp-quantity-control">
                    <button
                      type="button"
                      className="herbavi-pdp-qty-btn"
                      onClick={decreaseQty}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="herbavi-pdp-qty-value font-geist">{quantity}</span>
                    <button
                      type="button"
                      className="herbavi-pdp-qty-btn"
                      onClick={increaseQty}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="herbavi-pdp-actions">
                  <button
                    type="button"
                    className="tf-btn style-2 type-2 herbavi-pdp-add-cart"
                    onClick={handleAddToCart}
                  >
                    Add to cart
                    <i className="icon icon-ShoppingCart" />
                  </button>
                  <button
                    type="button"
                    className={`herbavi-pdp-wishlist-btn${wished ? ' is-active' : ''}`}
                    onClick={handleWishlist}
                    aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <i className={`icon ${wished ? 'icon-HearthFill' : 'icon-Hearth'}`} />
                  </button>
                </div>
              </div>

              <ul className="herbavi-pdp-highlights font-geist">
                {PRODUCT_HIGHLIGHTS.map((item) => (
                  <li key={item.label}>
                    <i className={`icon ${item.icon}`} />
                    {item.label}
                  </li>
                ))}
              </ul>

              <ul className="herbavi-pdp-trust font-geist">
                <li>
                  <i className="icon icon-Box" />
                  Free shipping over Rs. 999
                </li>
                <li>
                  <i className="icon icon-Leaf" />
                  Easy 7-day returns
                </li>
                <li>
                  <i className="icon icon-FingerPrint" />
                  Secure checkout
                </li>
              </ul>

              <Link to="/products" className="herbavi-pdp-back link font-geist">
                <i className="icon icon-ArrowCaretLeft" />
                Continue shopping
              </Link>
            </div>
          </div>
        </div>

        <div className="herbavi-pdp-extra">
          <div className="herbavi-pdp-extra-card">
            <h2 className="herbavi-pdp-extra-title font-instrument_serif">How to use</h2>
            <p className="herbavi-pdp-extra-text font-geist">
              apply a small amount to clean skin morning and evening. massage gently until fully
              absorbed. use consistently for best ayurvedic and siddha wellness results.
            </p>
          </div>
          <div className="herbavi-pdp-extra-card">
            <h2 className="herbavi-pdp-extra-title font-instrument_serif">Ingredients</h2>
            <p className="herbavi-pdp-extra-text font-geist">
              enriched with herbal extracts, cold-pressed oils, and plant-based actives chosen for
              balance, nourishment, and long-term skin wellness.
            </p>
          </div>
          <div className="herbavi-pdp-extra-card">
            <h2 className="herbavi-pdp-extra-title font-instrument_serif">Why Herbavi</h2>
            <p className="herbavi-pdp-extra-text font-geist">
              crafted with authentic ayurvedic and siddha principles, quality-checked batches, and
              transparent ingredient sourcing you can trust.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

