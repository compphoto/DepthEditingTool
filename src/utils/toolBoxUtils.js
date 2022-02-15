import { modifyBitmap } from "./canvasUtils";

export const modifySingleSelection = (bitmapCanvas, croppedCanvas, box, pixelRange) => {
  return modifyBitmap(bitmapCanvas, croppedCanvas, box, "singleSelection", pixelRange);
};

export const modifyAddSelection = (bitmapCanvas, croppedCanvas, box, pixelRange) => {
  return modifyBitmap(bitmapCanvas, croppedCanvas, box, "addSelection", pixelRange);
};

export const modifySubtractSelection = (bitmapCanvas, croppedCanvas, box, pixelRange) => {
  return modifyBitmap(bitmapCanvas, croppedCanvas, box, "subtractSelection", pixelRange);
};

export const modifyIntersectSelection = (bitmapCanvas, croppedCanvas, box, pixelRange) => {
  return modifyBitmap(bitmapCanvas, croppedCanvas, box, "intersectSelection", pixelRange);
};
