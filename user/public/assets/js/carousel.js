$(".tf-swiper").each(function (index, element) {
    var $this = $(element);
    var laptop = $this.data("laptop") || 1;
    var preview = $this.data("preview") || 1;
    var tablet = $this.data("tablet") || 1;
    var mobile = $this.data("mobile") || 1;
    var mobileSm = $this.data("mobile-sm") !== undefined ? $this.data("mobile-sm") : mobile;
    var mobileSsm = $this.data("mobile-ssm") !== undefined ? $this.data("mobile-ssm") : mobile;

    // Spacing
    var spacing = $this.data("space");
    var spacingMd = $this.data("space-md");
    var spacingLg = $this.data("space-lg");
    var spacingXxl = $this.data("space-xxl");

    if (spacing !== undefined && spacingMd === undefined && spacingLg === undefined) {
        spacingMd = spacing;
        spacingLg = spacing;
    } else if (spacing === undefined && spacingMd !== undefined && spacingLg === undefined) {
        spacing = 0;
        spacingLg = spacingMd;
    }
    spacing = spacing || 0;
    spacingMd = spacingMd || 0;
    spacingLg = spacingLg || 0;
    spacingXxl = spacingXxl || 1;

    var perGroup = $this.data("pagination") || 1;
    var perGroupSm = $this.data("pagination-sm") || 1;
    var perGroupMd = $this.data("pagination-md") || 1;
    var perGroupLg = $this.data("pagination-lg") || 1;
    var gridRows = $this.data("grid") || 1;
    var cursorType = $this.data("cursor") ?? false;
    var loop = $this.data("loop") ?? false;
    var loopMd = $this.data("loop-md") ?? false;
    var effect = $this.data("effect") || "slide";
    var atPlay = $this.data("auto"); // True || False
    var speed = $this.data("speed") || 800;
    var delay = $this.data("delay") || 1000;
    var direction = $this.data("direction") || "horizontal";
    var centered = $this.data("center") ?? false;
    var init = $this.data("init") || 0;
    var touch = $this.data("touch") ?? true;
    var pauseHover = $this.data("pause-hover") ?? true;
    var typePag = $this.data("type-pagination") ?? "bullets";
    var isNumberType = $this.hasClass("swiper-type-number");
    var isNumberType2 = $this.hasClass("swiper-type-number-2");

    var isScrollbarType = $this.hasClass("swiper-type-scrollbar");
    var scrollbarEl =
        $this.find(".tf-sw-scrollbar")[0] ||
        $this.closest(".tf-btn-swiper-main").find(".tf-sw-scrollbar")[0] ||
        $this.closest(".tf-pag-swiper").find(".tf-sw-scrollbar")[0];

    var scrollbarConfig = false;

    if (isScrollbarType && scrollbarEl) {
        scrollbarConfig = {
            el: scrollbarEl,
            draggable: true,
            dragSize: "auto",
        };
    }

    var circleProgress = $this.find(".sw-circle-prg")[0];
    var isCircleProgress = !!circleProgress;

    var paginationEl =
        $this.find(".tf-sw-pagination")[0] ||
        $this.closest(".tf-btn-swiper-main").find(".tf-sw-pagination")[0] ||
        $this.closest(".tf-pag-swiper").find(".tf-sw-pagination")[0];


    var currentNumberEl = $this.find(".current-number-slide")[0] ||
        $this.closest(".tf-btn-swiper-main").find(".current-number-slide")[0];

    var fractionEl = $this.closest(".tf-btn-swiper-main")
        .find(".thumbs-pagination")[0];

    var paginationConfig = false;

    var isNumberType2 = $this.hasClass("swiper-type-number-2");

    if (isNumberType && fractionEl) {
        paginationConfig = {
            el: fractionEl,
            type: "fraction",
            renderFraction: function (currentClass, totalClass) {
                return `
                <span class="${currentClass}"></span>
                <span class="swiper-slice"></span>
                <span class="${totalClass}"></span>
            `;
            },
        };

    } else if (isNumberType2 && paginationEl) {
        paginationConfig = {
            el: paginationEl,
            clickable: true,
            renderBullet: function (index, className) {
                return `<span class="${className}">${index + 1}</span>`;
            },
        };

    } else if (paginationEl && !isCircleProgress) {
        paginationConfig = {
            el: paginationEl,
            type: typePag,
            clickable: typePag === "bullets",
        };
    }

    var swiperT = new Swiper($this[0], {
        direction: direction,
        speed: speed,
        centeredSlides: centered,
        slidesPerView: mobile,
        spaceBetween: spacing,
        slidesPerGroup: perGroup,
        grabCursor: cursorType,
        loop: loop,
        effect: effect,
        initialSlide: init,
        touchStartPreventDefault: touch,
        noSwiping: true,
        noSwipingClass: 'no-swipe',
        autoplay: atPlay
            ? {
                delay: delay,
                disableOnInteraction: false,
                pauseOnMouseEnter: pauseHover,
            }
            : false,
        grid: {
            rows: gridRows,
            fill: "row",
        },
        scrollbar: scrollbarConfig,
        pagination: paginationConfig,
        observer: true,
        observeParents: true,
        navigation: {
            nextEl: [
                $this.find(".nav-next-swiper")[0],
                $this.closest(".tf-btn-swiper-main").find(".nav-next-swiper")[0],
                $this.closest(".box-swiper").find(".nav-next-swiper")[0],
                $this.closest(".container").find(".group-btn-slider .nav-next-swiper")[0],
            ],
            prevEl: [
                $this.find(".nav-prev-swiper")[0],
                $this.closest(".tf-btn-swiper-main").find(".nav-prev-swiper")[0],
                $this.closest(".box-swiper").find(".nav-prev-swiper")[0],
                $this.closest(".container").find(".group-btn-slider .nav-prev-swiper")[0],
            ],
        },
        breakpoints: {
            425: {
                slidesPerView: mobileSsm,
                spaceBetween: spacing,
                slidesPerGroup: perGroup,
                grid: {
                    rows: gridRows,
                    fill: "row",
                },
            },
            575: {
                slidesPerView: mobileSm,
                spaceBetween: spacing,
                slidesPerGroup: perGroupSm,
                grid: {
                    rows: gridRows,
                    fill: "row",
                },
            },
            768: {
                slidesPerView: tablet,
                spaceBetween: spacingMd,
                slidesPerGroup: perGroupMd,
                grid: {
                    rows: gridRows,
                    fill: "row",
                },
            },
            1200: {
                slidesPerView: preview,
                spaceBetween: spacingLg,
                slidesPerGroup: perGroupLg,
                grid: {
                    rows: gridRows,
                    fill: "row",
                },
            },
            1600: {
                slidesPerView: laptop === 1 ? preview : laptop,
                spaceBetween: spacingXxl === 1 ? spacingLg : spacingXxl,
                slidesPerGroup: perGroupLg,
                grid: {
                    rows: gridRows,
                    fill: "row",
                },
            },
        },
        on: {
            init: function (swiper) {
                if (currentNumberEl) {
                    currentNumberEl.textContent = String(swiper.realIndex + 1).padStart(2, "0");
                }
                updateSectImage(swiper);
            },

            slideChange: function (swiper) {
                if (currentNumberEl) {
                    currentNumberEl.textContent = String(swiper.realIndex + 1).padStart(2, "0");
                }
                updateSectImage(swiper);
            },

            autoplayTimeLeft(swiper, time, progress) {
                if (!isCircleProgress) return;

                var circle = circleProgress.querySelector(".progress-bar");
                var number = circleProgress.querySelector(".pagination-number");
                var circumference = 138;

                if (circle) {
                    circle.style.strokeDashoffset = circumference * progress;
                }

                if (number) {
                    number.textContent = swiper.realIndex + 1;
                }
            }
        }
    });

    if ($this.hasClass("view-auto") && atPlay) {
        swiperT.autoplay.stop();

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    swiperT.params.autoplay = {
                        delay: delay,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: pauseHover,
                    };
                    swiperT.autoplay.start();
                } else {
                    swiperT.autoplay.stop();
                }
            });
        }, {
            threshold: 0.3
        });

        observer.observe($this[0]);
    }


    var $lookbookHover = $this.closest(".tf-lookbook-hover");
    $lookbookHover.find(".swiper-button")
        .off("mouseenter.lookbook mouseleave.lookbook click.lookbook")
        .on("mouseenter.lookbook", function () {
            var slideIndex = $(this).data("slide");
            swiperT.slideTo(slideIndex, 500, false);
            $lookbookHover.find(".card-product").removeClass("active");
            $lookbookHover.find(".card-product").eq(slideIndex).addClass("active");
        })
        .on("mouseleave.lookbook", function () {
            $lookbookHover.find(".card-product").removeClass("active");
        })
        .on("click.lookbook", function () {
            var slideIndex = $(this).data("slide");
            $lookbookHover.find(".card-product").eq(slideIndex).toggleClass("clicked");
        });


    /* -- Custome Swiper -- */
    function updateSectImage(swiper) {
        const $swiper = $(swiper.el);
        const $section = $swiper.closest(".section-testimonial");

        if (!$section.length) return;

        const index = swiper.realIndex;

        const $imgs = $section.find(".sect-image img");

        $imgs.removeClass("active");
        $imgs.eq(index).addClass("active");
    }
});

