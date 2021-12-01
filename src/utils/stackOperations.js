import store from "store/store";
import { imageActions } from "store/image";
import { canvasToImage, cloneCanvas } from "./canvasUtils";

export const runDepthCanvasOperations = (image, context) => {
  let depthCanvasStack = store.getState().image.operationStack.depthCanvasStack;
  depthCanvasStack.forEach(element => {
    element.params ? element.func(image, context, ...element.params) : element.func(image, context);
  });
};

export const runTempDepthOperations = image => {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext("2d");
  let tempDepthStack = store.getState().image.operationStack.tempDepthStack;
  tempDepthStack.forEach(element => {
    element.params ? element.func(image, context, ...element.params) : element.func(image, context);
  });
  const storeAction = require("store/store");
  storeAction.default.dispatch(imageActions.initImage({ tempDepthCanvas: cloneCanvas(canvas) }));
};
