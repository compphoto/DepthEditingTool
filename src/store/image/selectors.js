export const selectors = {
  rgbImageUrl: state => state.image.rgbImageUrl,
  depthImageUrl: state => state.image.depthImageUrl,
  mainRgbCanvas: state => state.image.mainRgbCanvas,
  mainDepthCanvas: state => state.image.mainDepthCanvas,
  tempRgbCanvas: state => state.image.tempRgbCanvas,
  tempDepthCanvas: state => state.image.tempDepthCanvas,
  prevRgbSize: state => state.image.prevRgbSize,
  prevDepthSize: state => state.image.prevDepthSize,
  rgbCanvasDimension: state => state.image.rgbCanvasDimension,
  depthCanvasDimension: state => state.image.depthCanvasDimension,
  depthCanvasDimension: state => state.image.depthCanvasDimension,
  bitmapCanvas: state => state.image.bitmapCanvas,
  layerMode: state => state.image.layerMode,
  tools: state => state.image.tools,
  toolsParameters: state => state.image.toolsParameters,
  layerParameters: state => state.image.layerParameters,
  parameters: state => state.image.parameters,
  operationStack: state => state.image.operationStack
};
