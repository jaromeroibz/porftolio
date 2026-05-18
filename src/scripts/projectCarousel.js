import { applyCarouselArrowContrast } from "./carouselContrast";

const AUTOPLAY_INTERVAL_MS = 4000;

export default function initProjectCarousels() {
  const carousels = document.querySelectorAll("[data-carousel]");

  carousels.forEach((carousel) => {
    applyCarouselArrowContrast(carousel);
    const slides = [...carousel.querySelectorAll(".project-carousel__slide")];
    const prevBtn = carousel.querySelector("[data-carousel-prev]");
    const nextBtn = carousel.querySelector("[data-carousel-next]");

    if (slides.length < 2) return;

    let index = slides.findIndex((slide) =>
      slide.classList.contains("is-active")
    );
    if (index < 0) index = 0;

    let autoplayTimer = null;
    let isPaused = false;
    let isInView = false;

    const goTo = (nextIndex) => {
      slides[index].classList.remove("is-active");
      index = (nextIndex + slides.length) % slides.length;
      slides[index].classList.add("is-active");
    };

    const canAutoplay = () =>
      isInView && !isPaused && !document.hidden;

    const startAutoplay = () => {
      stopAutoplay();
      if (!canAutoplay()) return;

      autoplayTimer = window.setInterval(() => {
        if (canAutoplay()) goTo(index + 1);
      }, AUTOPLAY_INTERVAL_MS);
    };

    const stopAutoplay = () => {
      if (autoplayTimer !== null) {
        window.clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    };

    const resetAutoplay = () => {
      if (canAutoplay()) startAutoplay();
    };

    prevBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      goTo(index - 1);
      resetAutoplay();
    });

    nextBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      goTo(index + 1);
      resetAutoplay();
    });

    let touchStartX = 0;

    carousel.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true }
    );

    carousel.addEventListener(
      "touchend",
      (e) => {
        const delta = e.changedTouches[0].screenX - touchStartX;
        if (Math.abs(delta) < 40) return;
        goTo(delta > 0 ? index - 1 : index + 1);
        resetAutoplay();
      },
      { passive: true }
    );

    carousel.addEventListener("mouseenter", () => {
      isPaused = true;
      stopAutoplay();
    });

    carousel.addEventListener("mouseleave", () => {
      isPaused = false;
      resetAutoplay();
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopAutoplay();
      } else {
        resetAutoplay();
      }
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        isInView = entry.isIntersecting;

        if (isInView) {
          startAutoplay();
        } else {
          stopAutoplay();
        }
      },
      { threshold: 0.35, rootMargin: "0px 0px -5% 0px" }
    );

    observer.observe(carousel);
  });
}
