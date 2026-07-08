(() => {
  const elements = document.querySelectorAll(".image-compare");
  if (!elements.length) return;

  elements.forEach((imageCompareElement) => {
    const options = {
      controlColor: "#FFFFFF",
      controlShadow: false,
      addCircle: true,
      addCircleBlur: true,
      smoothing: false,
      showLabels: true,
      labelOptions: { before: "Before", after: "After" },
      maxHeight: 300,
      startingPoint: 99,
    };

    new ImageCompare(imageCompareElement, options).mount();

    function getControl() {
      return imageCompareElement.querySelector(".icv__control");
    }

    function getWrapper() {
      return imageCompareElement.querySelector(".icv__wrapper");
    }

    function getLabelBefore() {
      return imageCompareElement.querySelector(".icv__label-before");
    }

    function getLabelAfter() {
      return imageCompareElement.querySelector(".icv__label-after");
    }

    function isOverlapX(a, b) {
      return a.left < b.right && a.right > b.left;
    }

    function adjustLabelOpacity() {
      const control = getControl();
      const lb = getLabelBefore();
      const la = getLabelAfter();
      if (!control || !lb || !la) return;

      const controlRect = control.getBoundingClientRect();
      const beforeRect = lb.getBoundingClientRect();
      const afterRect = la.getBoundingClientRect();

      lb.style.opacity = isOverlapX(controlRect, beforeRect) ? "0" : "1";
      la.style.opacity = isOverlapX(controlRect, afterRect) ? "0" : "1";
    }

    let rafId = 0;
    function rafAdjust() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        adjustLabelOpacity();
      });
    }

    function setCompare(percent) {
      const control = getControl();
      const wrapper = getWrapper();
      if (!control || !wrapper) return;

      control.style.left = `calc(${percent}% - 25px)`;
      wrapper.style.width = `calc(${100 - percent}%)`;

      rafAdjust();
    }

    function animateCompare(from, to, duration = 900) {
      const start = performance.now();

      function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
      }

      function frame(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = easeOutCubic(progress);
        const current = from + (to - from) * eased;

        setCompare(current);

        if (progress < 1) {
          requestAnimationFrame(frame);
        }
      }

      requestAnimationFrame(frame);
    }

    imageCompareElement.addEventListener("mousemove", rafAdjust, { passive: true });
    imageCompareElement.addEventListener("touchmove", rafAdjust, { passive: true });

    let dragging = false;

    function onPointerDown(e) {
      const control = getControl();
      if (control && (e.target === control || control.contains(e.target))) {
        dragging = true;
        rafAdjust();
      }
    }

    function onPointerMove() {
      if (dragging) rafAdjust();
    }

    function onPointerUp() {
      if (dragging) {
        dragging = false;
        rafAdjust();
      }
    }

    document.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerup", onPointerUp, { passive: true });

    let hasAnimated = false;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || hasAnimated) return;
          hasAnimated = true;
          animateCompare(99, 50, 1000);
          observer.unobserve(imageCompareElement);
        });
      },
      {
        threshold: 0.5,
      }
    );

    function init() {
      setCompare(99);
      rafAdjust();
      observer.observe(imageCompareElement);
    }

    window.addEventListener("load", init);
    window.addEventListener("resize", () => {
      setCompare(hasAnimated ? 50 : 99);
      rafAdjust();
    });

    let tries = 0;
    const t = setInterval(() => {
      tries++;
      if (getControl() && getWrapper()) {
        setCompare(99);
        rafAdjust();
        clearInterval(t);
        observer.observe(imageCompareElement);
      }
      if (tries >= 30) clearInterval(t);
    }, 50);

    setTimeout(() => {
      setCompare(99);
      rafAdjust();
    }, 0);
  });
})();