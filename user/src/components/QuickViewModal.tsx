import { useCartActions } from '../hooks/useCartActions.ts';
import { useQuickView } from '../context/QuickViewContext.tsx';
import { assetUrl } from '../utils/assets.ts';

function openCartPanel() {
  const el = document.getElementById('shoppingCart');
  const bootstrap = (
    window as Window & {
      bootstrap?: {
        Offcanvas: { getOrCreateInstance: (el: HTMLElement) => { show: () => void } };
        Modal: { getInstance: (el: HTMLElement) => { hide: () => void } | null };
      };
    }
  ).bootstrap;

  const modalEl = document.getElementById('modalQuickView');
  if (modalEl && bootstrap?.Modal) {
    bootstrap.Modal.getInstance(modalEl)?.hide();
  }

  if (el && bootstrap?.Offcanvas) {
    bootstrap.Offcanvas.getOrCreateInstance(el).show();
  }
}

export default function QuickViewModal() {
  const { product } = useQuickView();
  const { addProductToCart } = useCartActions();

  if (!product) {
    return (
      <div className="modal modalCentered fade modal-quickview herbavi-quickview" id="modalQuickView" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content product-thumbs-slider"></div>
        </div>
      </div>
    );
  }

  const imageSrc = assetUrl(product.image);

  const handleAddToCart = () => {
    addProductToCart(product);
    openCartPanel();
  };

  return (
    <div className="modal modalCentered fade modal-quickview herbavi-quickview" id="modalQuickView" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content product-thumbs-slider">
          <div className="col-left">
            <div className="herbavi-quickview-image">
              <img loading="lazy" width={240} height={300} src={imageSrc} alt={product.name} />
            </div>
          </div>
          <div className="col-right">
            <i className="icon icon-Close btn-close-popup fs-24" data-bs-dismiss="modal"></i>
            <div className="tf-product-info-wrap position-relative mt-md-0 tf-quick-prd_variant">
              <div className="tf-product-info-list other-image-zoom">
                <div className="tf-product-info-heading">
                  <div className="product-infor-meta meta_rate">
                    <div className="star-wrap">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <i
                          key={index}
                          className={`icon ${index < Math.floor(product.rating) ? 'icon-Star-Sharp' : 'icon-StarSroke'}`}
                        ></i>
                      ))}
                    </div>
                    <span className="text-body-s cl-text-5">{product.rating.toFixed(1)}/5</span>
                  </div>
                  <h5 className="product-infor-name font-instrument_serif fw-normal">{product.name}</h5>
                  <div className="product-infor-price">
                    <div className="mb-4 d-flex align-items-center gap-6">
                      <span className="price-on-sale text-body-l fw-normal text-primary">{product.priceDisplay}</span>
                      {product.oldPrice && (
                        <span className="price-on-old text-body-l cl-text-6 text-decoration-line-through">
                          {product.oldPrice}
                        </span>
                      )}
                    </div>
                    <p className="text-body-xs cl-text-5">Shipping calculated at checkout.</p>
                  </div>
                </div>
                <div className="tf-product-info-actions">
                  <button type="button" className="tf-btn style-2 type-2 w-100" onClick={handleAddToCart}>
                    Add to cart
                    <i className="icon icon-ShoppingCart"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
