import store from "store/store";
import { imageActions } from "store/image";
import { cloneCanvas } from "./canvasUtils";

export const runRgbOperations = image => {
  const memoryRgbCanvas = document.createElement("canvas");
  memoryRgbCanvas.width = image.width;
  memoryRgbCanvas.height = image.height;
  const memoryRgbContext = memoryRgbCanvas.getContext("2d");
  let stack = store.getState().image.operationStack["rgbStack"];
  stack.forEach(element => {
    element.func(image, memoryRgbContext, ...element.params);
  });
  const storeAction = require("store/store");
  let data = {
    memoryRgbCanvas: cloneCanvas(memoryRgbCanvas)
  };
  storeAction.default.dispatch(imageActions.initImage(data));
};

export const runDepthOperations = image => {
  const memoryDepthCanvas = document.createElement("canvas");
  memoryDepthCanvas.width = image.width;
  memoryDepthCanvas.height = image.height;
  const memoryDepthContext = memoryDepthCanvas.getContext("2d");
  let stack = store.getState().image.operationStack["depthStack"];
  stack.forEach(element => {
    element.func(image, memoryDepthContext, ...element.params);
  });
  const storeAction = require("store/store");
  let data = {
    memoryDepthCanvas: cloneCanvas(memoryDepthCanvas)
  };
  storeAction.default.dispatch(imageActions.initImage(data));
};

export const runCachedDepthOperations = image => {
  const memoryDepthCanvas = cloneCanvas(store.getState().image.cacheDepthCanvas);
  const memoryDepthContext = memoryDepthCanvas.getContext("2d");
  let stack = store.getState().image.operationStack["depthStack"];
  const lastOperation = stack[stack.length - 1];
  lastOperation.func(image, memoryDepthContext, ...lastOperation.params);
  const storeAction = require("store/store");
  let data = {
    memoryDepthCanvas: memoryDepthCanvas
  };
  storeAction.default.dispatch(imageActions.initImage(data));
};
