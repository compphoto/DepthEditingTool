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
  const newCanvas = document.createElement("canvas");
  const context = newCanvas.getContext("2d");
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

export const drawScaledCanvasImage = (
  image,
  context,
  canvas,
  ratio,
  centerShift_x,
  centerShift_y,
  scale,
  translatePos
) => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.save();
  context.translate(translatePos.x, translatePos.y);
  context.scale(scale, scale);
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
  context.restore();
};

export const drawBox = (image, context, new_x, new_y, new_w, new_h) => {
  context.beginPath();
  context.strokeStyle = "red";
  context.rect(new_x, new_y, new_w, new_h);
  context.stroke();
};

export const highlightPixelArea = (image, context, boundingBox, pixelRange) => {
  if (context && boundingBox && pixelRange) {
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

export const highlightPixelAreaRgb = (image, rgbContext, depthContext, boundingBox, pixelRange) => {
  if (rgbContext && depthContext && boundingBox && pixelRange) {
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

export const editHighlightPixelArea = (image, context, canvas, depth) => {
  if (context && canvas && depth) {
    const bitmapCanvas = cloneCanvas(canvas);
    const bitmapContext = bitmapCanvas.getContext("2d");
    const imageData = bitmapContext.getImageData(0, 0, bitmapCanvas.width, bitmapCanvas.height);
    const src = imageData.data;
    for (let i = 0; i < src.length; i += 4) {
      if (src[i + 3] !== 0) {
        src[i] += 255 * (depth / 100);
        src[i + 1] += 255 * (depth / 100);
        src[i + 2] += 255 * (depth / 100);
      }
    }
    bitmapContext.putImageData(imageData, 0, 0);
    context.globalCompositeOperation = "source-over";
    context.drawImage(bitmapCanvas, 0, 0);
  }
};

export const modifyBitmap = (bitmapCanvas, croppedCanvas, box, currentTool, pixelRange) => {
  const bitmapContext = bitmapCanvas.getContext("2d");
  const croppedContext = croppedCanvas.getContext("2d");
  if (currentTool === "singleSelection") {
    bitmapContext.clearRect(0, 0, bitmapCanvas.width, bitmapCanvas.height);
  }
  const imageData = croppedContext.getImageData(0, 0, croppedCanvas.width, croppedCanvas.height);
  const src = imageData.data;
  for (let i = 0; i < src.length; i += 4) {
    if (src[i] < pixelRange[0] || src[i] > pixelRange[1]) {
      src[i + 3] = 0;
    }
  }
  croppedContext.putImageData(imageData, 0, 0);
  bitmapContext.globalCompositeOperation = "source-over";
  if (currentTool === "subtractSelection") {
    bitmapContext.globalCompositeOperation = "destination-out";
  }
  if (currentTool === "intersectSelection") {
    bitmapContext.globalCompositeOperation = "source-in";
  }
  bitmapContext.drawImage(croppedCanvas, box[0], box[1]);
};

export const cropCanvas = (oldCanvas, boundingBox) => {
  if (oldCanvas && boundingBox) {
    const newCanvas = document.createElement("canvas");
    newCanvas.width = boundingBox[2];
    newCanvas.height = boundingBox[3];
    const context = newCanvas.getContext("2d");
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
  }
  return null;
};
