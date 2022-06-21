import store from "store/store";
import { imageActions } from "store/image";
import { cloneCanvas } from "./canvasUtils";

export const runRgbOperations = image => {
  const displayRgbCanvas = document.createElement("canvas");
  displayRgbCanvas.width = image.width;
  displayRgbCanvas.height = image.height;
  const displayRgbContext = displayRgbCanvas.getContext("2d");
  let stack = store.getState().image.operationStack["rgbStack"];
  stack.forEach(element => {
    element.func(image, displayRgbContext, ...element.params);
  });
  const storeAction = require("store/store");
  const rgbBitmapCanvas = store.getState().image.rgbBitmapCanvas;
  let data = {
    displayRgbCanvas: cloneCanvas(displayRgbCanvas),
    rgbBitmapCanvas: rgbBitmapCanvas === null ? cloneCanvas(displayRgbCanvas) : rgbBitmapCanvas
  };
  storeAction.default.dispatch(imageActions.initImage(data));
};

export const runDepthOperations = image => {
  const memoryDepthCanvas = document.createElement("canvas");
  const displayDepthCanvas = document.createElement("canvas");
  memoryDepthCanvas.width = image.width;
  memoryDepthCanvas.height = image.height;
  displayDepthCanvas.width = image.width;
  displayDepthCanvas.height = image.height;
  const memoryDepthContext = memoryDepthCanvas.getContext("2d");
  const displayDepthContext = displayDepthCanvas.getContext("2d");
  let stack = store.getState().image.operationStack["depthStack"];
  stack.forEach(element => {
    element.func(image, displayDepthContext, ...element.params);
    element.func(image, memoryDepthContext, ...element.params);
  });
  const storeAction = require("store/store");
  let data = {
    memoryDepthCanvas: cloneCanvas(memoryDepthCanvas),
    displayDepthCanvas: cloneCanvas(displayDepthCanvas)
  };
  storeAction.default.dispatch(imageActions.initImage(data));
};

export const runCachedDepthOperations = image => {
  const memoryDepthCanvas = cloneCanvas(store.getState().image.cacheDepthCanvas);
  const displayDepthCanvas = cloneCanvas(store.getState().image.cacheDepthCanvas);
  const memoryDepthContext = memoryDepthCanvas.getContext("2d");
  const displayDepthContext = displayDepthCanvas.getContext("2d");
  let stack = store.getState().image.operationStack["depthStack"];
  const lastOperation = stack[stack.length - 1];
  lastOperation.func(image, displayDepthContext, ...lastOperation.params);
  lastOperation.func(image, memoryDepthContext, ...lastOperation.params);
  const storeAction = require("store/store");
  let data = {
    memoryDepthCanvas: memoryDepthCanvas,
    displayDepthCanvas: displayDepthCanvas
  };
  storeAction.default.dispatch(imageActions.initImage(data));
};
