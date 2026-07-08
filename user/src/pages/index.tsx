import { Link } from 'react-router-dom';
import { assetUrl } from '../utils/assets.ts';

export default function Index () {

    return (

        <>
        <div className="tf-hero-banner-v3">
  <div className="hero-image">
    <img loading="lazy" width="1920" height="938" src={assetUrl('assets/images/herbavi-imgs/ayurvedhic-img.png')} alt="Image" />
  </div>
  <div className="hero-content">
    <div className="container">
      <div className="hero-content_inner wow fadeInUp">
        <div className="hero__tag font-geist fw-medium text-third lh-22">
          HIGH-PERFORMANCE SKINCARE
        </div>
        <p className="text-display-xl font-anton letter-space--3 text-third">
          SERIOUS CARE
          <br />
          SLEEK RESULTS
        </p>
        <p className="hero__desc font-geist text-body-l letter-space--3 text-third">
          Potent actives, clean formulas, clinically proven radiance.
        </p>
        <Link to="/products" className="tf-btn style-2 btn-light-2 py-xl-24">
          <i className="icon icon-Sparkle" />
          <span className="fw-bold font-geist letter-space--3">
            Shop Best Sellers
          </span>
        </Link>
      </div>
      {/* <div class="hero-content_bottom wow fadeInUp">
                        <div class="hero__author letter-space--3">
                            <p class="author-title font-geist fw-medium lh-22">
                                FORMULATED WITH
                            </p>
                            <p class="author-name font-anton text-28-34">
                                PURE ACTIVES
                            </p>
                        </div>
                        <div class="hero__author letter-space--3">
                            <p class="author-title font-geist fw-medium lh-22">
                                DAILY RITUAL
                            </p>
                            <p class="author-name font-anton text-28-34">
                                MAXIMUM GLOW
                            </p>
                        </div>
                        <div class="hero__author letter-space--3">
                            <p class="author-title font-geist fw-medium lh-22">
                                NO COMPROMISE
                            </p>
                            <p class="author-name font-anton text-28-34">
                                CLEAN BEAUTY
                            </p>
                        </div>
                    </div> */}
    </div>
  </div>
</div>
<section className="about">
  <div className="about-grid">
    <div className="about-visual">
      <div className="visual-frame">
        <img src={assetUrl('assets/images/herbavi-imgs/ayurvedhic-img-1.webp')} alt="Ayurvedic herbs and oils" />
      </div>
      <div className="ingredient-card">
        <div className="label">
          Heritage
        </div>
        <div className="value">
          5,000+
        </div>
        <div className="desc">
          years of Ayurvedic skincare wisdom behind every formula
        </div>
      </div>
    </div>
    <div className="about-text">
      <p className="eyebrow-label herbavi-eyebrow">
        <span className="herbavi-br-dot" aria-hidden="true" />
        <span className="eyebrow-text">Our story</span>
      </p>
      <h2 className="about-heading">
        Rooted in ritual,
        <br />
        <em>
          refined
        </em>
        by science
      </h2>
      <p className="about-copy">
        Herbavi began with a simple question: why should ancient plant wisdom and modern dermatology be treated as opposites? We didn't think they should be — so we built a line that honors both.
      </p>
      <p className="about-copy">
        Every formula starts with botanicals used in Ayurvedic practice for centuries, then goes through clinical testing to confirm what tradition already knew. The result is skincare that feels intentional, not improvised.
      </p>
      <div className="ingredient-rail">
        <div className="ingredient-pill">
          <span className="swatch neem">
            Neem
          </span>
        </div>
        <div className="ingredient-pill">
          <span className="swatch turmeric">
            Turmeric
          </span>
        </div>
        <div className="ingredient-pill">
          <span className="swatch ashwagandha">
            Ashwagandha
          </span>
        </div>
        <div className="ingredient-pill">
          <span className="swatch bhringraj">
            Bhringraj
          </span>
        </div>
      </div>
      <a href="#philosophy" className="about-cta">
        Read our philosophy
      </a>
      <div className="stats-row">
        <div className="stat">
          <div className="stat-num">
            120+
          </div>
          <div className="stat-label">
            small-batch farms
          </div>
        </div>
        <div className="stat">
          <div className="stat-num">
            0%
          </div>
          <div className="stat-label">
            synthetic fillers
          </div>
        </div>
        <div className="stat">
          <div className="stat-num">
            40k+
          </div>
          <div className="stat-label">
            happy customers
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
<div className="section-split section-ingredient-2">
  <div className="col-content bg-main_100 justify-content-start">
    <div className="sect-heading-v2 start sticky-top m-0 wow fadeInUp herbavi-ingredients-heading">
      <p className="eyebrow-label herbavi-eyebrow">
        <span className="herbavi-br-dot" aria-hidden="true" />
        <span className="eyebrow-text">Our ingredients</span>
      </p>
      <h4 className="s-title font-instrument_serif lh-xxl-48">
        “We select ingredients for their integrity and balance — combining proven actives with gentle,
                        skin-supportive elements. Each formula is composed to strengthen, restore, and quietly enhance
                        your natural glow.”
      </h4>
    </div>
  </div>
  <div className="col-media">
    <div className="wg-ingredient">
      <h5 className="ing-title font-instrument_serif text-white lh-xl-40 wow fadeInUp">
        Niacinamide
      </h5>
      <div className="ing-image">
        <img className="wow fadeZoomOut" loading="lazy" width="280" height="280" src="assets/images/section/ingredient-1.jpg" alt="Image" />
      </div>
      <p className="ing-desc text-white wow fadeInUp">
        A multitasking active known to refine pores, balance oil production, and visibly improve skin
        <br className="d-none d-xxl-block" />
        clarity — without disrupting the barrier.
      </p>
    </div>
    <div className="wg-ingredient">
      <h5 className="ing-title font-instrument_serif text-white lh-xl-40 wow fadeInUp">
        Peptides
      </h5>
      <div className="ing-image">
        <img className="wow fadeZoomOut" loading="lazy" width="280" height="280" src="assets/images/section/ingredient-2.jpg" alt="Image" />
      </div>
      <p className="ing-desc text-white wow fadeInUp">
        Support skin resilience and elasticity with targeted peptide complexes designed to promote
                        smoother,
        <br className="d-none d-xxl-block" />
        firmer-looking skin over time.
      </p>
    </div>
    <div className="wg-ingredient">
      <h5 className="ing-title font-instrument_serif text-white lh-xl-40 wow fadeInUp">
        Niacinamide
      </h5>
      <div className="ing-image">
        <img className="wow fadeZoomOut" loading="lazy" width="280" height="280" src="assets/images/section/ingredient-1.jpg" alt="Image" />
      </div>
      <p className="ing-desc text-white wow fadeInUp">
        A multitasking active known to refine pores, balance oil production, and visibly improve skin
        <br className="d-none d-xxl-block" />
        clarity — without disrupting the barrier.
      </p>
    </div>
  </div>
</div>
{/* Science */}
<div className="section-science flat-spacing bg-main">
  <div className="container">
    <div className="sect-heading-v2 space-1">
      <p className="eyebrow-label">
        <span className="br-dot" />
        CLEAN BEAUTY PHILOSOPHY
      </p>
      <h3 className="s-title font-instrument_serif">
        Nature Meets Science
      </h3>
      <p className="s-desc cl-text-5">
        We believe in the power of natural ingredients, enhanced by cutting-edge
        <br className="d-none d-sm-block" />
        research to deliver results you can see and feel.
      </p>
    </div>
    <div dir="ltr" className="swiper tf-swiper swiper-box-icon" data-preview="4" data-tablet="3" data-mobile-sm="2" data-mobile="1" data-space-lg="24" data-space-md="20" data-space="16" data-pagination="1" data-pagination-sm="2" data-pagination-md="3" data-pagination-lg="4">
      <div className="swiper-wrapper">
        {/* slide 1 */}
        <div className="swiper-slide">
          <div className="box-icon_V02">
            <span className="ic-wrap">
              <i className="icon icon-RecycleLeaf" />
            </span>
            <a href="#" className="title h6 font-instrument_serif link-underline">
              Botanical Extracts
            </a>
            <p className="desc cl-text-5">
              Sourced from organic farms across the globe, our plant-based ingredients nourish
                                    your skin naturally.
            </p>
          </div>
        </div>
        {/* slide 2 */}
        <div className="swiper-slide">
          <div className="box-icon_V02">
            <span className="ic-wrap">
              <i className="icon icon-WaterDropLeaf" />
            </span>
            <a href="#" className="title h6 font-instrument_serif link-underline">
              Hyaluronic Acid
            </a>
            <p className="desc cl-text-5">
              Deep hydration that plumps and smooths, leaving your skin feeling refreshed and
                                    renewed.
            </p>
          </div>
        </div>
        {/* slide 3 */}
        <div className="swiper-slide">
          <div className="box-icon_V02">
            <span className="ic-wrap">
              <i className="icon icon-PainKiller" />
            </span>
            <a href="#" className="title h6 font-instrument_serif link-underline">
              Vitamin C Complex
            </a>
            <p className="desc cl-text-5">
              Powerful antioxidants that brighten and protect against environmental stressors.
            </p>
          </div>
        </div>
        {/* slide 4 */}
        <div className="swiper-slide">
          <div className="box-icon_V02">
            <span className="ic-wrap">
              <i className="icon icon-DNA" />
            </span>
            <a href="#" className="title h6 font-instrument_serif link-underline">
              Peptide Technology
            </a>
            <p className="desc cl-text-5">
              Advanced formulas that support collagen production for firmer, more youthful skin.
            </p>
          </div>
        </div>
      </div>
      <div className="sw-line-default tf-sw-pagination" />
    </div>
    <ul className="tf-list fw-normal justify-content-center">
      <li>
        <i className="icon icon-CheckCircleFill" />
        Cruelty-Free
      </li>
      <li>
        <i className="icon icon-CheckCircleFill" />
        Vegan Friendly
      </li>
      <li>
        <i className="icon icon-CheckCircleFill" />
        Paraben-Free
      </li>
      <li>
        <i className="icon icon-CheckCircleFill" />
        Sustainably Sourced
      </li>
    </ul>
  </div>
</div>
{/* /Science */}
{/* Counter */}
<div className="flat-spacing-4 pb-0">
  <div className="container">
    <div dir="ltr" className="swiper tf-swiper wrap-sw-over" data-preview="3" data-tablet="2" data-mobile-sm="2" data-mobile="1" data-space-lg="64" data-space-md="16" data-space="16" data-pagination="1" data-pagination-sm="2" data-pagination-md="2" data-pagination-lg="3">
      <div className="swiper-wrapper">
        {/* slide 1 */}
        <div className="swiper-slide">
          <div className="wg-counter wow fadeInUp">
            <div className="title h1 letter-space--2 font-anton view-counter">
              <span className="number" data-to="1" data-speed="1000">
                0
              </span>
              M+
            </div>
            <p className="sub font-geist fw-medium letter-space--3">
              COMMUNITY MEMBERS
            </p>
            <p className="desc font-geist cl-text-5 letter-space--3">
              A global network of glow seekers.
            </p>
          </div>
        </div>
        {/* slide 2 */}
        <div className="swiper-slide">
          <div className="wg-counter wow fadeInUp">
            <div className="title h1 letter-space--2 font-anton view-counter">
              <span className="number" data-to="97" data-speed="1000">
                0
              </span>
              %
            </div>
            <p className="sub font-geist fw-medium letter-space--3">
              USERS SATISFIED
            </p>
            <p className="desc font-geist cl-text-5 letter-space--3">
              Smoother skin and better texture.
            </p>
          </div>
        </div>
        {/* slide 3 */}
        <div className="swiper-slide">
          <div className="wg-counter wow fadeInUp">
            <div className="title h1 letter-space--2 font-anton view-counter">
              <span className="number" data-to="10" data-speed="1000">
                0
              </span>
              X
            </div>
            <p className="sub font-geist fw-medium letter-space--3">
              MODERN GLOW
            </p>
            <p className="desc font-geist cl-text-5 letter-space--3">
              Advanced actives for next-gen beauty.
            </p>
          </div>
        </div>
      </div>
      <div className="sw-line-default tf-sw-pagination" />
    </div>
  </div>
</div>
{/* /Counter */}
{/* Tab Product */}
<div className="flat-spacing-3 flat-animate-tab">
  <div className="container">
    <div className="sect-heading-v2 space-1 space-inner-1 wow fadeInUp">
      <div className="badge-pill">
        <span className="font-geist fw-medium lh-22 letter-space--3">
          Shop What Works
        </span>
      </div>
      <h2 className="font-anton text-uppercase letter-space--2">
        From our newest drops to
        <br />
        all-time best sellers.
      </h2>
    </div>
    <ul className="list-tab-btn-1 style-2 justify-content-center spacing-bottom-3 wow fadeInUp" role="tablist">
      <li className="nav-tab-item" role="presentation">
        <a href="#tabPrd1" data-bs-toggle="tab" className="tf-btn-tab active" role="tab">
          <span className="font-geist text-body-l lh-24 fw-bold letter-space--3">
            NEW IN
          </span>
        </a>
      </li>
      <li className="nav-tab-item" role="presentation">
        <a href="#tabPrd2" data-bs-toggle="tab" className="tf-btn-tab" role="tab">
          <span className="font-geist text-body-l lh-24 fw-bold letter-space--3">
            BEST SELLERS
          </span>
        </a>
      </li>
      <li className="nav-tab-item" role="presentation">
        <a href="#tabPrd3" data-bs-toggle="tab" className="tf-btn-tab" role="tab">
          <span className="font-geist text-body-l lh-24 fw-bold letter-space--3">
            EDITOR'S PICKS
          </span>
        </a>
      </li>
    </ul>
    <div className="tab-content">
      <div className="tab-pane active show" id="tabPrd1" role="tabpanel">
        <div className="tf-btn-swiper-main">
          <div dir="ltr" className="swiper tf-swiper swiper-type-scrollbar mb-20" data-preview="4" data-tablet="3" data-mobile-sm="2" data-mobile="2" data-space-lg="24" data-space-md="24" data-space="16" data-pagination="2" data-pagination-sm="2" data-pagination-md="3" data-pagination-lg="4">
            <div className="swiper-wrapper">
              {/* slide 1 */}
              <div className="swiper-slide">
                <div className="card-product card-s3 wow fadeInUp" data-wow-delay="0s">
                  <div className="card-product_wrapper size-38d45">
                    <Link to="/product-detail" className="product-img">
                      <img className="img-product" loading="lazy" width="348" height="420" src="assets/images/product/product-18.jpg" alt="Product" />
                    </Link>
                    <ul className="product-badge_list">
                      <li className="product-badge_item text-body-s new">
                        New
                      </li>
                    </ul>
                    <ul className="product-action_list">
                      <li>
                        <a href="#modalQuickView" data-bs-toggle="modal" className="hover-tooltip tooltip-left box-icon">
                          <span className="icon icon-EyeOpen" />
                          <span className="tooltip">
                            Quick view
                          </span>
                        </a>
                      </li>
                      <li className="wishlist">
                        <a href="#;" className="hover-tooltip tooltip-left box-icon">
                          <span className="icon icon-Hearth" />
                          <span className="tooltip">
                            Add to Wishlist
                          </span>
                        </a>
                      </li>
                      <li className="compare">
                        <a href="#compare" data-bs-toggle="offcanvas" className="hover-tooltip tooltip-left box-icon">
                          <span className="icon icon-Compare" />
                          <span className="tooltip">
                            Compare
                          </span>
                        </a>
                      </li>
                    </ul>
                    <div className="product-action_bot">
                      <a href="#shoppingCart" data-bs-toggle="offcanvas" className="btn-action_add tf-btn hv-black btn-white type-2 w-100">
                        <i className="icon icon-ShoppingCart" />
                        Add to cart
                      </a>
                      <a href="#" className="box-icon btn-open_action xl-d-none">
                        <span className="icon icon-Plus" />
                        <span className="icon icon-Minus" />
                      </a>
                    </div>
                  </div>
                  <div className="card-product_info font-geist gap-8">
                    <div className="product-info__rate">
                      <div className="star-wrap fs-14">
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                      </div>
                    </div>
                    <Link to="/product-detail" className="name-product lh-22 fw-medium link-underline text-uppercase justify-content-center">
                      Hydra Shine Lip Gloss
                    </Link>
                    <p className="product-info__desc fw-normal text-body-s lh-18 cl-text-5">
                      Infused with Vitamin E for smooth lips.
                    </p>
                    <span className="product-info__price lh-22 fw-medium">
                      $38.00
                    </span>
                  </div>
                </div>
              </div>
              {/* slide 2 */}
              <div className="swiper-slide">
                <div className="card-product card-s3 wow fadeInUp" data-wow-delay="0.1s">
                  <div className="card-product_wrapper size-38d45">
                    <Link to="/product-detail" className="product-img">
                      <img className="img-product" loading="lazy" width="348" height="420" src="assets/images/product/product-15.jpg" alt="Product" />
                    </Link>
                    <ul className="product-action_list">
                      <li>
                        <a href="#modalQuickView" data-bs-toggle="modal" className="hover-tooltip tooltip-left box-icon">
                          <span className="icon icon-EyeOpen" />
                          <span className="tooltip">
                            Quick view
                          </span>
                        </a>
                      </li>
                      <li className="wishlist">
                        <a href="#;" className="hover-tooltip tooltip-left box-icon">
                          <span className="icon icon-Hearth" />
                          <span className="tooltip">
                            Add to Wishlist
                          </span>
                        </a>
                      </li>
                      <li className="compare">
                        <a href="#compare" data-bs-toggle="offcanvas" className="hover-tooltip tooltip-left box-icon">
                          <span className="icon icon-Compare" />
                          <span className="tooltip">
                            Compare
                          </span>
                        </a>
                      </li>
                    </ul>
                    <div className="product-action_bot">
                      <a href="#shoppingCart" data-bs-toggle="offcanvas" className="btn-action_add tf-btn hv-black btn-white type-2 w-100">
                        <i className="icon icon-ShoppingCart" />
                        Add to cart
                      </a>
                      <a href="#" className="box-icon btn-open_action xl-d-none">
                        <span className="icon icon-Plus" />
                        <span className="icon icon-Minus" />
                      </a>
                    </div>
                  </div>
                  <div className="card-product_info font-geist gap-8">
                    <div className="product-info__rate">
                      <div className="star-wrap fs-14">
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                      </div>
                    </div>
                    <Link to="/product-detail" className="name-product lh-22 fw-medium link-underline text-uppercase justify-content-center">
                      Barrier Repair Cream
                    </Link>
                    <p className="product-info__desc fw-normal text-body-s lh-18 cl-text-5">
                      Clinically proven 24-hour hydration.
                    </p>
                    <span className="product-info__price lh-22 fw-medium">
                      $42.00
                    </span>
                  </div>
                </div>
              </div>
              {/* slide 3 */}
              <div className="swiper-slide">
                <div className="card-product card-s3 wow fadeInUp" data-wow-delay="0.2s">
                  <div className="card-product_wrapper size-38d45">
                    <Link to="/product-detail" className="product-img">
                      <img className="img-product" loading="lazy" width="348" height="420" src="assets/images/product/product-20.jpg" alt="Product" />
                    </Link>
                    <ul className="product-badge_list">
                      <li className="product-badge_item text-body-s new">
                        New
                      </li>
                    </ul>
                    <ul className="product-action_list">
                      <li>
                        <a href="#modalQuickView" data-bs-toggle="modal" className="hover-tooltip tooltip-left box-icon">
                          <span className="icon icon-EyeOpen" />
                          <span className="tooltip">
                            Quick view
                          </span>
                        </a>
                      </li>
                      <li className="wishlist">
                        <a href="#;" className="hover-tooltip tooltip-left box-icon">
                          <span className="icon icon-Hearth" />
                          <span className="tooltip">
                            Add to Wishlist
                          </span>
                        </a>
                      </li>
                      <li className="compare">
                        <a href="#compare" data-bs-toggle="offcanvas" className="hover-tooltip tooltip-left box-icon">
                          <span className="icon icon-Compare" />
                          <span className="tooltip">
                            Compare
                          </span>
                        </a>
                      </li>
                    </ul>
                    <div className="product-action_bot">
                      <a href="#shoppingCart" data-bs-toggle="offcanvas" className="btn-action_add tf-btn hv-black btn-white type-2 w-100">
                        <i className="icon icon-ShoppingCart" />
                        Add to cart
                      </a>
                      <a href="#" className="box-icon btn-open_action xl-d-none">
                        <span className="icon icon-Plus" />
                        <span className="icon icon-Minus" />
                      </a>
                    </div>
                  </div>
                  <div className="card-product_info font-geist gap-8">
                    <div className="product-info__rate">
                      <div className="star-wrap fs-14">
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                      </div>
                    </div>
                    <Link to="/product-detail" className="name-product lh-22 fw-medium link-underline text-uppercase justify-content-center">
                      LashLift Defining Mascara
                    </Link>
                    <p className="product-info__desc fw-normal text-body-s lh-18 cl-text-5">
                      Clinically tested. +92% saw longer.
                    </p>
                    <div className="price-wrap lh-22 fw-medium">
                      <span className="product-info__price text-primary">
                        $22.00
                      </span>
                      <span className="price-old cl-text-6">
                        $29.00
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* slide 4 */}
              <div className="swiper-slide">
                <div className="card-product card-s3 wow fadeInUp" data-wow-delay="0.3s">
                  <div className="card-product_wrapper size-38d45">
                    <Link to="/product-detail" className="product-img">
                      <img className="img-product" loading="lazy" width="348" height="420" src="assets/images/product/product-22.jpg" alt="Product" />
                    </Link>
                    <ul className="product-badge_list">
                      <li className="product-badge_item text-body-s new">
                        New
                      </li>
                    </ul>
                    <ul className="product-action_list">
                      <li>
                        <a href="#modalQuickView" data-bs-toggle="modal" className="hover-tooltip tooltip-left box-icon">
                          <span className="icon icon-EyeOpen" />
                          <span className="tooltip">
                            Quick view
                          </span>
                        </a>
                      </li>
                      <li className="wishlist">
                        <a href="#;" className="hover-tooltip tooltip-left box-icon">
                          <span className="icon icon-Hearth" />
                          <span className="tooltip">
                            Add to Wishlist
                          </span>
                        </a>
                      </li>
                      <li className="compare">
                        <a href="#compare" data-bs-toggle="offcanvas" className="hover-tooltip tooltip-left box-icon">
                          <span className="icon icon-Compare" />
                          <span className="tooltip">
                            Compare
                          </span>
                        </a>
                      </li>
                    </ul>
                    <div className="product-action_bot">
                      <a href="#shoppingCart" data-bs-toggle="offcanvas" className="btn-action_add tf-btn hv-black btn-white type-2 w-100">
                        <i className="icon icon-ShoppingCart" />
                        Add to cart
                      </a>
                      <a href="#" className="box-icon btn-open_action xl-d-none">
                        <span className="icon icon-Plus" />
                        <span className="icon icon-Minus" />
                      </a>
                    </div>
                  </div>
                  <div className="card-product_info font-geist gap-8">
                    <div className="product-info__rate">
                      <div className="star-wrap fs-14">
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                      </div>
                    </div>
                    <Link to="/product-detail" className="name-product lh-22 fw-medium link-underline text-uppercase justify-content-center">
                      Niacinamide 5% + Zinc
                    </Link>
                    <p className="product-info__desc fw-normal text-body-s lh-18 cl-text-5">
                      Reduces breakouts by up to 90%.
                    </p>
                    <span className="product-info__price lh-22 fw-medium">
                      $26.00
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mb-20 d-xl-none">
            <div className="sw-scrollbar-default">
              <span className="tf-sw-scrollbar" />
            </div>
          </div>
        </div>
        <div className="text-center wow fadeInUp">
          <Link to="/products" className="tf-btn type-2 style-2 btn-stroke-black py-normal">
            <span className="fw-bold font-geist letter-space--3">
              VIEW ALL
            </span>
            <i className="icon icon-ArrowRight" />
          </Link>
        </div>
      </div>
      <div className="tab-pane" id="tabPrd2" role="tabpanel">
        <div className="tf-btn-swiper-main">
          <div dir="ltr" className="swiper tf-swiper swiper-type-scrollbar mb-20" data-preview="4" data-tablet="3" data-mobile-sm="2" data-mobile="2" data-space-lg="24" data-space-md="24" data-space="16" data-pagination="2" data-pagination-sm="2" data-pagination-md="3" data-pagination-lg="4">
            <div className="swiper-wrapper">
              {/* slide 1 */}
              <div className="swiper-slide">
                <div className="card-product card-s3 wow fadeInUp" data-wow-delay="0s">
                  <div className="card-product_wrapper size-38d45">
                    <Link to="/product-detail" className="product-img">
                      <img className="img-product" loading="lazy" width="348" height="420" src="assets/images/product/product-18.jpg" alt="Product" />
                    </Link>
                    <ul className="product-badge_list">
                      <li className="product-badge_item text-body-s new">
                        New
                      </li>
                    </ul>
                    <ul className="product-action_list">
                      <li>
                        <a href="#modalQuickView" data-bs-toggle="modal" className="hover-tooltip tooltip-left box-icon">
                          <span className="icon icon-EyeOpen" />
                          <span className="tooltip">
                            Quick view
                          </span>
                        </a>
                      </li>
                      <li className="wishlist">
                        <a href="#;" className="hover-tooltip tooltip-left box-icon">
                          <span className="icon icon-Hearth" />
                          <span className="tooltip">
                            Add to Wishlist
                          </span>
                        </a>
                      </li>
                      <li className="compare">
                        <a href="#compare" data-bs-toggle="offcanvas" className="hover-tooltip tooltip-left box-icon">
                          <span className="icon icon-Compare" />
                          <span className="tooltip">
                            Compare
                          </span>
                        </a>
                      </li>
                    </ul>
                    <div className="product-action_bot">
                      <a href="#shoppingCart" data-bs-toggle="offcanvas" className="btn-action_add tf-btn hv-black btn-white type-2 w-100">
                        <i className="icon icon-ShoppingCart" />
                        Add to cart
                      </a>
                      <a href="#" className="box-icon btn-open_action xl-d-none">
                        <span className="icon icon-Plus" />
                        <span className="icon icon-Minus" />
                      </a>
                    </div>
                  </div>
                  <div className="card-product_info font-geist gap-8">
                    <div className="product-info__rate">
                      <div className="star-wrap fs-14">
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                      </div>
                    </div>
                    <Link to="/product-detail" className="name-product lh-22 fw-medium link-underline text-uppercase justify-content-center">
                      Hydra Shine Lip Gloss
                    </Link>
                    <p className="product-info__desc fw-normal text-body-s lh-18 cl-text-5">
                      Infused with Vitamin E for smooth lips.
                    </p>
                    <span className="product-info__price lh-22 fw-medium">
                      $38.00
                    </span>
                  </div>
                </div>
              </div>
              {/* slide 2 */}
              <div className="swiper-slide">
                <div className="card-product card-s3 wow fadeInUp" data-wow-delay="0.1s">
                  <div className="card-product_wrapper size-38d45">
                    <Link to="/product-detail" className="product-img">
                      <img className="img-product" loading="lazy" width="348" height="420" src="assets/images/product/product-15.jpg" alt="Product" />
                    </Link>
                    <ul className="product-action_list">
                      <li>
                        <a href="#modalQuickView" data-bs-toggle="modal" className="hover-tooltip tooltip-left box-icon">
                          <span className="icon icon-EyeOpen" />
                          <span className="tooltip">
                            Quick view
                          </span>
                        </a>
                      </li>
                      <li className="wishlist">
                        <a href="#;" className="hover-tooltip tooltip-left box-icon">
                          <span className="icon icon-Hearth" />
                          <span className="tooltip">
                            Add to Wishlist
                          </span>
                        </a>
                      </li>
                      <li className="compare">
                        <a href="#compare" data-bs-toggle="offcanvas" className="hover-tooltip tooltip-left box-icon">
                          <span className="icon icon-Compare" />
                          <span className="tooltip">
                            Compare
                          </span>
                        </a>
                      </li>
                    </ul>
                    <div className="product-action_bot">
                      <a href="#shoppingCart" data-bs-toggle="offcanvas" className="btn-action_add tf-btn hv-black btn-white type-2 w-100">
                        <i className="icon icon-ShoppingCart" />
                        Add to cart
                      </a>
                      <a href="#" className="box-icon btn-open_action xl-d-none">
                        <span className="icon icon-Plus" />
                        <span className="icon icon-Minus" />
                      </a>
                    </div>
                  </div>
                  <div className="card-product_info font-geist gap-8">
                    <div className="product-info__rate">
                      <div className="star-wrap fs-14">
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                      </div>
                    </div>
                    <Link to="/product-detail" className="name-product lh-22 fw-medium link-underline text-uppercase justify-content-center">
                      Barrier Repair Cream
                    </Link>
                    <p className="product-info__desc fw-normal text-body-s lh-18 cl-text-5">
                      Clinically proven 24-hour hydration.
                    </p>
                    <span className="product-info__price lh-22 fw-medium">
                      $42.00
                    </span>
                  </div>
                </div>
              </div>
              {/* slide 3 */}
              <div className="swiper-slide">
                <div className="card-product card-s3 wow fadeInUp" data-wow-delay="0.2s">
                  <div className="card-product_wrapper size-38d45">
                    <Link to="/product-detail" className="product-img">
                      <img className="img-product" loading="lazy" width="348" height="420" src="assets/images/product/product-20.jpg" alt="Product" />
                    </Link>
                    <ul className="product-badge_list">
                      <li className="product-badge_item text-body-s new">
                        New
                      </li>
                    </ul>
                    <ul className="product-action_list">
                      <li>
                        <a href="#modalQuickView" data-bs-toggle="modal" className="hover-tooltip tooltip-left box-icon">
                          <span className="icon icon-EyeOpen" />
                          <span className="tooltip">
                            Quick view
                          </span>
                        </a>
                      </li>
                      <li className="wishlist">
                        <a href="#;" className="hover-tooltip tooltip-left box-icon">
                          <span className="icon icon-Hearth" />
                          <span className="tooltip">
                            Add to Wishlist
                          </span>
                        </a>
                      </li>
                      <li className="compare">
                        <a href="#compare" data-bs-toggle="offcanvas" className="hover-tooltip tooltip-left box-icon">
                          <span className="icon icon-Compare" />
                          <span className="tooltip">
                            Compare
                          </span>
                        </a>
                      </li>
                    </ul>
                    <div className="product-action_bot">
                      <a href="#shoppingCart" data-bs-toggle="offcanvas" className="btn-action_add tf-btn hv-black btn-white type-2 w-100">
                        <i className="icon icon-ShoppingCart" />
                        Add to cart
                      </a>
                      <a href="#" className="box-icon btn-open_action xl-d-none">
                        <span className="icon icon-Plus" />
                        <span className="icon icon-Minus" />
                      </a>
                    </div>
                  </div>
                  <div className="card-product_info font-geist gap-8">
                    <div className="product-info__rate">
                      <div className="star-wrap fs-14">
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                      </div>
                    </div>
                    <Link to="/product-detail" className="name-product lh-22 fw-medium link-underline text-uppercase justify-content-center">
                      LashLift Defining Mascara
                    </Link>
                    <p className="product-info__desc fw-normal text-body-s lh-18 cl-text-5">
                      Clinically tested. +92% saw longer.
                    </p>
                    <div className="price-wrap lh-22 fw-medium">
                      <span className="product-info__price text-primary">
                        $22.00
                      </span>
                      <span className="price-old cl-text-6">
                        $29.00
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* slide 4 */}
              <div className="swiper-slide">
                <div className="card-product card-s3 wow fadeInUp" data-wow-delay="0.3s">
                  <div className="card-product_wrapper size-38d45">
                    <Link to="/product-detail" className="product-img">
                      <img className="img-product" loading="lazy" width="348" height="420" src="assets/images/product/product-22.jpg" alt="Product" />
                    </Link>
                    <ul className="product-badge_list">
                      <li className="product-badge_item text-body-s new">
                        New
                      </li>
                    </ul>
                    <ul className="product-action_list">
                      <li>
                        <a href="#modalQuickView" data-bs-toggle="modal" className="hover-tooltip tooltip-left box-icon">
                          <span className="icon icon-EyeOpen" />
                          <span className="tooltip">
                            Quick view
                          </span>
                        </a>
                      </li>
                      <li className="wishlist">
                        <a href="#;" className="hover-tooltip tooltip-left box-icon">
                          <span className="icon icon-Hearth" />
                          <span className="tooltip">
                            Add to Wishlist
                          </span>
                        </a>
                      </li>
                      <li className="compare">
                        <a href="#compare" data-bs-toggle="offcanvas" className="hover-tooltip tooltip-left box-icon">
                          <span className="icon icon-Compare" />
                          <span className="tooltip">
                            Compare
                          </span>
                        </a>
                      </li>
                    </ul>
                    <div className="product-action_bot">
                      <a href="#shoppingCart" data-bs-toggle="offcanvas" className="btn-action_add tf-btn hv-black btn-white type-2 w-100">
                        <i className="icon icon-ShoppingCart" />
                        Add to cart
                      </a>
                      <a href="#" className="box-icon btn-open_action xl-d-none">
                        <span className="icon icon-Plus" />
                        <span className="icon icon-Minus" />
                      </a>
                    </div>
                  </div>
                  <div className="card-product_info font-geist gap-8">
                    <div className="product-info__rate">
                      <div className="star-wrap fs-14">
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                      </div>
                    </div>
                    <Link to="/product-detail" className="name-product lh-22 fw-medium link-underline text-uppercase justify-content-center">
                      Niacinamide 5% + Zinc
                    </Link>
                    <p className="product-info__desc fw-normal text-body-s lh-18 cl-text-5">
                      Reduces breakouts by up to 90%.
                    </p>
                    <span className="product-info__price lh-22 fw-medium">
                      $26.00
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mb-20 d-xl-none">
            <div className="sw-scrollbar-default">
              <span className="tf-sw-scrollbar" />
            </div>
          </div>
        </div>
        <div className="text-center wow fadeInUp">
          <Link to="/products" className="tf-btn type-2 style-2 btn-stroke-black py-normal">
            <span className="fw-bold font-geist letter-space--3">
              VIEW ALL
            </span>
            <i className="icon icon-ArrowRight" />
          </Link>
        </div>
      </div>
      <div className="tab-pane" id="tabPrd3" role="tabpanel">
        <div className="tf-btn-swiper-main">
          <div dir="ltr" className="swiper tf-swiper swiper-type-scrollbar mb-20" data-preview="4" data-tablet="3" data-mobile-sm="2" data-mobile="2" data-space-lg="24" data-space-md="24" data-space="16" data-pagination="2" data-pagination-sm="2" data-pagination-md="3" data-pagination-lg="4">
            <div className="swiper-wrapper">
              {/* slide 1 */}
              <div className="swiper-slide">
                <div className="card-product card-s3 wow fadeInUp" data-wow-delay="0s">
                  <div className="card-product_wrapper size-38d45">
                    <Link to="/product-detail" className="product-img">
                      <img className="img-product" loading="lazy" width="348" height="420" src="assets/images/product/product-18.jpg" alt="Product" />
                    </Link>
                    <ul className="product-badge_list">
                      <li className="product-badge_item text-body-s new">
                        New
                      </li>
                    </ul>
                    <ul className="product-action_list">
                      <li>
                        <a href="#modalQuickView" data-bs-toggle="modal" className="hover-tooltip tooltip-left box-icon">
                          <span className="icon icon-EyeOpen" />
                          <span className="tooltip">
                            Quick view
                          </span>
                        </a>
                      </li>
                      <li className="wishlist">
                        <a href="#;" className="hover-tooltip tooltip-left box-icon">
                          <span className="icon icon-Hearth" />
                          <span className="tooltip">
                            Add to Wishlist
                          </span>
                        </a>
                      </li>
                      <li className="compare">
                        <a href="#compare" data-bs-toggle="offcanvas" className="hover-tooltip tooltip-left box-icon">
                          <span className="icon icon-Compare" />
                          <span className="tooltip">
                            Compare
                          </span>
                        </a>
                      </li>
                    </ul>
                    <div className="product-action_bot">
                      <a href="#shoppingCart" data-bs-toggle="offcanvas" className="btn-action_add tf-btn hv-black btn-white type-2 w-100">
                        <i className="icon icon-ShoppingCart" />
                        Add to cart
                      </a>
                      <a href="#" className="box-icon btn-open_action xl-d-none">
                        <span className="icon icon-Plus" />
                        <span className="icon icon-Minus" />
                      </a>
                    </div>
                  </div>
                  <div className="card-product_info font-geist gap-8">
                    <div className="product-info__rate">
                      <div className="star-wrap fs-14">
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                      </div>
                    </div>
                    <Link to="/product-detail" className="name-product lh-22 fw-medium link-underline text-uppercase justify-content-center">
                      Hydra Shine Lip Gloss
                    </Link>
                    <p className="product-info__desc fw-normal text-body-s lh-18 cl-text-5">
                      Infused with Vitamin E for smooth lips.
                    </p>
                    <span className="product-info__price lh-22 fw-medium">
                      $38.00
                    </span>
                  </div>
                </div>
              </div>
              {/* slide 2 */}
              <div className="swiper-slide">
                <div className="card-product card-s3 wow fadeInUp" data-wow-delay="0.1s">
                  <div className="card-product_wrapper size-38d45">
                    <Link to="/product-detail" className="product-img">
                      <img className="img-product" loading="lazy" width="348" height="420" src="assets/images/product/product-15.jpg" alt="Product" />
                    </Link>
                    <ul className="product-action_list">
                      <li>
                        <a href="#modalQuickView" data-bs-toggle="modal" className="hover-tooltip tooltip-left box-icon">
                          <span className="icon icon-EyeOpen" />
                          <span className="tooltip">
                            Quick view
                          </span>
                        </a>
                      </li>
                      <li className="wishlist">
                        <a href="#;" className="hover-tooltip tooltip-left box-icon">
                          <span className="icon icon-Hearth" />
                          <span className="tooltip">
                            Add to Wishlist
                          </span>
                        </a>
                      </li>
                      <li className="compare">
                        <a href="#compare" data-bs-toggle="offcanvas" className="hover-tooltip tooltip-left box-icon">
                          <span className="icon icon-Compare" />
                          <span className="tooltip">
                            Compare
                          </span>
                        </a>
                      </li>
                    </ul>
                    <div className="product-action_bot">
                      <a href="#shoppingCart" data-bs-toggle="offcanvas" className="btn-action_add tf-btn hv-black btn-white type-2 w-100">
                        <i className="icon icon-ShoppingCart" />
                        Add to cart
                      </a>
                      <a href="#" className="box-icon btn-open_action xl-d-none">
                        <span className="icon icon-Plus" />
                        <span className="icon icon-Minus" />
                      </a>
                    </div>
                  </div>
                  <div className="card-product_info font-geist gap-8">
                    <div className="product-info__rate">
                      <div className="star-wrap fs-14">
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                      </div>
                    </div>
                    <Link to="/product-detail" className="name-product lh-22 fw-medium link-underline text-uppercase justify-content-center">
                      Barrier Repair Cream
                    </Link>
                    <p className="product-info__desc fw-normal text-body-s lh-18 cl-text-5">
                      Clinically proven 24-hour hydration.
                    </p>
                    <span className="product-info__price lh-22 fw-medium">
                      $42.00
                    </span>
                  </div>
                </div>
              </div>
              {/* slide 3 */}
              <div className="swiper-slide">
                <div className="card-product card-s3 wow fadeInUp" data-wow-delay="0.2s">
                  <div className="card-product_wrapper size-38d45">
                    <Link to="/product-detail" className="product-img">
                      <img className="img-product" loading="lazy" width="348" height="420" src="assets/images/product/product-20.jpg" alt="Product" />
                    </Link>
                    <ul className="product-badge_list">
                      <li className="product-badge_item text-body-s new">
                        New
                      </li>
                    </ul>
                    <ul className="product-action_list">
                      <li>
                        <a href="#modalQuickView" data-bs-toggle="modal" className="hover-tooltip tooltip-left box-icon">
                          <span className="icon icon-EyeOpen" />
                          <span className="tooltip">
                            Quick view
                          </span>
                        </a>
                      </li>
                      <li className="wishlist">
                        <a href="#;" className="hover-tooltip tooltip-left box-icon">
                          <span className="icon icon-Hearth" />
                          <span className="tooltip">
                            Add to Wishlist
                          </span>
                        </a>
                      </li>
                      <li className="compare">
                        <a href="#compare" data-bs-toggle="offcanvas" className="hover-tooltip tooltip-left box-icon">
                          <span className="icon icon-Compare" />
                          <span className="tooltip">
                            Compare
                          </span>
                        </a>
                      </li>
                    </ul>
                    <div className="product-action_bot">
                      <a href="#shoppingCart" data-bs-toggle="offcanvas" className="btn-action_add tf-btn hv-black btn-white type-2 w-100">
                        <i className="icon icon-ShoppingCart" />
                        Add to cart
                      </a>
                      <a href="#" className="box-icon btn-open_action xl-d-none">
                        <span className="icon icon-Plus" />
                        <span className="icon icon-Minus" />
                      </a>
                    </div>
                  </div>
                  <div className="card-product_info font-geist gap-8">
                    <div className="product-info__rate">
                      <div className="star-wrap fs-14">
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                      </div>
                    </div>
                    <Link to="/product-detail" className="name-product lh-22 fw-medium link-underline text-uppercase justify-content-center">
                      LashLift Defining Mascara
                    </Link>
                    <p className="product-info__desc fw-normal text-body-s lh-18 cl-text-5">
                      Clinically tested. +92% saw longer.
                    </p>
                    <div className="price-wrap lh-22 fw-medium">
                      <span className="product-info__price text-primary">
                        $22.00
                      </span>
                      <span className="price-old cl-text-6">
                        $29.00
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* slide 4 */}
              <div className="swiper-slide">
                <div className="card-product card-s3 wow fadeInUp" data-wow-delay="0.3s">
                  <div className="card-product_wrapper size-38d45">
                    <Link to="/product-detail" className="product-img">
                      <img className="img-product" loading="lazy" width="348" height="420" src="assets/images/product/product-22.jpg" alt="Product" />
                    </Link>
                    <ul className="product-badge_list">
                      <li className="product-badge_item text-body-s new">
                        New
                      </li>
                    </ul>
                    <ul className="product-action_list">
                      <li>
                        <a href="#modalQuickView" data-bs-toggle="modal" className="hover-tooltip tooltip-left box-icon">
                          <span className="icon icon-EyeOpen" />
                          <span className="tooltip">
                            Quick view
                          </span>
                        </a>
                      </li>
                      <li className="wishlist">
                        <a href="#;" className="hover-tooltip tooltip-left box-icon">
                          <span className="icon icon-Hearth" />
                          <span className="tooltip">
                            Add to Wishlist
                          </span>
                        </a>
                      </li>
                      <li className="compare">
                        <a href="#compare" data-bs-toggle="offcanvas" className="hover-tooltip tooltip-left box-icon">
                          <span className="icon icon-Compare" />
                          <span className="tooltip">
                            Compare
                          </span>
                        </a>
                      </li>
                    </ul>
                    <div className="product-action_bot">
                      <a href="#shoppingCart" data-bs-toggle="offcanvas" className="btn-action_add tf-btn hv-black btn-white type-2 w-100">
                        <i className="icon icon-ShoppingCart" />
                        Add to cart
                      </a>
                      <a href="#" className="box-icon btn-open_action xl-d-none">
                        <span className="icon icon-Plus" />
                        <span className="icon icon-Minus" />
                      </a>
                    </div>
                  </div>
                  <div className="card-product_info font-geist gap-8">
                    <div className="product-info__rate">
                      <div className="star-wrap fs-14">
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                        <i className="icon icon-Star-Sharp" />
                      </div>
                    </div>
                    <Link to="/product-detail" className="name-product lh-22 fw-medium link-underline text-uppercase justify-content-center">
                      Niacinamide 5% + Zinc
                    </Link>
                    <p className="product-info__desc fw-normal text-body-s lh-18 cl-text-5">
                      Reduces breakouts by up to 90%.
                    </p>
                    <span className="product-info__price lh-22 fw-medium">
                      $26.00
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mb-20 d-xl-none">
            <div className="sw-scrollbar-default">
              <span className="tf-sw-scrollbar" />
            </div>
          </div>
        </div>
        <div className="text-center wow fadeInUp">
          <Link to="/products" className="tf-btn type-2 style-2 btn-stroke-black py-normal">
            <span className="fw-bold font-geist letter-space--3">
              VIEW ALL
            </span>
            <i className="icon icon-ArrowRight" />
          </Link>
        </div>
      </div>
    </div>
  </div>
