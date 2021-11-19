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

export const drawHistogramImage = (canvas, ctx, data) => {
  let padding = 2;
  let newCanvasWidth = canvas.width - padding * 2;
  let newCanvasHeight = canvas.height - padding * 2;
  let maxDepth = Math.max(...Object.values(data));
  let binSizeY = newCanvasHeight / maxDepth;
  let binSizeX = newCanvasWidth / 256;
  drawLine(ctx, padding - 1, padding - 1, padding - 1, newCanvasHeight + 1, "black");
  drawLine(ctx, padding - 1, newCanvasHeight + 1, newCanvasWidth + 1, newCanvasHeight + 1, "black");
  let lastPositionX = 0;
  for (const [key, value] of Object.entries(data)) {
    let upperLeftCornerX = padding + lastPositionX;
    let upperLeftCornerY = padding + newCanvasHeight - value * binSizeY;
    let width = binSizeX;
    let height = value * binSizeY;
    let color = key % 2 === 0 ? "#080808" : "#333";
    lastPositionX += binSizeX;
    drawBar(ctx, upperLeftCornerX, upperLeftCornerY, width, height, color);
  }
};
