import { type MouseEvent, type SubmitEventHandler, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { fetchMeasurements, fetchProductDetail, type Measurement } from '../api/client.ts';
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
import { getStockClassName, getStockDisplay } from '../utils/stock.ts';

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

function formatCategoryLabel(category: Product['category']): string {
  if (category === 'siddha') return 'Siddha';
  if (category === 'unani') return 'Unani';
  return 'Ayurveda';
}

function ProductStars({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  return (
    <div className="herbavi-pdp-rating herbavi-pdp-rating--compact">
      <div className="herbavi-pdp-stars">
        {Array.from({ length: 5 }).map((_, index) => (
          <i
            key={index}
            className={`icon ${index < Math.floor(rating) ? 'icon-Star' : 'icon-StarSroke'}`}
          />
        ))}
      </div>
      <span className="herbavi-pdp-rating-value font-geist">
        {rating.toFixed(1)} ({reviewCount})
      </span>
    </div>
  );
}

const TRUST_BADGES = [
  { icon: 'icon-FingerPrint', label: '100% Authentic' },
  { icon: 'icon-Truck', label: 'Fast Delivery' },
  { icon: 'icon-Leaf', label: 'Quality Guaranteed' },
  { icon: 'icon-Box', label: 'Secure Checkout' },
] as const;

export default function ProductDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [unitVariants, setUnitVariants] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState<ReturnType<typeof getDeliveryEstimate>>(null);
  const [pincodeError, setPincodeError] = useState('');
  const [pincodeChecking, setPincodeChecking] = useState(false);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [unitSelectionError, setUnitSelectionError] = useState('');
  const [volumeInput, setVolumeInput] = useState('1');
  const [volumeError, setVolumeError] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const { addProductToCart, toggleWishlistItem, isInWishlist } = useCartActions();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const rows = await fetchMeasurements();
      if (!cancelled) {
        setMeasurements(rows);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const id = searchParams.get('id');
    let cancelled = false;

    (async () => {
      setLoading(true);
      const result = id ? await fetchProductDetail(id) : null;
      if (!cancelled) {
        setProduct(result?.product ?? null);
        setUnitVariants(result?.variants ?? []);
        setLoading(false);
        setActiveImageIndex(0);
        setQuantity(1);
        setPincode('');
        setDeliveryInfo(null);
        setPincodeError('');
        setPincodeChecking(false);
        setUnitSelectionError('');
        setVolumeInput(result?.product?.measurementValue ?? '1');
        setVolumeError('');
        setSelectedUnitId(result?.product?.measurementId ?? '');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    const raw = product.galleryImages?.length ? product.galleryImages : [product.image];
    return [...new Set(raw.map((item) => item.trim()).filter(Boolean))];
  }, [product]);

  const productVariants = useMemo(
    () => (unitVariants.length > 0 ? unitVariants : product ? [product] : []),
    [unitVariants, product]
  );

  const activeMeasurements = useMemo(() => {
    const enabled = measurements
      .filter((item) => item.status === 'Enabled')
      .sort((a, b) => a.name.localeCompare(b.name));

    if (
      product?.measurementId &&
      !enabled.some((item) => item.id === product.measurementId)
    ) {
      return [
        ...enabled,
        {
          id: product.measurementId,
          name: product.measurementName?.trim() || product.measurementLabel || 'Unit',
          status: 'Enabled' as const,
          createdAt: '',
        },
      ].sort((a, b) => a.name.localeCompare(b.name));
    }

    return enabled;
  }, [measurements, product?.measurementId, product?.measurementName, product?.measurementLabel]);

  useEffect(() => {
    if (!product) return;
    setSelectedUnitId(product.measurementId ?? '');
    setVolumeInput(product.measurementValue ?? '1');
    setVolumeError('');
    setUnitSelectionError('');
  }, [product?.id, product?.measurementId, product?.measurementValue]);

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
  const categoryLabel = formatCategoryLabel(product.category);
  const wished = isInWishlist(product.id);
  const currentPriceLabel = displayPrice(product.priceDisplay, product.price);
  const originalAmount = product.oldPrice ? parsePriceAmount(product.oldPrice) : null;
  const originalPriceLabel =
    originalAmount != null ? displayPrice(product.oldPrice, originalAmount) : null;
  const discountPercent =
    originalAmount != null ? getDiscountPercent(product.price, originalAmount) : null;
  const stockDisplay = getStockDisplay(product.stock);
  const descriptionText =
    product.description ||
    'A lightweight formula with botanical actives for clearer, smoother-looking skin.';
  const measurementLabel = product.measurementLabel || 'Standard pack';

  const navigateToVariant = (variantId: string) => {
    if (variantId === product.id) return;
    navigate(`/product-detail?id=${encodeURIComponent(variantId)}`);
  };

  const resolveVariant = (measurementId: string, measurementValue?: string) => {
    const matches = productVariants.filter((variant) => variant.measurementId === measurementId);
    if (matches.length === 0) return null;
    if (measurementValue) {
      const exact = matches.find((variant) => variant.measurementValue === measurementValue);
      if (exact) return exact;

      const numericValue = Number(measurementValue);
      if (!Number.isNaN(numericValue)) {
        return (
          matches.find((variant) => Number(variant.measurementValue) === numericValue) ?? null
        );
      }
      return null;
    }
    return matches[0];
  };

  const applyMeasurementSelection = (measurementId: string, measurementValue?: string) => {
    if (!measurementId) return;

    const trimmedValue = measurementValue?.trim();
    const target =
      (trimmedValue ? resolveVariant(measurementId, trimmedValue) : null) ??
      resolveVariant(measurementId);

    if (target) {
      setUnitSelectionError('');
      navigateToVariant(target.id);
      return;
    }

    setUnitSelectionError('This unit is not available for this product.');
    setSelectedUnitId(product.measurementId ?? '');
  };

  const handleUnitChange = (measurementId: string) => {
    if (!measurementId) return;
    setSelectedUnitId(measurementId);
    applyMeasurementSelection(measurementId, volumeInput);
  };

  const handleVolumeInputChange = (value: string) => {
    setVolumeError('');

    if (!/^\d*\.?\d*$/.test(value)) {
      return;
    }

    if (value === '' || value === '.') {
      setVolumeInput(value);
      return;
    }

    const parsed = Number(value);
    if (!Number.isNaN(parsed) && parsed < 1) {
      return;
    }

    setVolumeInput(value);
  };

  const commitVolumeInput = () => {
    const trimmed = volumeInput.trim();
    const parsed = Number(trimmed);

    if (!trimmed || Number.isNaN(parsed) || parsed < 1) {
      setVolumeInput(product.measurementValue ?? '1');
      setVolumeError('Volume must be at least 1.');
      return;
    }

    const normalized = String(parsed);
    setVolumeInput(normalized);

    if (normalized === product.measurementValue && selectedUnitId === product.measurementId) {
      return;
    }

    const unitId = selectedUnitId || product.measurementId;
    if (!unitId) {
      setVolumeInput(product.measurementValue ?? '1');
      return;
    }

    const target = resolveVariant(unitId, normalized);
    if (target) {
      setUnitSelectionError('');
      navigateToVariant(target.id);
      return;
    }

    setVolumeError('This volume is not available for the selected unit.');
    setVolumeInput(product.measurementValue ?? '1');
    setSelectedUnitId(product.measurementId ?? '');
  };
  const activeImage = galleryImages[activeImageIndex] ?? product.image;

  const showPreviousImage = () => {
    setActiveImageIndex((index) => (index - 1 + galleryImages.length) % galleryImages.length);
  };

  const showNextImage = () => {
    setActiveImageIndex((index) => (index + 1) % galleryImages.length);
  };

  const handleAddToCart = (event?: MouseEvent) => {
    event?.preventDefault();
    if (maxPurchasableQty <= 0) return;
    addProductToCart(product, Math.min(quantity, maxPurchasableQty));
    openCartPanel();
  };

  const handleBuyNow = (event: MouseEvent) => {
    event.preventDefault();
    if (maxPurchasableQty <= 0) return;
    addProductToCart(product, Math.min(quantity, maxPurchasableQty));
    navigate('/checkout');
  };

  const handleWishlist = (event: MouseEvent) => {
    event.preventDefault();
    void toggleWishlistItem(product);
  };

  const decreaseQty = () => setQuantity((value) => Math.max(1, value - 1));
  const increaseQty = () => {
    const maxStock = Math.max(0, Math.floor(Number(product.stock ?? 0)));
    setQuantity((value) => {
      if (value >= maxStock) return value;
      return value + 1;
    });
  };
  const maxPurchasableQty = Math.max(0, Math.floor(Number(product.stock ?? 0)));
  const canIncreaseQty = quantity < maxPurchasableQty;

  const handlePincodeCheck: SubmitEventHandler<HTMLFormElement> = async (event) => {
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
    <section className="herbavi-product-detail herbavi-product-detail--modern">
      <div className="container">
        <nav className="herbavi-pdp-breadcrumb font-geist" aria-label="Breadcrumb">
          <Link to="/" className="link">
            Home
          </Link>
          <span className="herbavi-pdp-breadcrumb-sep">/</span>
          <Link to="/products" className="link">
            Shop
          </Link>
          <span className="herbavi-pdp-breadcrumb-sep">/</span>
          <Link to={`/products?category=${product.category}`} className="link">
            {categoryLabel}
          </Link>
          <span className="herbavi-pdp-breadcrumb-sep">/</span>
          <span className="herbavi-pdp-breadcrumb-current">{productTitle}</span>
        </nav>

        <div className="herbavi-pdp-grid">
          <div className="herbavi-pdp-media">
            <div className="herbavi-pdp-gallery-wrap herbavi-pdp-animate herbavi-pdp-animate--image">
              <figure className="herbavi-pdp-gallery">
                {product.badge && (
                  <span className="herbavi-pdp-badge font-geist">{product.badge}</span>
                )}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="herbavi-pdp-gallery-nav herbavi-pdp-gallery-nav--prev"
                      onClick={showPreviousImage}
                      aria-label="Previous image"
                    >
                      <i className="icon icon-ArrowCaretLeft" />
                    </button>
                    <button
                      type="button"
                      className="herbavi-pdp-gallery-nav herbavi-pdp-gallery-nav--next"
                      onClick={showNextImage}
                      aria-label="Next image"
                    >
                      <i className="icon icon-ArrowCaretRight" />
                    </button>
                    <span className="herbavi-pdp-gallery-counter font-geist">
                      {activeImageIndex + 1}/{galleryImages.length}
                    </span>
                  </>
                )}
                <img
                  src={assetUrl(activeImage)}
                  alt={productTitle}
                  className="herbavi-pdp-image"
                  loading="eager"
                />
              </figure>

              {galleryImages.length > 1 && (
                <div className="herbavi-pdp-thumbs" role="tablist" aria-label="Product images">
                  {galleryImages.map((image, index) => (
                    <button
                      key={`${product.id}-${index}`}
                      type="button"
                      role="tab"
                      aria-selected={index === activeImageIndex}
                      className={`herbavi-pdp-thumb${index === activeImageIndex ? ' is-active' : ''}`}
                      onClick={() => setActiveImageIndex(index)}
                    >
                      <img src={assetUrl(image)} alt={`${productTitle} view ${index + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="herbavi-pdp-buybox">
            <div className="herbavi-pdp-info herbavi-pdp-animate herbavi-pdp-animate--content">
              <div className="herbavi-pdp-header">
                <p className="herbavi-pdp-category font-geist">{categoryLabel.toUpperCase()}</p>
                <div className="herbavi-pdp-title-row">
                  <h1 className="herbavi-pdp-title font-instrument_serif">{productTitle}</h1>
                  <button
                    type="button"
                    className={`herbavi-pdp-share-btn${wished ? ' is-active' : ''}`}
                    onClick={handleWishlist}
                    aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <i className={`icon ${wished ? 'icon-HearthFill' : 'icon-Hearth'}`} />
                  </button>
                </div>
                <p className="herbavi-pdp-lead font-geist">{descriptionText}</p>

                <div className="herbavi-pdp-price-block herbavi-pdp-price-block--modern">
                  <div className="herbavi-pdp-price-row">
                    <span className="herbavi-pdp-price">{currentPriceLabel}</span>
                    {originalPriceLabel && (
                      <span className="herbavi-pdp-price-old">{originalPriceLabel}</span>
                    )}
                    {discountPercent != null && (
                      <span className="herbavi-pdp-discount font-geist">({discountPercent}% OFF)</span>
                    )}
                  </div>
                  <p className="herbavi-pdp-price-note font-geist">MRP inclusive of all taxes</p>
                  <p className="herbavi-pdp-price-note font-geist">Net Qty. {measurementLabel}</p>
                  {stockDisplay && (
                    <p className={getStockClassName('herbavi-pdp-stock-left font-geist', stockDisplay.variant)}>
                      {stockDisplay.text}
                    </p>
                  )}
                </div>

                <ProductStars rating={product.rating} reviewCount={29} />
              </div>

              <div className="herbavi-pdp-availability font-geist">
                <i className="icon icon-CheckCircleFill" />
                <span>Available • Ships in 24 hours</span>
              </div>

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
                  </div>
                  <button type="submit" className="herbavi-pdp-delivery-btn" disabled={pincodeChecking}>
                    {pincodeChecking ? 'Checking…' : 'Check'}
                  </button>
                </div>
                {pincodeError && <p className="herbavi-pdp-delivery-error">{pincodeError}</p>}
                {deliveryInfo && (
                  <p className="herbavi-pdp-delivery-success">
                    Delivery to <strong>{deliveryInfo.pincode}</strong> in{' '}
                    <strong>{deliveryInfo.leadDays}–{deliveryInfo.leadDays + 1} days</strong>
                  </p>
                )}
              </form>

              <div className="herbavi-pdp-purchase herbavi-pdp-purchase--modern">
                <div className="herbavi-pdp-quantity herbavi-pdp-quantity--modern">
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
                      disabled={!canIncreaseQty}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="herbavi-pdp-buy-row">
                  <button
                    type="button"
                    className="herbavi-pdp-add-cart-main font-geist"
                    onClick={handleAddToCart}
                  >
                    <i className="icon icon-ShoppingCart" />
                    Add to Cart
                  </button>

                  <button type="button" className="herbavi-pdp-buy-now" onClick={handleBuyNow}>
                    Buy now
                    <i className="icon icon-ShoppingCart" />
                  </button>
                </div>
              </div>

              <div className="herbavi-pdp-trust-grid">
                {TRUST_BADGES.map((item) => (
                  <div key={item.label} className="herbavi-pdp-trust-card font-geist">
                    <i className={`icon ${item.icon}`} />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="herbavi-pdp-extra herbavi-pdp-extra--modern">
          <div className="herbavi-pdp-extra-card">
            <h2 className="herbavi-pdp-extra-title font-instrument_serif">Helps with</h2>
            <p className="herbavi-pdp-extra-text font-geist">
              Supports daily wellness rituals with natural botanical actives chosen for balance,
              nourishment, and long-term skin health.
            </p>
          </div>
          <div className="herbavi-pdp-extra-card">
            <h2 className="herbavi-pdp-extra-title font-instrument_serif">Suitable for</h2>
            <p className="herbavi-pdp-extra-text font-geist">
              Ideal for all skin types seeking gentle, heritage-inspired care rooted in Ayurveda and
              Siddha traditions.
            </p>
          </div>
          <div className="herbavi-pdp-extra-card">
            <h2 className="herbavi-pdp-extra-title font-instrument_serif">Why Herbavi</h2>
            <p className="herbavi-pdp-extra-text font-geist">
              Crafted with authentic principles, quality-checked batches, and transparent ingredient
              sourcing you can trust.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