</div>
{/* /Tab Product */}
{/* Explore */}
<div className="section-banner-explore">
  <div className="bn-image overflow-hidden wow fadeIn">
    <img className="wow fadeZoomOut" loading="lazy" width="640" height="861" src="assets/images/section/goal-1.jpg" alt="Image" />
  </div>
  <div className="bn-content">
    <div className="sect-heading-v2 start space-1 space-inner-1 wow fadeInUp">
      <div className="badge-pill">
        <span className="font-geist fw-medium lh-22 letter-space--3">
          Target Your Skin Goals
        </span>
      </div>
      <h2 className="font-anton text-uppercase letter-space--2">
        Curated rituals
        <br className="d-none d-xxl-block" />
        for beauty that
        <br className="d-none d-xxl-block" />
        truly evolves.
      </h2>
      <Link to="/products" className="tf-btn type-2 style-2 btn-stroke-black py-normal">
        <span className="fw-bold font-geist letter-space--3">
          EXPLORE MORE
        </span>
        <i className="icon icon-ArrowRight" />
      </Link>
    </div>
    <ul className="tf-list vertical gap-8 list-explore wow fadeInUp">
      <li>
        <Link to="/products" className="explore-link">
          <p className="text text-28-34 font-anton letter-space--3">
            CLEAR & CALM
            <span className="text-body-m lh-22 font-geist fw-medium">
              (23)
            </span>
          </p>
          <i className="icon icon-ArrowRightUp" />
        </Link>
      </li>
      <li>
        <Link to="/products" className="explore-link">
          <p className="text text-28-34 font-anton letter-space--3">
            HYDRA BOOST
            <span className="text-body-m lh-22 font-geist fw-medium">
              (15)
            </span>
          </p>
          <i className="icon icon-ArrowRightUp" />
        </Link>
      </li>
      <li>
        <Link to="/products" className="explore-link">
          <p className="text text-28-34 font-anton letter-space--3">
            BRIGHT & EVEN
            <span className="text-body-m lh-22 font-geist fw-medium">
              (21)
            </span>
          </p>
          <i className="icon icon-ArrowRightUp" />
        </Link>
      </li>
      <li>
        <Link to="/products" className="explore-link">
          <p className="text text-28-34 font-anton letter-space--3">
            AGE-DEFY
            <span className="text-body-m lh-22 font-geist fw-medium">
              (34)
            </span>
          </p>
          <i className="icon icon-ArrowRightUp" />
        </Link>
      </li>
    </ul>
  </div>
  <div className="bn-image overflow-hidden wow fadeIn">
    <img className="wow fadeZoomOut" loading="lazy" width="640" height="861" src="assets/images/section/goal-2.jpg" alt="Image" />
  </div>
