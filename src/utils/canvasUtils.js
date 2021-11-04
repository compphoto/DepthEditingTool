export const drawCanvasImage = (image, canvas, context) => {
  let hRatio = canvas.width / image.naturalWidth;
  let vRatio = canvas.height / image.naturalHeight;
  let ratio = Math.min(hRatio, vRatio);
  let centerShift_x = (canvas.width - image.naturalWidth * ratio) / 2;
  let centerShift_y = (canvas.height - image.naturalHeight * ratio) / 2;
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
};