if ($(".tf-sw-thumbs").length > 0) {
    var $this = $(".tf-sw-thumbs");
    var thumbEffect = $this.find(".sw-thumb").data("effect") || "slide";

    var thumbSwiper = new Swiper(".sw-thumb", {
        spaceBetween: 6,
        watchSlidesProgress: true,
        watchSlidesVisibility: true,
        speed: 800,
        slidesPerView: 3,
        centeredSlides: true,
        initialSlide: 1,
        slideToClickedSlide: true,
    });

    var mainSwiper = new Swiper(".sw-main-thumb", {
        grabCursor: true,
        speed: 800,
        spaceBetween: 20,
        initialSlide: 1,
        navigation: {
            prevEl: [
                $this.find(".nav-prev-swiper")[0],
            ],
            nextEl: [
                $this.find(".nav-next-swiper")[0],
            ],
        },
        scrollbar: {
            el: [
                $this.find(".tf-sw-scrollbar")[0],
            ],
            draggable: true,
            dragSize: "auto",
            clickable: true,
        },
    });
    thumbSwiper.controller.control = mainSwiper;
    mainSwiper.controller.control = thumbSwiper;
}
if ($(".swiper-thumbs-wrap").length > 0) {
    var $this = $(".swiper-thumbs-wrap");
    var thumbEffect = $this.find(".sw-thumbs_sub").data("effect") || "slide";

    var thumbSwiper = new Swiper(".sw-thumbs_sub", {
        watchSlidesProgress: true,
        watchSlidesVisibility: true,
        speed: 800,
        slidesPerView: 1,
        spaceBetween: 16,
        centeredSlides: true,
        slideToClickedSlide: true,
    });

    var mainSwiper = new Swiper(".sw-thumbs_main", {
        grabCursor: true,
        speed: 800,
        initialSlide: 1,

        navigation: {
            prevEl: ".sw-thumbs_main .nav-prev-swiper",
            nextEl: ".sw-thumbs_main .nav-next-swiper",
        },

        pagination: {
            el: ".sw-thumbs_main .tf-sw-pagination",
        },

        on: {
            init: function () {
                updateFraction(this);
            },
            slideChange: function () {
                updateFraction(this);
            }
        }
    });

    function updateFraction(swiper) {
        var current = swiper.realIndex + 1;
        var total = swiper.slides.length;

        document.querySelector(".pagination-text").textContent =
            current + "/" + total;
    }
    thumbSwiper.controller.control = mainSwiper;
    mainSwiper.controller.control = thumbSwiper;
}
if ($(".slider-thumb-wrap").length > 0) {
    const contentThumbSlider = new Swiper(".slider-content-thumb", {
        slidesPerView: 1,
        loop: true,
        grabCursor: true,
        speed: 800,
        on: {
            slideChange: function () {
                const activeIndex = this.realIndex;
                $(".btn-thumbs").removeClass("active");
                $(".btn-thumbs").eq(activeIndex).addClass("active");
            },
        },
    });

    $(".btn-thumbs").on("click", function () {
        const index = $(this).index();
        $(".btn-thumbs").removeClass("active");
        $(this).addClass("active");
        contentThumbSlider.slideToLoop(index);
    });
}

