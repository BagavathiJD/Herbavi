(function ($) {
    ("use strict");
    // DOM Ready

    gsap.registerPlugin(ScrollTrigger);
    // gsap.registerPlugin(SplitText);

    var changetext = function () {
        if ($(".text-color-change").length) {
            $(".text-color-change").each(function () {
                const $el = $(this)[0];

                $el.wordSplit?.revert();
                $el.charSplit?.revert();

                $el.wordSplit = new SplitText($el, {
                    type: "words",
                    wordsClass: "word-wrapper",
                });
                $el.charSplit = new SplitText($el.wordSplit.words, {
                    type: "chars",
                    charsClass: "char-wrapper",
                });

                gsap.set($el.charSplit.chars, { color: "#D4D4D4" });

                gsap.to($el.charSplit.chars, {
                    color: "#000",
                    stagger: { each: 0.03, from: "start" },
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: $el,
                        start: "top 90%",
                        end: "bottom 35%",
                        scrub: 1.5,
                        toggleActions: "play none none reverse",
                        // markers: true,
                    },
                });
            });
        }
        if ($(".text-color-change-2").length) {
            $(".text-color-change-2").each(function () {
                const $el = $(this)[0];

                $el.wordSplit?.revert();
                $el.charSplit?.revert();

                $el.wordSplit = new SplitText($el, {
                    type: "words",
                    wordsClass: "word-wrapper",
                });
                $el.charSplit = new SplitText($el.wordSplit.words, {
                    type: "chars",
                    charsClass: "char-wrapper",
                });

                gsap.set($el.charSplit.chars, { color: "#707070" });

                gsap.to($el.charSplit.chars, {
                    color: "#111111",
                    stagger: { each: 0.03, from: "start" },
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: $el,
                        start: "top 90%",
                        end: "bottom 35%",
                        scrub: 1.5,
                        toggleActions: "play none none reverse",
                    },
                });
            });
        }
        if ($(".text-color-change-3").length) {
            $(".text-color-change-3").each(function () {
                const $el = $(this)[0];

                $el.wordSplit?.revert();
                $el.charSplit?.revert();

                $el.wordSplit = new SplitText($el, {
                    type: "words",
                    wordsClass: "word-wrapper",
                });
                $el.charSplit = new SplitText($el.wordSplit.words, {
                    type: "chars",
                    charsClass: "char-wrapper",
                });

                gsap.set($el.charSplit.chars, { color: "#BBBBBB" });

                gsap.to($el.charSplit.chars, {
                    color: "#1A1A1A",
                    stagger: { each: 0.03, from: "start" },
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: $el,
                        start: "top 90%",
                        end: "bottom 35%",
                        scrub: 1.5,
                        toggleActions: "play none none reverse",
                    },
                });
            });
        }
    };
    var hoverRepel = () => {
        if ($(".hover-repel").length) {
            $(document).on("mousemove", function (e) {
                $(".hover-repel").each(function () {
                    const $this = $(this);
                    const offset = $this.offset();
                    const width = $this.outerWidth();
                    const height = $this.outerHeight();

                    const centerX = offset.left + width / 2;
                    const centerY = offset.top + height / 2;

                    const deltaX = centerX - e.pageX;
                    const deltaY = centerY - e.pageY;

                    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

                    const radius = 300;
                    const maxPush = 50;

                    if (distance < radius) {
                        const force = (1 - distance / radius) * maxPush;

                        const angle = Math.atan2(deltaY, deltaX);
                        const moveX = Math.cos(angle) * force;
                        const moveY = Math.sin(angle) * force;

                        gsap.to(this, {
                            x: moveX,
                            y: moveY,
                            duration: 0.3,
                            ease: "power2.out",
                        });
                    } else {
                        gsap.to(this, {
                            x: 0,
                            y: 0,
                            duration: 0.5,
                            ease: "power2.out",
                        });
                    }
                });
            });
        }

    }
    var blogStep = () => {
        if (!$(".section-blog-detail").length) return;

        const steps = document.querySelectorAll(".main__step");
        const progressLine = document.querySelector(".prg_scroll");
        const navItems = document.querySelectorAll(".detail_progress ul li");

        gsap.to(progressLine, {
            height: "100%",
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
                trigger: ".detail_main",
                start: "top 30%",
                end: "bottom 60%",
                scrub: true,
            }
        });

        steps.forEach((step, index) => {

            ScrollTrigger.create({
                trigger: step,
                start: "top 30%",
                end: "bottom 60%",
                onEnter: () => activateUpTo(index),
                onEnterBack: () => activateUpTo(index - 1)
            });

        });

        function activateUpTo(index) {
            navItems.forEach((item, i) => {
                if (i <= index) {
                    item.classList.add("active");
                } else {
                    item.classList.remove("active");
                }
            });
        }

    }


    var swiperHor = () => {
        if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

        function initGsapHorizontal() {
            const sections = document.querySelectorAll(".gsap-horizontal-main");
            if (!sections.length) return;

            sections.forEach((section) => {
                const wrap = section.querySelector(".gsap-horizontal-wrap");
                const track = section.querySelector(".gsap-horizontal-track");
                const progressFill = section.querySelector(".progress-line-fill");

                if (!wrap || !track) return;

                gsap.set(track, { x: 0 });

                if (progressFill) {
                    gsap.set(progressFill, {
                        scaleX: 0,
                        transformOrigin: "left center"
                    });
                }

                const getMaxMove = () => {
                    return Math.max(0, track.scrollWidth - wrap.clientWidth);
                };

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: section,
                        start: "center center",
                        end: () => `+=${getMaxMove()}`,
                        scrub: 1,
                        pin: true,
                        invalidateOnRefresh: true,
                    }
                });

                tl.to(track, {
                    x: () => -getMaxMove(),
                    ease: "none"
                }, 0);

                if (progressFill) {
                    tl.to(progressFill, {
                        scaleX: 1,
                        ease: "none"
                    }, 0);
                }
            });

            ScrollTrigger.refresh();
        }

        initGsapHorizontal();

        window.addEventListener("resize", () => {
            ScrollTrigger.refresh();
        });
    };

    /* Scroll Smooth
    -------------------------------------------------------------------------*/
    var scrollSmooth = () => {
        if (typeof Lenis === "undefined") return;
        if (window.lenis) return;

        const lenis = new Lenis({
            duration: 1.2,
            smoothWheel: true,
            prevent: (node) => {
                return node.closest(
                    '.modal, .offcanvas, .offcanvas-backdrop'
                );
            }
        });

        window.lenis = lenis;

        lenis.on("scroll", ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);
    };

    /* Parallax Gsap
    -------------------------------------------------------------------------*/
    var parallaxEngine = () => {
        if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

        const sections = document.querySelectorAll(".fx-parallax");
        if (!sections.length) return;

        const isMobile = window.innerWidth < 767;
        gsap.utils.toArray(".fx-parallax").forEach((section) => {
            const animations = [
                {
                    cls: ".prl-zoom-in-v1",
                    from: { scale: 1 },
                    to: { scale: 1.3 },
                },
            ];

            animations.forEach(({ cls, from, to }) => {
                const elements = section.querySelectorAll(cls);
                if (!elements.length) return;

                elements.forEach((el) => {
                    let startPos = "top bottom";
                    let endPos = "bottom top";

                    gsap.fromTo(el, from, {
                        ...to,
                        ease: "none",
                        scrollTrigger: {
                            trigger: section,
                            start: startPos,
                            end: endPos,
                            scrub: 1,
                        },
                    });
                });
            });
        });
    };

    /* Cate Animate
    -------------------------------------------------------------------------*/
    var initCateGsap = (() => {
        let resizeHandler = null;
        let initialized = false;
        let rafRefresh1 = null;
        let rafRefresh2 = null;
        let timeoutRefresh = null;

        const debounce = (func, delay) => {
            let timer;
            return function () {
                clearTimeout(timer);
                timer = setTimeout(() => func.apply(this, arguments), delay);
            };
        };

        const getResponsivePositions = () => {
            const ww = window.innerWidth;
            if (ww <= 575) {
                return {
                    contentScale: 1.4,
                    itemScale: 0.82,
                    positions: {
                        s1: { xPercent: -105, yPercent: -80 },
                        s2: { xPercent: 0, yPercent: -10 },
                        s3: { xPercent: -100, yPercent: -10 },
                        s4: { xPercent: 0, yPercent: -80 },
                        s5: { xPercent: -100, yPercent: -15 },
                        s6: { xPercent: 0, yPercent: -70 }
                    }
                };
            }
            if (ww <= 767) {
                return {
                    contentScale: 1.4,
                    itemScale: 0.82,
                    positions: {
                        s1: { xPercent: -105, yPercent: -80 },
                        s2: { xPercent: 0, yPercent: -10 },
                        s3: { xPercent: -100, yPercent: -30 },
                        s4: { xPercent: 0, yPercent: -60 },
                        s5: { xPercent: -100, yPercent: -25 },
                        s6: { xPercent: 0, yPercent: -70 }
                    }
                };
            }

            if (ww <= 991) {
                return {
                    contentScale: 1.6,
                    itemScale: 0.9,
                    positions: {
                        s1: { xPercent: -115, yPercent: -60 },
                        s2: { xPercent: 10, yPercent: -35 },
                        s3: { xPercent: -110, yPercent: -35 },
                        s4: { xPercent: 20, yPercent: -60 },
                        s5: { xPercent: -120, yPercent: -25 },
                        s6: { xPercent: 20, yPercent: -70 }
                    }
                };
            }
            if (ww <= 1200) {
                return {
                    contentScale: 1.6,
                    itemScale: 0.9,
                    positions: {
                        s1: { xPercent: -140, yPercent: -60 },
                        s2: { xPercent: 40, yPercent: -35 },
                        s3: { xPercent: -140, yPercent: -35 },
                        s4: { xPercent: 40, yPercent: -60 },
                        s5: { xPercent: -140, yPercent: -25 },
                        s6: { xPercent: 40, yPercent: -70 }
                    }
                };
            }
            return {
                contentScale: 2,
                itemScale: 1,
                positions: {
                    s1: { xPercent: -150, yPercent: -60 },
                    s2: { xPercent: 50, yPercent: -35 },
                    s3: { xPercent: -150, yPercent: -35 },
                    s4: { xPercent: 50, yPercent: -60 },
                    s5: { xPercent: -150, yPercent: -25 },
                    s6: { xPercent: 50, yPercent: -70 }
                }
            };
        };

        const killCateTriggers = () => {
            ScrollTrigger.getAll().forEach((st) => {
                if (st.vars && typeof st.vars.id === "string" && st.vars.id.indexOf("cate-") === 0) {
                    st.kill(true);
                }
            });
        };

        const refreshSafe = () => {
            if (rafRefresh1) cancelAnimationFrame(rafRefresh1);
            if (rafRefresh2) cancelAnimationFrame(rafRefresh2);
            if (timeoutRefresh) clearTimeout(timeoutRefresh);

            rafRefresh1 = requestAnimationFrame(() => {
                ScrollTrigger.refresh();

                rafRefresh2 = requestAnimationFrame(() => {
                    ScrollTrigger.refresh();
                });
            });

            timeoutRefresh = setTimeout(() => {
                ScrollTrigger.refresh();
            }, 250);
        };

        const waitForImagesIn = (root) => {
            const images = Array.from(root.querySelectorAll("img"));
            if (!images.length) return Promise.resolve();

            return Promise.all(
                images.map((img) => {
                    if (img.complete) return Promise.resolve();

                    return new Promise((resolve) => {
                        const done = () => {
                            img.removeEventListener("load", done);
                            img.removeEventListener("error", done);
                            resolve();
                        };
                        img.addEventListener("load", done, { once: true });
                        img.addEventListener("error", done, { once: true });
                    });
                })
            );
        };

        const waitForFonts = async () => {
            if (document.fonts && document.fonts.ready) {
                try {
                    await document.fonts.ready;
                } catch (e) { }
            }
        };

        const build = () => {
            if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
            if (!$(".trigger-cate-layer").length) return;

            gsap.registerPlugin(ScrollTrigger);

            killCateTriggers();

            $(".trigger-cate-layer").each(function (index) {
                const section = this;
                const pinWrap = section.querySelector(".trigger-cate-layer-inner");
                const categoryWrap = section.querySelector(".section-cls-category");
                const content = section.querySelector(".content-abs");
                const banner = section.querySelector(".trigger-cta-layer");
                const responsive = getResponsivePositions();

                const s1 = section.querySelector(".collection-v11.s1");
                const s2 = section.querySelector(".collection-v11.s2");
                const s3 = section.querySelector(".collection-v11.s3");
                const s4 = section.querySelector(".collection-v11.s4");
                const s5 = section.querySelector(".collection-v11.s5");
                const s6 = section.querySelector(".collection-v11.s6");

                const items = [
                    { el: s1, pos: responsive.positions.s1, side: "left" },
                    { el: s2, pos: responsive.positions.s2, side: "right" },
                    { el: s3, pos: responsive.positions.s3, side: "left" },
                    { el: s4, pos: responsive.positions.s4, side: "right" },
                    { el: s5, pos: responsive.positions.s5, side: "left" },
                    { el: s6, pos: responsive.positions.s6, side: "right" }
                ].filter((item) => item.el);

                if (!pinWrap || !categoryWrap || !content || !items.length) return;

                gsap.killTweensOf(content);
                gsap.killTweensOf(items.map((item) => item.el));
                if (banner) gsap.killTweensOf(banner);

                gsap.set([content, ...items.map((item) => item.el), banner].filter(Boolean), {
                    force3D: true,
                    willChange: "transform, opacity"
                });

                gsap.set(content, {
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    xPercent: -50,
                    yPercent: -50,
                    x: 0,
                    y: 0,
                    autoAlpha: 0.8,
                    scale: 1.4,
                    transformOrigin: "center center"
                });

                gsap.set(items.map((item) => item.el), {
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    xPercent: -50,
                    yPercent: -50,
                    x: 0,
                    y: 0,
                    autoAlpha: 0,
                    scale: 0.7,
                    transformOrigin: "center center"
                });

                if (banner) {
                    gsap.set(banner, {
                        autoAlpha: 0,
                        clipPath: "inset(50% round 100px)",
                        WebkitClipPath: "inset(50% round 100px)",
                        transformOrigin: "center center"
                    });
                }

                const tl = gsap.timeline({
                    defaults: { ease: "none" },
                    scrollTrigger: {
                        id: "cate-" + index + "-main",
                        trigger: section,
                        start: "center center",
                        end: "+=320%",
                        scrub: 1,
                        pin: pinWrap,
                        pinSpacing: true,
                        pinType: "fixed",
                        invalidateOnRefresh: true,
                        fastScrollEnd: true,
                    }
                });

                tl.to(content, {
                    autoAlpha: 1,
                    scale: 1,
                }, 0);

                const showDur = 0.6;
                const gap = 0.42;
                const hideDur = 0.18;
                const pause = 0.2;

                const showItem = (item, at) => {
                    tl.to(item.el, {
                        autoAlpha: 1,
                        scale: responsive.itemScale,
                        xPercent: item.pos.xPercent,
                        yPercent: item.pos.yPercent,
                        duration: showDur
                    }, at);
                };

                const hideItem = (item, at) => {
                    tl.to(item.el, {
                        autoAlpha: 0,
                        scale: 0.8,
                        duration: hideDur
                    }, at);
                };

                items.forEach((item, i) => {
                    const startAt = 0.35 + i * gap;

                    showItem(item, startAt);

                    if (i >= 2) {
                        for (let j = i - 1; j >= 0; j--) {
                            if (items[j].side === item.side) {
                                hideItem(items[j], startAt + pause);
                                break;
                            }
                        }
                    }
                });

                const endAt = 0.35 + items.length * gap + pause;

                items.forEach((item, i) => {
                    const hasNextSameSide = items.slice(i + 1).some((next) => next.side === item.side);
                    if (!hasNextSameSide) {
                        hideItem(item, endAt);
                    }
                });

                tl.to(content, {
                    autoAlpha: 0.1,
                    scale: 0.2,
                    duration: 0.3
                }, endAt + hideDur);

                if (banner) {
                    tl.to(banner, {
                        autoAlpha: 1,
                        duration: 0.01
                    }, endAt + hideDur + 0.02);

                    tl.to(banner, {
                        clipPath: "inset(0% round 8px)",
                        WebkitClipPath: "inset(0% round 8px)",
                        duration: 1
                    }, ">");
                }
            });

            refreshSafe();
        };

        const init = async () => {
            if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
            if (!$(".trigger-cate-layer").length) return;

            const sections = Array.from(document.querySelectorAll(".trigger-cate-layer"));

            await waitForFonts();
            await Promise.all(sections.map(waitForImagesIn));

            build();

            sections.forEach((section) => {
                const imgs = section.querySelectorAll("img");
                imgs.forEach((img) => {
                    img.addEventListener("load", refreshSafe);
                    img.addEventListener("error", refreshSafe);
                });
            });

            window.addEventListener("load", refreshSafe);
            setTimeout(refreshSafe, 500);
            setTimeout(refreshSafe, 1200);
        };

        return function () {
            if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
            if (!$(".trigger-cate-layer").length) return;

            init();

            if (!initialized) {
                resizeHandler = debounce(() => {
                    build();
                }, 250);

                window.addEventListener("resize", resizeHandler);
                initialized = true;
            }
        };
    })();

    /* Hero Parallax
    -------------------------------------------------------------------------*/
    var heroBannerParallax = function () {
        if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
        if (!$(".tf-hero-banner").length) return;

        gsap.registerPlugin(ScrollTrigger);

        $(".tf-hero-banner").each(function () {
            const hero = this;

            if (window.innerWidth < 991) return;

            const image = hero.querySelector(".hero-image img");
            const content = hero.querySelector(".hero-content");
            const left = hero.querySelector(".hero-content_left");
            const right = hero.querySelector(".hero-content_right");
            const glass = hero.querySelector(".fractal-glass");

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: hero,
                    start: "top top",
                    end: "+=100%",
                    scrub: true,
                    invalidateOnRefresh: true
                }
            });

            if (image) {
                tl.to(image, {
                    yPercent: -8,
                    scale: 1.1,
                    ease: "none"
                }, 0);
            }

            if (content) {
                tl.to(content, {
                    yPercent: -100,
                    ease: "none"
                }, 0);
            }
            if (glass) {
                tl.to(glass, {
                    yPercent: -110,
                    ease: "none"
                }, 0);
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        blogStep();
        changetext();
        hoverRepel();
        swiperHor();
        scrollSmooth();
        parallaxEngine();
        initCateGsap();
        heroBannerParallax();
    });
})(jQuery);
