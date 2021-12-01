import { imageActions } from "store/image";
import store from "store/store";

// const store = require("store/store");
//   store.default.dispatch(
//     imageActions.initImage({
//       [type === "depth" ? depthImageDimension : rgbImageDimension]: [x1, y1, x2, y2],
//       scaleParams: {
//         ratio: ratio,
//         centerShift_x: centerShift_x,
//         centerShift_y: centerShift_y
//       }
//     })
//   );

export const canvasToImage = canvas => {
  if (canvas) return canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
  return null;
};

export const cloneCanvas = oldCanvas => {
  var newCanvas = document.createElement("canvas");
  var context = newCanvas.getContext("2d");
  newCanvas.width = oldCanvas.width;
  newCanvas.height = oldCanvas.height;
  context.drawImage(oldCanvas, 0, 0);
  return newCanvas;
};

export const getRatio = (image, canvas) => {
  let hRatio = canvas.width / image.width;
  let vRatio = canvas.height / image.height;
  let ratio = Math.min(hRatio, vRatio);
  let centerShift_x = (canvas.width - image.width * ratio) / 2;
  let centerShift_y = (canvas.height - image.height * ratio) / 2;
  return {
    ratio: ratio,
    centerShift_x: centerShift_x,
    centerShift_y: centerShift_y
  };
};

export const getDimension = (image, ratio, centerShift_x, centerShift_y) => {
  let x1 = centerShift_x;
  let y1 = centerShift_y;
  let x2 = centerShift_x + image.width * ratio;
  let y2 = centerShift_y + image.height * ratio;
  return [x1, y1, x2, y2];
};

export const drawCanvasImage = (image, context, ratio, centerShift_x, centerShift_y) => {
  context.drawImage(
    image,
    0,
    0,
    image.width,
    image.height,
    centerShift_x,
    centerShift_y,
    image.width * ratio,
    image.height * ratio
  );
};

export const editBoundingArea = (boundingBox, context, depth) => {
  if (boundingBox && context) {
    const imageData = context.getImageData(boundingBox[0], boundingBox[1], boundingBox[2], boundingBox[3]);
    const src = imageData.data;
    for (let i = 0; i < src.length; i += 4) {
      src[i] += 255 * (depth / 100);
      src[i + 1] += 255 * (depth / 100);
      src[i + 2] += 255 * (depth / 100);
    }
    context.putImageData(imageData, boundingBox[0], boundingBox[1]);
  }
};

export const highlightPixelArea = (image, context, boundingBox, pixelRange) => {
  if (boundingBox && context) {
    const imageData = context.getImageData(boundingBox[0], boundingBox[1], boundingBox[2], boundingBox[3]);
    const src = imageData.data;
    for (let i = 0; i < src.length; i += 4) {
      if (src[i] < pixelRange[0] || src[i] > pixelRange[1]) {
        src[i] -= 150;
        src[i + 1] -= 150;
        src[i + 2] -= 150;
      }
    }
    context.putImageData(imageData, boundingBox[0], boundingBox[1]);
  }
};

export const highlightPixelAreaRgb = (boundingBox, rgbContext, depthContext, pixelRange) => {
  if (boundingBox && rgbContext && depthContext) {
    const imageData = rgbContext.getImageData(boundingBox[0], boundingBox[1], boundingBox[2], boundingBox[3]);
    const rgbSrc = imageData.data;
    const depthSrc = depthContext.getImageData(boundingBox[0], boundingBox[1], boundingBox[2], boundingBox[3]).data;
    for (let i = 0; i < rgbSrc.length; i += 4) {
      if (depthSrc[i] < pixelRange[0] || depthSrc[i] > pixelRange[1]) {
        rgbSrc[i] -= 150;
        rgbSrc[i + 1] -= 150;
        rgbSrc[i + 2] -= 150;
      }
    }
    rgbContext.putImageData(imageData, boundingBox[0], boundingBox[1]);
  }
};

export const editHighlightPixelArea = (boundingBox, context, pixelRange, depth) => {
  if (boundingBox && context) {
    const imageData = context.getImageData(boundingBox[0], boundingBox[1], boundingBox[2], boundingBox[3]);
    const src = imageData.data;
    for (let i = 0; i < src.length; i += 4) {
      if (src[i] >= pixelRange[0] && src[i] <= pixelRange[1]) {
        src[i] += 255 * (depth / 100);
        src[i + 1] += 255 * (depth / 100);
        src[i + 2] += 255 * (depth / 100);
      }
    }
    context.putImageData(imageData, boundingBox[0], boundingBox[1]);
  }
};

export const cropCanvas = (oldCanvas, boundingBox) => {
  var newCanvas = document.createElement("canvas");
  newCanvas.width = boundingBox[2];
  newCanvas.height = boundingBox[3];
  var context = newCanvas.getContext("2d");
  context.drawImage(
    oldCanvas,
    boundingBox[0],
    boundingBox[1],
    boundingBox[2],
    boundingBox[3],
    0,
    0,
    boundingBox[2],
    boundingBox[3]
  );
  return newCanvas;
};