if ($(".tf-sw-mobile").length > 0) {
    $(".tf-sw-mobile").each(function () {
        var swiperMb;
        var $this = $(this);
        var screenWidth = $this.data("screen");

        function initSwiper() {
            if (
                matchMedia(`only screen and (max-width: ${screenWidth}px)`)
                    .matches
            ) {
                if (!swiperMb) {
                    var preview = $this.data("preview");
                    var previewMd = $this.data("preview-md") || preview;
                    var spacing = $this.data("space");

                    swiperMb = new Swiper($this[0], {
                        slidesPerView: preview,
                        spaceBetween: spacing,
                        speed: 1000,
                        pagination: {
                            el: $this.find(".sw-pagination-mb")[0],
                            clickable: true,
                        },
                        navigation: {
                            nextEl: $this.find(".nav-prev-mb")[0],
                            prevEl: $this.find(".nav-next-mb")[0],
                        },

                        breakpoints: {
                            640: {
                                slidesPerView: previewMd,
                                spaceBetween: spacing,
                            },
                        },

                    });
                }
            } else {
                if (swiperMb) {
                    swiperMb.destroy(true, true);
                    swiperMb = null;
                    $this.find(".swiper-wrapper").removeAttr("style");
                    $this.find(".swiper-slide").removeAttr("style");
                }
            }
        }

        initSwiper();
        window.addEventListener("resize", function () {
            initSwiper();
        });
    });
}

