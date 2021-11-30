import store from "store/store";
import { imageActions } from "store/image";
import { canvasToImage, cloneCanvas } from "./canvasUtils";

export const runDepthCanvasOperations = (image, context) => {
  store.getState().image.operationStack.depthCanvasStack.forEach(element => {
    element.params ? element.func(image, context, element.params) : element.func(image, context);
  });
};

export const runMainDepthOperations = image => {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");
  store.getState().image.operationStack.mainDepthStack.forEach(element => {
    element.params ? element.func(image, context, element.params) : element.func(image, context);
  });
  const storeAction = require("store/store");
  storeAction.default.dispatch(imageActions.initImage({ mainDepthCanvas: cloneCanvas(canvas) }));
};
