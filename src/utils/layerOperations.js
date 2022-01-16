import store from "store/store";
import { imageActions } from "store/image";
import { cloneCanvas, editHighlightPixelArea, scaleSelection } from "./canvasUtils";

export const runDepthLayerOperations = context => {
  let layerStack = store.getState().image.operationStack["layerStack"];
  [...layerStack].reverse().forEach(element => {
    let newBitmap = editHighlightPixelArea(null, context, cloneCanvas(element.bitmap), element.depth);
    scaleSelection(null, context, newBitmap, element.detail);
  });
};

export const runTempDepthLayerOperations = (width, height) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  let layerStack = store.getState().image.operationStack["layerStack"];
  [...layerStack].reverse().forEach(element => {
    let newBitmap = editHighlightPixelArea(null, context, cloneCanvas(element.bitmap), element.depth);
    scaleSelection(null, context, newBitmap, element.detail);
  });
  const storeAction = require("store/store");
  storeAction.default.dispatch(imageActions.initImage({ tempDepthCanvas: cloneCanvas(canvas) }));
};

export const runRgbLayerOperations = context => {
  let layerStack = store.getState().image.operationStack["layerStack"];
  [...layerStack].reverse().forEach(element => {
    context.drawImage(element.rgbBitmap, 0, 0);
  });
};

export const runTempRgbLayerOperations = (width, height) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  let layerStack = store.getState().image.operationStack["layerStack"];
  [...layerStack].reverse().forEach(element => {
    context.drawImage(element.rgbBitmap, 0, 0);
  });
  const storeAction = require("store/store");
  storeAction.default.dispatch(imageActions.initImage({ tempRgbCanvas: cloneCanvas(canvas) }));
};
