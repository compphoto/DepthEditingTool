import store from "store/store";
import { imageActions } from "store/image";
import { cloneCanvas } from "./canvasUtils";

export const runRgbOperations = image => {
  const displayRgbCanvas = document.createElement("canvas");
  displayRgbCanvas.width = image.width;
  displayRgbCanvas.height = image.height;
  const cachedRgbContext = displayRgbCanvas.getContext("2d");
  let stack = store.getState().image.operationStack["rgbStack"];
  let data = {};
  stack.forEach((element, index) => {
    if (stack.length > 1 && index === stack.length - 1) {
      data = {
        ...data,
        cacheRgbCanvas: cloneCanvas(displayRgbCanvas)
      };
    }
    element.params ? element.func(image, cachedRgbContext, ...element.params) : element.func(image, cachedRgbContext);
  });
  const storeAction = require("store/store");
  const rgbBitmapCanvas = store.getState().image.rgbBitmapCanvas;
  data = {
    ...data,
    displayRgbCanvas: cloneCanvas(displayRgbCanvas),
    rgbBitmapCanvas: rgbBitmapCanvas === null ? cloneCanvas(displayRgbCanvas) : rgbBitmapCanvas
  };
  storeAction.default.dispatch(imageActions.initImage(data));
};

export const runCachedRgbOperations = image => {
  const displayRgbCanvas = cloneCanvas(store.getState().image.cacheRgbCanvas);
  const displayRgbContext = displayRgbCanvas.getContext("2d");
  let stack = store.getState().image.operationStack["rgbStack"];
  const lastOperation = stack[stack.length - 1];
  lastOperation.params
    ? lastOperation.func(image, displayRgbContext, ...lastOperation.params)
    : lastOperation.func(image, displayRgbContext);
  const storeAction = require("store/store");
  let data = {
    displayRgbCanvas: displayRgbCanvas
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
  let data = {};
  stack.forEach((element, index) => {
    element.params
      ? element.func(image, displayDepthContext, ...element.params)
      : element.func(image, displayDepthContext);
    if (element.type === "effect") {
      if (stack.length > 1 && index === stack.length - 1) {
        data = {
          ...data,
          cacheDepthCanvas: cloneCanvas(memoryDepthCanvas)
        };
      }
      element.params
        ? element.func(image, memoryDepthContext, ...element.params)
        : element.func(image, memoryDepthContext);
    }
  });
  const storeAction = require("store/store");
  data = {
    ...data,
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
  lastOperation.params
    ? lastOperation.func(image, displayDepthContext, ...lastOperation.params)
    : lastOperation.func(image, displayDepthContext);
  if (lastOperation.type === "effect") {
    lastOperation.params
      ? lastOperation.func(image, memoryDepthContext, ...lastOperation.params)
      : lastOperation.func(image, memoryDepthCanvas);
  }
  const storeAction = require("store/store");
  let data = {
    memoryDepthCanvas: memoryDepthCanvas,
    displayDepthCanvas: displayDepthCanvas
  };
  storeAction.default.dispatch(imageActions.initImage(data));
};
