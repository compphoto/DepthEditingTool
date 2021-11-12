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

export const drawCanvasImage = (image, canvas, context) => {
  let hRatio = canvas.width / image.naturalWidth;
  let vRatio = canvas.height / image.naturalHeight;
  let ratio = Math.min(hRatio, vRatio);
  let centerShift_x = (canvas.width - image.naturalWidth * ratio) / 2;
  let centerShift_y = (canvas.height - image.naturalHeight * ratio) / 2;
  context.globalAlpha = 1;
  context.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
    centerShift_x,
    centerShift_y,
    image.naturalWidth * ratio,
    image.naturalHeight * ratio
  );
  let x1 = centerShift_x;
  let y1 = centerShift_y;
  let x2 = centerShift_x + image.naturalWidth * ratio;
  let y2 = centerShift_y + image.naturalHeight * ratio;
  return [x1, y1, x2, y2];
};

export const editBoundingArea = (boundingBox, context) => {
  const imageData = context.getImageData(boundingBox[0], boundingBox[1], boundingBox[2], boundingBox[3]);
  const src = imageData.data;
  for (let i = 0; i < src.length; i += 4) {
    src[i] += 100;
    src[i + 1] += 100;
    src[i + 2] += 100;
  }
  context.putImageData(imageData, boundingBox[0], boundingBox[1]);
};
