export const getImageData = img => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = img.width;
  canvas.height = img.height;
  context.drawImage(img, 0, 0);
  const src = context.getImageData(0, 0, img.width, img.height).data;
  let histDepth = {};
  for (let i = 0; i < 256; i++) {
    histDepth[i] = 0;
  }
  for (let i = 0; i < src.length; i += 4) {
    let r = src[i];
    let g = src[i + 1];
    let b = src[i + 2];
    histDepth[r]++;
    histDepth[g]++;
    histDepth[b]++;
  }
  return histDepth;
};

export const drawLine = (ctx, startX, startY, endX, endY, color) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();
  ctx.restore();
};

export const drawBar = (ctx, upperLeftCornerX, upperLeftCornerY, width, height, color) => {
  ctx.save();
  ctx.fillStyle = color;
  ctx.fillRect(upperLeftCornerX, upperLeftCornerY, width, height);
  ctx.restore();
};