if ($(".swiper-quickview").length > 0) {
    var $modalRoot = $(".modal-quick-view");
    var mainQV = new Swiper(".swiper-quickview", {
        slidesPerView: 1,
        spaceBetween: 0,
        observer: true,
        observeParents: true,
        speed: 800,
        navigation: {
            nextEl: ".swiper-quickview .single-slide-next",
            prevEl: ".swiper-quickview .single-slide-prev",
        },
        pagination: {
            el: ".tf-sw-pagination",
            clickable: true,
        },
    });

    function updateModalActiveButton(type, activeIndex) {
        var btnClass = `.${type}-btn`;
        var dataAttr = `data-${type}`;
        var currentClass = `.value-current${capitalizeFirstLetter(type)}`;
        var selectClass = `.select-current${capitalizeFirstLetter(type)}`;
        $modalRoot.find(btnClass).removeClass("active");

        var currentSlide = $modalRoot.find(".swiper-quickview .swiper-slide").eq(activeIndex);
        var currentValue = currentSlide.attr(dataAttr);

        if (currentValue) {
            $modalRoot.find(`${btnClass}[${dataAttr}='${currentValue}']`).addClass("active");
            $modalRoot.find(currentClass).text(currentValue);
            $modalRoot.find(selectClass).text(currentValue);
        }
    }

    function scrollToModalSlide(type, value, color) {
        if (!value || !color) return;

        var matchingSlides = $modalRoot.find(".swiper-quickview .swiper-slide").filter(function () {
            return $(this).attr(`data-${type}`) === value && $(this).attr("data-color") === color;
        });

        if (matchingSlides.length > 0) {
            var firstIndex = matchingSlides.first().index();
            mainQV.slideTo(firstIndex, 1000, false);
        } else {
            var fallbackSlides = $modalRoot.find(".swiper-quickview .swiper-slide").filter(function () {
                return $(this).attr(`data-${type}`) === value;
            });

            if (fallbackSlides.length > 0) {
                var fallbackIndex = fallbackSlides.first().index();
                mainQV.slideTo(fallbackIndex, 1000, false);
            }
        }
    }

    function setupModalVariantButtons(type) {
        $modalRoot.find(`.${type}-btn`).on("click", function (e) {
            var value = $(this).data(type);
            var color = $modalRoot.find(".value-currentColor").text();

            $modalRoot.find(`.${type}-btn`).removeClass("active");
            $(this).addClass("active");

            scrollToModalSlide(type, value, color);
        });
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    ["color"].forEach((type) => {
        mainQV.on("slideChange", function () {
            updateModalActiveButton(type, this.activeIndex);
        });
        setupModalVariantButtons(type);
        updateModalActiveButton(type, mainQV.activeIndex);
    });
}
