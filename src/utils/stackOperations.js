import store from "store/store";
import { imageActions } from "store/image";
import { canvasToImage, cloneCanvas } from "./canvasUtils";

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
  storeAction.default.dispatch(imageActions.initImage({ tempDepthCanvas: cloneCanvas(canvas) }));
};
