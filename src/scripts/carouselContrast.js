const LUMINANCE_THRESHOLD = 148;
const SAMPLE_SIZE = 40;

/**
 * Samples left/right edge regions (where arrows sit) and returns avg luminance 0–255.
 */
function sampleImageEdgeLuminance(img) {
  return new Promise((resolve) => {
    const run = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx || !img.naturalWidth) {
          resolve(128);
          return;
        }

        canvas.width = SAMPLE_SIZE;
        canvas.height = SAMPLE_SIZE;
        ctx.drawImage(img, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);

        const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
        let sum = 0;
        let count = 0;

        for (let y = 0; y < SAMPLE_SIZE; y++) {
          for (let x = 0; x < SAMPLE_SIZE; x++) {
            if (x < SAMPLE_SIZE * 0.22 || x > SAMPLE_SIZE * 0.78) {
              const i = (y * SAMPLE_SIZE + x) * 4;
              sum +=
                0.299 * data[i] +
                0.587 * data[i + 1] +
                0.114 * data[i + 2];
              count++;
            }
          }
        }

        resolve(count ? sum / count : 128);
      } catch {
        resolve(128);
      }
    };

    if (img.complete && img.naturalWidth) run();
    else {
      img.addEventListener("load", run, { once: true });
      img.addEventListener("error", () => resolve(128), { once: true });
    }
  });
}

/**
 * Picks one arrow tone per carousel based on all slides (overall readability).
 */
export async function applyCarouselArrowContrast(carousel) {
  const images = [...carousel.querySelectorAll(".project-carousel__img")];
  if (!images.length) return;

  const luminances = await Promise.all(
    images.map(sampleImageEdgeLuminance)
  );

  const average =
    luminances.reduce((total, value) => total + value, 0) / luminances.length;

  // Light screenshots → dark arrows; dark screenshots → light arrows
  const tone = average > LUMINANCE_THRESHOLD ? "dark" : "light";
  carousel.dataset.arrowTone = tone;
}
