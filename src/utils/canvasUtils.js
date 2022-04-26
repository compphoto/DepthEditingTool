import { solveCubic } from "./calculation";
import { filterImage, morphImage } from "./imageProcessing";

export const canvasToImage = canvas => {
  if (canvas) return canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
  return null;
};

export const downloadCanvas = (canvas, fileName) => {
  if (canvas) {
    let image = canvasToImage(canvas);
    var downloadLink = document.createElement("a");
    downloadLink.download = fileName;
    downloadLink.href = image;
    downloadLink.click();
  }
};

export const canvasResize = (oldCanvas, size = 1000) => {
  if (oldCanvas) {
    const maxi = Math.max(oldCanvas.width, oldCanvas.height);
    const ratio = maxi / size;
    const newCanvas = document.createElement("canvas");
    const context = newCanvas.getContext("2d");
    newCanvas.width = oldCanvas.width / ratio;
    newCanvas.height = oldCanvas.height / ratio;
    context.drawImage(oldCanvas, 0, 0, oldCanvas.width, oldCanvas.height, 0, 0, newCanvas.width, newCanvas.height);
    return newCanvas;
  }
  return null;
};

export const cloneCanvas = oldCanvas => {
  if (oldCanvas) {
    const newCanvas = document.createElement("canvas");
    const context = newCanvas.getContext("2d");
    newCanvas.width = oldCanvas.width;
    newCanvas.height = oldCanvas.height;
    context.drawImage(oldCanvas, 0, 0);
    return newCanvas;
  }
  return null;
};

export const canvasLike = canvas => {
  if (canvas) {
    const newCanvas = document.createElement("canvas");
    const context = newCanvas.getContext("2d");
    newCanvas.width = canvas.width;
    newCanvas.height = canvas.height;
    return newCanvas;
  }
  return null;
};

export const dimensionToBox = dimension => {
  let x = dimension[0];
  let y = dimension[1];
  let w = dimension[2] - x;
  let h = dimension[3] - y;
  if (w === 0 || h === 0) {
    return null;
  }
  return [x, y, w, h];
};

