import store from "store/store";
import { imageActions } from "store/image";
import { canvasToImage, cloneCanvas } from "./canvasUtils";

export const runCanvasOperations = (name, image, context) => {
  let canvasStack = store.getState().image.operationStack[name];
  canvasStack.forEach(element => {
    element.params ? element.func(image, context, ...element.params) : element.func(image, context);
  });
};

export const runTempOperations = (name, image, width, height) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  let tempStack = store.getState().image.operationStack[name];
  tempStack.forEach(element => {
    element.params ? element.func(image, context, ...element.params) : element.func(image, context);
  });
  const storeAction = require("store/store");
  if (name === "tempRgbStack") {
    storeAction.default.dispatch(imageActions.initImage({ tempRgbCanvas: cloneCanvas(canvas) }));
  } else {
    storeAction.default.dispatch(imageActions.initImage({ tempDepthCanvas: cloneCanvas(canvas) }));
  }
};