</div>
{/* /Explore */}
{/* Brand */}
<div className="flat-spacing-4">
  <div className="infiniteSlide-brand">
    <div className="infiniteSlide infiniteSlide-wrapper" data-clone="3">
      <div className="infiniteSlide-item">
        <div className="brand-logo">
          <img loading="lazy" width="158" height="40" src="assets/images/brand/brand-1.svg" alt="Image" />
        </div>
      </div>
      <div className="infiniteSlide-item">
        <div className="brand-logo">
          <img loading="lazy" width="146" height="40" src="assets/images/brand/brand-2.svg" alt="Image" />
        </div>
      </div>
      <div className="infiniteSlide-item">
        <div className="brand-logo">
          <img loading="lazy" width="134" height="40" src="assets/images/brand/brand-3.svg" alt="Image" />
        </div>
      </div>
      <div className="infiniteSlide-item">
        <div className="brand-logo">
          <img loading="lazy" width="122" height="40" src="assets/images/brand/brand-4.svg" alt="Image" />
        </div>
      </div>
      <div className="infiniteSlide-item">
        <div className="brand-logo">
          <img loading="lazy" width="165" height="40" src="assets/images/brand/brand-5.svg" alt="Image" />
        </div>
      </div>
      <div className="infiniteSlide-item">
        <div className="brand-logo">
          <img loading="lazy" width="166" height="40" src="assets/images/brand/brand-6.svg" alt="Image" />
        </div>
      </div>
      <div className="infiniteSlide-item">
        <div className="brand-logo">
          <img loading="lazy" width="148" height="40" src="assets/images/brand/brand-7.svg" alt="Image" />
        </div>
      </div>
      <div className="infiniteSlide-item">
        <div className="brand-logo">
          <img loading="lazy" width="169" height="40" src="assets/images/brand/brand-8.svg" alt="Image" />
        </div>
      </div>
      <div className="infiniteSlide-item">
        <div className="brand-logo">
          <img loading="lazy" width="140" height="40" src="assets/images/brand/brand-9.svg" alt="Image" />
        </div>
      </div>
    </div>
  </div>
</div>
        </>
    )

}