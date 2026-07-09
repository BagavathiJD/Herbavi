import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types/product.tsx';
import { useCart } from '../context/CartContext.tsx';
import { useQuickView } from '../context/QuickViewContext.tsx';
import { assetPath, displayPrice, getDiscountPercent, parsePriceAmount } from '../utils/format.tsx';

interface ProductCardProps {
  product: Product;
  layout?: 'grid' | 'list';
}

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

function ProductRating({ rating }: { rating: number }) {
  return (
    <div className="product-info__rate">
      <div className="star-wrap fs-12">
        {Array.from({ length: 5 }).map((_, index) => (
          <i
            key={index}
            className={`icon ${index < Math.floor(rating) ? 'icon-Star' : 'icon-StarSroke'}`}
          ></i>
        ))}
      </div>
      <span className="rate-number text-body-xs">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function ProductCard({ product, layout = 'grid' }: ProductCardProps) {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const { openQuickView } = useQuickView();
  const wished = isInWishlist(product.id);
  const isGrid = layout === 'grid';
  const cardClass = isGrid ? 'card-product grid' : 'card-product product-style_list';
  const actionListClass = isGrid ? 'product-action_list' : 'product-action_list style-2';
  const actionIconClass = isGrid ? 'hover-tooltip tooltip-left box-icon' : 'hover-tooltip box-icon';

  const handleAddToCart = (event: MouseEvent) => {
    event.preventDefault();
    addToCart(product);
    openCartPanel();
  };

  const handleWishlist = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickView = (event: MouseEvent) => {
    event.preventDefault();
    openQuickView(product);
  };

  const currentPriceLabel = displayPrice(product.priceDisplay, product.price);
  const originalAmount = product.oldPrice ? parsePriceAmount(product.oldPrice) : null;
  const originalPriceLabel =
    originalAmount != null ? displayPrice(product.oldPrice, originalAmount) : null;
  const discountPercent =
    originalAmount != null ? getDiscountPercent(product.price, originalAmount) : null;

  return (
    <div className={`${cardClass} herbavi-shop-card`} data-id={product.id} data-brand={product.brand}>
      <div className="card-product_wrapper herbavi-product-media-wrap">
        <div className="product-img herbavi-product-media">
          <img
            className="img-product"
            loading="lazy"
            decoding="async"
            src={assetPath(product.image)}
            alt={product.name}
          />
        </div>
        {product.badge && (
          <ul className="product-badge_list">
            <li className="product-badge_item text-body-s new">{product.badge}</li>
          </ul>
        )}
        {isGrid && (
          <ul className={`${actionListClass} herbavi-product-actions`}>
            <li>
              <a
                href="#modalQuickView"
                className={`${actionIconClass} herbavi-action-icon`}
                onClick={handleQuickView}
                aria-label="Quick view"
              >
                <span className="icon icon-EyeOpen"></span>
                <span className="tooltip">Quick view</span>
              </a>
            </li>
            <li className={`wishlist${wished ? ' addwishlist' : ''}`}>
              <a
                href="#;"
                className={`${actionIconClass} herbavi-action-icon`}
                onClick={handleWishlist}
                aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <span className={`icon ${wished ? 'icon-HearthFill' : 'icon-Hearth'}`}></span>
                <span className="tooltip">{wished ? 'Remove Wishlist' : 'Add to Wishlist'}</span>
              </a>
            </li>
          </ul>
        )}
        {isGrid && (
          <div className="product-action_bot herbavi-product-action-bot">
            <a
              href="#shoppingCart"
              className="tf-btn hv-black btn-white type-2 w-100 herbavi-add-cart-btn"
              onClick={handleAddToCart}
            >
              Add to cart
              <i className="icon icon-ShoppingCart"></i>
            </a>
          </div>
        )}
      </div>
      <div className={`card-product_info herbavi-product-info${isGrid ? ' start' : ''}`}>
        {!isGrid && <ProductRating rating={product.rating} />}
        <Link to={product.url} className="name-product herbavi-product-title link-underline">
          {product.name}
        </Link>
        <p className="product-card-desc herbavi-product-desc">{product.description}</p>
        <div className="price-wrap herbavi-product-pricing">
          <span className="price-new herbavi-product-price">{currentPriceLabel}</span>
          {originalPriceLabel && (
            <span className="price-old herbavi-product-price-old">{originalPriceLabel}</span>
          )}
          {discountPercent != null && (
            <span className="herbavi-product-discount">({discountPercent}% OFF)</span>
          )}
        </div>
        {layout === 'list' && (
          <ul className="product-action_list style-2">
            <li>
              <a href="#shoppingCart" className="hover-tooltip box-icon" onClick={handleAddToCart}>
                <span className="icon icon-ShoppingCart"></span>
                <span className="tooltip">Add to Cart</span>
              </a>
            </li>
            <li>
              <a href="#modalQuickView" className="hover-tooltip box-icon" onClick={handleQuickView}>
                <span className="icon icon-EyeOpen"></span>
                <span className="tooltip">Quick view</span>
              </a>
            </li>
            <li className={`wishlist${wished ? ' addwishlist' : ''}`}>
              <a href="#;" className="hover-tooltip box-icon" onClick={handleWishlist}>
                <span className={`icon ${wished ? 'icon-HearthFill' : 'icon-Hearth'}`}></span>
                <span className="tooltip">{wished ? 'Remove Wishlist' : 'Add to Wishlist'}</span>
              </a>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}
