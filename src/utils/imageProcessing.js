export function filterImage(imageToFilter, filter) {
  const context = imageToFilter.getContext("2d");
  const canvasWidth = imageToFilter.width;
  const canvasHeight = imageToFilter.height;
  const sourceImageData = context.getImageData(0, 0, canvasWidth, canvasHeight);
  const blankOutputImageData = context.createImageData(canvasWidth, canvasHeight);
  const outputImageData = applyFilter(sourceImageData, blankOutputImageData, filter);
  context.putImageData(outputImageData, 0, 0);
}

export function morphImage(imageToFilter, morph, kernel_size = 5, iterations = 1) {
  const context = imageToFilter.getContext("2d");
  const canvasWidth = imageToFilter.width;
  const canvasHeight = imageToFilter.height;
  const sourceImageData = context.getImageData(0, 0, canvasWidth, canvasHeight);
  const blankOutputImageData = context.createImageData(canvasWidth, canvasHeight);
  const outputImageData = applyMorph(sourceImageData, blankOutputImageData, morph, kernel_size, iterations);
  context.putImageData(outputImageData, 0, 0);
}

function applyFilter(sourceImageData, outputImageData, filter) {
  if (filter === "noFilter") {
    return sourceImageData;
  } else if (filter === "blur") {
    return applyConvolution(sourceImageData, outputImageData, [
      1 / 16,
      2 / 16,
      1 / 16,
      2 / 16,
      4 / 16,
      2 / 16,
      1 / 16,
      2 / 16,
      1 / 16
    ]);
  } else {
    return sourceImageData;
  }
}

function applyMorph(sourceImageData, outputImageData, morph, kernel_size, iterations) {
  if (morph === "noMorph") {
    return sourceImageData;
  } else if (morph === "dilate") {
    return applyDilation(sourceImageData, outputImageData, kernel_size, iterations);
  } else {
    return sourceImageData;
  }
}

// Operations

function applyConvolution(sourceImageData, outputImageData, kernel) {
  const src = sourceImageData.data;
  const dst = outputImageData.data;

  const srcWidth = sourceImageData.width;
  const srcHeight = sourceImageData.height;

  const side = Math.round(Math.sqrt(kernel.length));
  const halfSide = Math.floor(side / 2);

  const w = srcWidth;
  const h = srcHeight;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let a = 0;
      for (let cy = 0; cy < side; cy++) {
        for (let cx = 0; cx < side; cx++) {
          const scy = y + cy - halfSide;
          const scx = x + cx - halfSide;
          if (scy >= 0 && scy < srcHeight && scx >= 0 && scx < srcWidth) {
            let srcOffset = (scy * srcWidth + scx) * 4;
            let wt = kernel[cy * side + cx];
            a += src[srcOffset + 3] * wt;
          }
        }
      }
      const dstOffset = (y * w + x) * 4;
      dst[dstOffset] = src[dstOffset];
      dst[dstOffset + 1] = src[dstOffset + 1];
      dst[dstOffset + 2] = src[dstOffset + 2];
      dst[dstOffset + 3] = a;
    }
  }
  return outputImageData;
}

function applyDilation(sourceImageData, outputImageData, kernel_size, iterations) {
  const src = sourceImageData.data;
  const dst = outputImageData.data;

  const srcWidth = sourceImageData.width;
  const srcHeight = sourceImageData.height;

  const kernel = Array.from({ length: kernel_size * kernel_size }, (_, i) => 1);
  const side = Math.round(Math.sqrt(kernel.length));
  const halfSide = Math.floor(side / 2);

  const w = srcWidth;
  const h = srcHeight;

  for (let i = 0; i < iterations; i++) {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let maxi = -Infinity;
        for (let cy = 0; cy < side; cy++) {
          for (let cx = 0; cx < side; cx++) {
            const scy = y + cy - halfSide;
            const scx = x + cx - halfSide;
            if (scy >= 0 && scy < srcHeight && scx >= 0 && scx < srcWidth) {
              let srcOffset = (scy * srcWidth + scx) * 4;
              let wt = kernel[cy * side + cx];
              let a = src[srcOffset + 3] * wt;
              if (a > maxi) {
                maxi = a;
              }
            }
          }
        }
        const dstOffset = (y * w + x) * 4;
        dst[dstOffset] = src[dstOffset];
        dst[dstOffset + 1] = src[dstOffset + 1];
        dst[dstOffset + 2] = src[dstOffset + 2];
        dst[dstOffset + 3] = maxi;
      }
    }
  }
  return outputImageData;
}
