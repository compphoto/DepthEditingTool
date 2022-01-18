import store from "store/store";
import { imageActions } from "store/image";
import { cloneCanvas, editHighlightPixelArea, scaleSelection } from "./canvasUtils";

export const runDepthLayerOperations = (width, height) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  let layerStack = store.getState().image.operationStack["layerStack"];
  [...layerStack].reverse().forEach(element => {
    let newBitmap = editHighlightPixelArea(null, context, cloneCanvas(element.depthBitmap), element.depth);
    scaleSelection(null, context, newBitmap, element.detail);
  });
  const storeAction = require("store/store");
  let data = {
    memoryDepthCanvas: cloneCanvas(canvas),
    displayDepthCanvas: cloneCanvas(canvas)
  };
  storeAction.default.dispatch(imageActions.initImage(data));
};

export const runRgbLayerOperations = (width, height) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  let layerStack = store.getState().image.operationStack["layerStack"];
  [...layerStack].reverse().forEach(element => {
    context.drawImage(element.rgbBitmap, 0, 0);
  });
  const storeAction = require("store/store");
  let data = {
    displayRgbCanvas: cloneCanvas(canvas)
  };
  storeAction.default.dispatch(imageActions.initImage(data));
};
