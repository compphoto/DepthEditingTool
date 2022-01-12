import store from "store/store";
import { imageActions } from "store/image";
import { canvasToImage, cloneCanvas, editHighlightPixelArea, scaleSelection } from "./canvasUtils";

export const runCanvasOperations = (name, image, context) => {
  let canvasStack = store.getState().image.operationStack[name];
  canvasStack.forEach(element => {
    element.params ? element.func(image, context, ...element.params) : element.func(image, context);
  });
};

export const runTempRgbOperations = (name, image, width, height) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  let stack = store.getState().image.operationStack[name];
  stack.forEach(element => {
    element.params ? element.func(image, context, ...element.params) : element.func(image, context);
  });
  const storeAction = require("store/store");
  storeAction.default.dispatch(imageActions.initImage({ tempRgbCanvas: cloneCanvas(canvas) }));
};

export const runTempDepthOperations = (name, image, width, height) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  let stack = store.getState().image.operationStack[name];
  stack.forEach(element => {
    if (element.type === "effect") {
      element.params ? element.func(image, context, ...element.params) : element.func(image, context);
    }
  });
  const storeAction = require("store/store");
  let bitmapCanvas = store.getState().image.bitmapCanvas;
  let data = {
    tempDepthCanvas: cloneCanvas(canvas),
    bitmapCanvas: bitmapCanvas === null ? cloneCanvas(canvas) : bitmapCanvas
  };
  storeAction.default.dispatch(imageActions.initImage(data));
};

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