export const boxToDimension = box => {
  let x1 = box[0];
  let y1 = box[1];
  let x2 = x1 + box[2];
  let y2 = y1 + box[3];
  return [x1, y1, x2, y2];
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

export const upScaleBox = (box, ratio, centerShift_x, centerShift_y, translatePos, scale) => {
  let x = (box[0] - centerShift_x - translatePos.x) / ratio / scale;
  let y = (box[1] - centerShift_y - translatePos.y) / ratio / scale;
  let w = box[2] / ratio / scale;
  let h = box[3] / ratio / scale;
  return [x, y, w, h];
};

export const upScaleDimension = (dimension, ratio, centerShift_x, centerShift_y, translatePos, scale) => {
  let x1 = (dimension[0] - centerShift_x - translatePos.x) / ratio / scale;
  let y1 = (dimension[1] - centerShift_y - translatePos.y) / ratio / scale;
  let x2 = x1 + (dimension[2] - centerShift_x) / ratio / scale;
  let y2 = y1 + (dimension[3] - centerShift_y) / ratio / scale;
  return [x1, y1, x2, y2];
};

export const downScaleBox = (box, ratio, centerShift_x, centerShift_y, translatePos, scale) => {
  let x = box[0] * ratio * scale + centerShift_x + translatePos.x;
  let y = box[1] * ratio * scale + centerShift_y + translatePos.y;
  let w = box[2] * ratio * scale;
  let h = box[3] * ratio * scale;
  return [x, y, w, h];
};

export const upScalePoint = (point, ratio, centerShift_x, centerShift_y, translatePos, scale) => {
  let { x, y } = point;
  let new_x = (x - centerShift_x - translatePos.x) / ratio / scale;
  let new_y = (y - centerShift_y - translatePos.y) / ratio / scale;
  return { x: new_x, y: new_y };
};

export const downScalePoint = (point, ratio, centerShift_x, centerShift_y, translatePos, scale) => {
  let { x, y } = point;
  let new_x = x * ratio * scale + centerShift_x + translatePos.x;
  let new_y = y * ratio * scale + centerShift_y + translatePos.y;
  return { x: new_x, y: new_y };
};

export const getDimension = (image, ratio, centerShift_x, centerShift_y, translatePos, scale) => {
  let x1 = centerShift_x + translatePos.x;
  let y1 = centerShift_y + translatePos.y;
  let x2 = x1 + image.width * ratio * scale;
  let y2 = y1 + image.height * ratio * scale;
  return [x1, y1, x2, y2];
};

export const getBoundingArea = image => {
  if (image) {
    return [0, 0, image.width, image.height];
  }
  return null;
};

export const drawCanvasImage = (image, context) => {
  context.drawImage(image, 0, 0);
};

export const drawScaledCanvasImage = (image, canvas, ratio, centerShift_x, centerShift_y, scale, translatePos) => {
  let context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.save();
  context.translate(translatePos.x, translatePos.y);
  // context.scale(scale, scale);
  context.drawImage(
    image,
    0,
    0,
    image.width,
    image.height,
    centerShift_x,
    centerShift_y,
    image.width * ratio * scale,
    image.height * ratio * scale
  );
  context.restore();
};

export const getImageFromCanvas = bitmap => {
  let canvas = document.createElement("canvas");
  canvas.width = 190;
  canvas.height = 132;
  let { ratio, centerShift_x, centerShift_y } = getRatio(bitmap, canvas);
  drawScaledCanvasImage(bitmap, canvas, ratio, centerShift_x, centerShift_y, 1, { x: 0, y: 0 });
  return canvasToImage(canvas);
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

export const drawLayerCanvas = (image, context, canvas) => {
  context.drawImage(canvas, 0, 0);
};

export const drawBox = (canvas, box) => {
  const [new_x, new_y, new_w, new_h] = box;
  const context = canvas.getContext("2d");
  context.beginPath();
  context.strokeStyle = "red";
  context.rect(new_x, new_y, new_w, new_h);
  context.stroke();
};

export const getRgbBitmap = (bitmapCanvas, rgbCanvas) => {
  const bitmapContext = bitmapCanvas.getContext("2d");
  bitmapContext.globalCompositeOperation = "source-in";
  bitmapContext.drawImage(rgbCanvas, 0, 0);
  return bitmapCanvas;
};

export const highlightPixelArea = (image, context, boundingBox, pixelRange) => {
  if (context && boundingBox) {
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
  if (rgbContext && depthContext && boundingBox) {
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
  return bitmapCanvas;
};

export const invertBitmap = (mainCanvas, bitmapCanvas) => {
  if (mainCanvas && bitmapCanvas) {
    const mainContext = mainCanvas.getContext("2d");
    mainContext.globalCompositeOperation = "destination-out";
    mainContext.drawImage(bitmapCanvas, 0, 0);
    return mainCanvas;
  }
};

export const editHighlightPixelArea = (image, context, canvas, depthCanvas, depth) => {
  if (context && canvas && depthCanvas) {
    const bitmapCanvas = cloneCanvas(canvas);
    const bitmapContext = bitmapCanvas.getContext("2d");
    bitmapContext.globalCompositeOperation = "source-in";
    bitmapContext.drawImage(depthCanvas, 0, 0);
    const imageData = bitmapContext.getImageData(0, 0, bitmapCanvas.width, bitmapCanvas.height);
    const src = imageData.data;
    for (let i = 0; i < src.length; i += 4) {
      if (src[i + 3] !== 0) {
        src[i] += 255 * (depth / 1);
        src[i + 1] += 255 * (depth / 1);
        src[i + 2] += 255 * (depth / 1);
      }
    }
    bitmapContext.putImageData(imageData, 0, 0);
    filterImage(bitmapCanvas, "blur");
    context.globalCompositeOperation = "source-over";
    context.drawImage(bitmapCanvas, 0, 0);
    return bitmapCanvas;
  }
};

export const scaleSelection = (image, context, canvas, depthCanvas, scale) => {
  if (context && canvas && depthCanvas) {
    const bitmapCanvas = cloneCanvas(canvas);
    const bitmapContext = bitmapCanvas.getContext("2d");
    bitmapContext.globalCompositeOperation = "source-in";
    bitmapContext.drawImage(depthCanvas, 0, 0);
    const imageData = bitmapContext.getImageData(0, 0, bitmapCanvas.width, bitmapCanvas.height);
    const src = imageData.data;
    let sum = 0;
    let count = 0;
    for (let i = 0; i < src.length; i += 4) {
      if (src[i + 3] !== 0) {
        sum += src[i];
        count += 1;
      }
    }
    let mean = sum / count;
    for (let i = 0; i < src.length; i += 4) {
      if (src[i + 3] !== 0) {
        let output = mean + scale * (src[i] - mean);
        src[i] = output;
        src[i + 1] = output;
        src[i + 2] = output;
      }
    }
    bitmapContext.putImageData(imageData, 0, 0);
    context.globalCompositeOperation = "source-over";
    context.drawImage(bitmapCanvas, 0, 0);
    return bitmapCanvas;
  }
};

export const adjustTone = (image, context, canvas, depthCanvas, cpS, cp1, cp2, cpE) => {
  function getT(x, cpSx, cp1x, cp2x, cpEx) {
    let a = -cpSx + 3 * cp1x - 3 * cp2x + cpEx;
    let b = 3 * cpSx - 6 * cp1x + 3 * cp2x;
    let c = -3 * cpSx + 3 * cp1x;
    let d = cpSx - x;
    let solution = solveCubic(a, b, c, d);
    for (let i = 0; i < solution.length; i++) {
      if (solution[i] >= 0 && solution[i] <= 1.09) {
        return solution[i];
      }
    }
  }
  function getD(t, cpSy, cp1y, cp2y, cpEy) {
    let y =
      Math.pow(1 - t, 3) * cpSy +
      3 * Math.pow(1 - t, 2) * t * cp1y +
      3 * (1 - t) * Math.pow(t, 2) * cp2y +
      Math.pow(t, 3) * cpEy;
    return y;
  }
  function getX(x, w = 200) {
    return (255 * x) / w;
  }
  function getY(y, h = 200) {
    return (255 * (h - y)) / h;
  }
  if (context && canvas && depthCanvas) {
    const bitmapCanvas = cloneCanvas(canvas);
    const bitmapContext = bitmapCanvas.getContext("2d");
    bitmapContext.globalCompositeOperation = "source-in";
    bitmapContext.drawImage(depthCanvas, 0, 0);
    const imageData = bitmapContext.getImageData(0, 0, bitmapCanvas.width, bitmapCanvas.height);
    const src = imageData.data;
    for (let i = 0; i < src.length; i += 4) {
      if (src[i + 3] !== 0) {
        let output = getD(
          getT(src[i], getX(cpS.x), getX(cp1.x), getX(cp2.x), getX(cpE.x)),
          getY(cpS.y),
          getY(cp1.y),
          getY(cp2.y),
          getY(cpE.y)
        );
        src[i] = output;
        src[i + 1] = output;
        src[i + 2] = output;
      }
    }
    bitmapContext.putImageData(imageData, 0, 0);
    context.globalCompositeOperation = "source-over";
    context.drawImage(bitmapCanvas, 0, 0);
    return bitmapCanvas;
  }
};

export const addScaleShift = (image, context, canvas, depthCanvas, a, b) => {
  if (context && canvas && depthCanvas) {
    const bitmapCanvas = cloneCanvas(canvas);
    const bitmapContext = bitmapCanvas.getContext("2d");
    bitmapContext.globalCompositeOperation = "source-in";
    bitmapContext.drawImage(depthCanvas, 0, 0);
    const imageData = bitmapContext.getImageData(0, 0, bitmapCanvas.width, bitmapCanvas.height);
    const src = imageData.data;
    for (let i = 0; i < src.length; i += 4) {
      if (src[i + 3] !== 0) {
        let output = a * src[i] + 255 * (b / 2);
        src[i] = output;
        src[i + 1] = output;
        src[i + 2] = output;
      }
    }
    bitmapContext.putImageData(imageData, 0, 0);
    context.globalCompositeOperation = "source-over";
    context.drawImage(bitmapCanvas, 0, 0);
    return bitmapCanvas;
  }
};

export const drawScribble = (context, start, end) => {
  context.beginPath();
  context.lineWidth = 3;
  context.lineCap = "round";
  context.strokeStyle = "#c0392b";
  context.moveTo(start.x, start.y);
  context.lineTo(end.x, end.y);
  context.stroke();
};

export const getScribbleRange = (depthCanvas, path) => {
  const bitmapCanvas = document.createElement("canvas");
  const bitmapContext = bitmapCanvas.getContext("2d");
  bitmapCanvas.width = depthCanvas.width;
  bitmapCanvas.height = depthCanvas.height;

  for (let i = 0; i < path.length; i++) {
    drawScribble(bitmapContext, path[i].start, path[i].end);
  }

  bitmapContext.globalCompositeOperation = "source-in";
  bitmapContext.drawImage(depthCanvas, 0, 0);

  let maxi = -Infinity;
  let mini = Infinity;
  const imageData = bitmapContext.getImageData(0, 0, bitmapCanvas.width, bitmapCanvas.height);
  const src = imageData.data;
  for (let i = 0; i < src.length; i += 4) {
    if (src[i + 3] !== 0) {
      if (src[i] > maxi) {
        maxi = src[i];
      }
      if (src[i] < mini) {
        mini = src[i];
      }
    }
  }

  return [mini, maxi];
};

export const maskToImage = (maskCanvas, depthCanvas) => {
  if (maskCanvas && depthCanvas) {
    const bitmapCanvas = document.createElement("canvas");
    const bitmapContext = bitmapCanvas.getContext("2d");
    bitmapCanvas.width = depthCanvas.width;
    bitmapCanvas.height = depthCanvas.height;

    const bitmapData = bitmapContext.getImageData(0, 0, bitmapCanvas.width, bitmapCanvas.height);
    const bitmapSrc = bitmapData.data;
    const maskSrc = maskCanvas.getContext("2d").getImageData(0, 0, bitmapCanvas.width, bitmapCanvas.height).data;
    const depthSrc = depthCanvas.getContext("2d").getImageData(0, 0, bitmapCanvas.width, bitmapCanvas.height).data;

    for (let i = 0; i < bitmapSrc.length; i += 4) {
      bitmapSrc[i] = depthSrc[i];
      bitmapSrc[i + 1] = depthSrc[i + 1];
      bitmapSrc[i + 2] = depthSrc[i + 2];
      bitmapSrc[i + 3] = maskSrc[i];
    }
    bitmapContext.putImageData(bitmapData, 0, 0);

    return bitmapCanvas;
  }
};

export const getGroundMask = (groundMaskImage, depthCanvas, rectangle) => {
  const groundCanvas = document.createElement("canvas");
  groundCanvas.width = groundMaskImage.width;
  groundCanvas.height = groundMaskImage.height;
  const groundContext = groundCanvas.getContext("2d");
  groundContext.drawImage(groundMaskImage, 0, 0);

  const [x, y, w, h] = rectangle;
  const bitmapCanvas = document.createElement("canvas");
  const bitmapContext = bitmapCanvas.getContext("2d");
  bitmapCanvas.width = depthCanvas.width;
  bitmapCanvas.height = depthCanvas.height;
  const bitmapData = bitmapContext.getImageData(x, y, w, h);
  const bitmapSrc = bitmapData.data;
  const groundSrc = groundContext.getImageData(0, 0, w, h).data;
  const depthSrc = depthCanvas.getContext("2d").getImageData(x, y, w, h).data;

  for (let i = 0; i < bitmapSrc.length; i += 4) {
    bitmapSrc[i] = depthSrc[i];
    bitmapSrc[i + 1] = depthSrc[i + 1];
    bitmapSrc[i + 2] = depthSrc[i + 2];
    bitmapSrc[i + 3] = groundSrc[i];
  }
  bitmapContext.putImageData(bitmapData, x, y);

  return bitmapCanvas;
};
