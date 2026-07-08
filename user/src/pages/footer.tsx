import { Link } from 'react-router-dom';

interface FooterProps {
  showFeatures?: boolean;
}

export default function Footer({ showFeatures = false }: FooterProps) {
  return (
    <footer className="tf-footer footer-v4 herbavi-footer font-geist">
      {showFeatures && (
        <div className="flat-spacing-3">
          <div className="container">
            <div
              dir="ltr"
              className="swiper tf-swiper"
              data-preview="4"
              data-tablet="3"
              data-mobile-sm="2"
              data-mobile="1"
              data-space-lg="32"
              data-space-md="16"
              data-space="16"
              data-pagination="1"
              data-pagination-sm="2"
              data-pagination-md="3"
              data-pagination-lg="4"
            >
              <div className="swiper-wrapper text-white">
                <div className="swiper-slide">
                  <div className="box-icon_V01 style-3 wow fadeInUp" data-wow-delay="0s">
                    <span className="icon cl-text-12">
                      <i className="icon-FingerPrint"></i>
                    </span>
                    <div className="content">
                      <p className="title font-anton text-28-34 text-white letter-space--3">SECURE CHECKOUT</p>
                      <p className="desc font-geist lh-22 text-white letter-space--3">
                        Your data is always protected.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="swiper-slide">
                  <div className="box-icon_V01 style-3 wow fadeInUp" data-wow-delay="0.1s">
                    <span className="icon cl-text-12">
                      <i className="icon-Box"></i>
                    </span>
                    <div className="content">
                      <p className="title font-anton text-28-34 text-white letter-space--3">FREE RETURNS</p>
                      <p className="desc font-geist lh-22 text-white letter-space--3">
                        30-day money-back guarantee.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="swiper-slide">
                  <div className="box-icon_V01 style-3 wow fadeInUp" data-wow-delay="0.2s">
                    <span className="icon cl-text-12">
                      <i className="icon-Leaf"></i>
                    </span>
                    <div className="content">
                      <p className="title font-anton text-28-34 text-white letter-space--3">ECO PACKAGING</p>
                      <p className="desc font-geist lh-22 text-white letter-space--3">
                        Sustainably designed bottles.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="swiper-slide">
                  <div className="box-icon_V01 style-3 wow fadeInUp" data-wow-delay="0.3s">
                    <span className="icon cl-text-12">
                      <i className="icon-StarSroke"></i>
                    </span>
                    <div className="content">
                      <p className="title font-anton text-28-34 text-white letter-space--3">10,000+ REVIEWS</p>
                      <p className="desc font-geist lh-22 text-white letter-space--3">
                        Trusted by glow-seekers worldwide.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="sw-line-default style-3 tf-sw-pagination"></div>
            </div>
          </div>
        </div>
      )}

      <div className="footer_wrap flat-spacing-4 pb-0">
        <div className="infiniteSlide-footer-text">
          <p className="text-display-xl font-anton text-uppercase text-center mb-0 px-3">
            Smart skincare, powered by science & nature.
          </p>
        </div>
        <div className="footer-inner">
          <div className="container-2">
            <div className="footer-inner_wrap">
              <div className="footer-col-block footer-wrap-1">
                <p className="footer-heading footer-heading-mobile h6 font-anton letter-space--3">CALL US</p>
                <div className="tf-collapse-content">
                  <ul className="footer-menu-list letter-space--3">
                    <li>
                      <a href="tel:+18005552390" className="cl-text-main link">
                        +1 (800) 555-2390
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="footer-col-block footer-wrap-2">
                <p className="footer-heading footer-heading-mobile h6 font-anton letter-space--3">EMAIL</p>
                <div className="tf-collapse-content">
                  <ul className="footer-menu-list letter-space--3">
                    <li>
                      <a href="mailto:support@glowlyskin.com" className="cl-text-main link">
                        Support@glowlyskin.com
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="footer-col-block footer-wrap-3">
                <p className="footer-heading footer-heading-mobile h6 font-anton letter-space--3">SHOP</p>
                <div className="tf-collapse-content">
                  <ul className="footer-menu-list letter-space--3">
                    <li>
                      <Link to="/products" className="cl-text-main link">
                        Shop All
                      </Link>
                    </li>
                    <li>
                      <Link to="/products" className="cl-text-main link">
                        Best Sellers
                      </Link>
                    </li>
                    <li>
                      <Link to="/products" className="cl-text-main link">
                        New Arrivals
                      </Link>
                    </li>
                    <li>
                      <Link to="/products" className="cl-text-main link">
                        Bundles & Savings
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="footer-col-block footer-wrap-4">
                <p className="footer-heading footer-heading-mobile h6 font-anton letter-space--3">HELP</p>
                <div className="tf-collapse-content">
                  <ul className="footer-menu-list letter-space--3">
                    <li>
                      <a href="#" className="cl-text-main link">
                        Contact Us
                      </a>
                    </li>
                    <li>
                      <a href="#" className="cl-text-main link">
                        Shipping & Returns
                      </a>
                    </li>
                    <li>
                      <Link to="/faq" className="cl-text-main link">
                        FAQ
                      </Link>
                    </li>
                    <li>
                      <a href="#" className="cl-text-main link">
                        Privacy Policy
                      </a>
                    </li>
                    <li>
                      <a href="#" className="cl-text-main link">
                        Terms & Conditions
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="container-2">
            <div className="br-line bg-line-2"></div>
            <div className="footer-bottom_wrap">
              <ul className="tf-list gap-16">
                <li>
                  <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" className="link fs-24">
                    <i className="icon icon-FacebookFill"></i>
                  </a>
                </li>
                <li>
                  <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" className="link fs-24">
                    <i className="icon icon-InstagramFill"></i>
                  </a>
                </li>
                <li>
                  <a href="https://x.com/" target="_blank" rel="noreferrer" className="link fs-24">
                    <i className="icon icon-ThreadFill"></i>
                  </a>
                </li>
                <li>
                  <a href="https://www.threads.com/" target="_blank" rel="noreferrer" className="link fs-24">
                    <i className="icon icon-YoutubeFill"></i>
                  </a>
                </li>
                <li>
                  <a href="https://www.tiktok.com/" target="_blank" rel="noreferrer" className="link fs-24">
                    <i className="icon icon-TiktokFill"></i>
                  </a>
                </li>
              </ul>
              <div className="ft-text-nocopy font-geist text-uppercase fw-medium lh-22 letter-space--3">
                © 2026 Herbavi. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
