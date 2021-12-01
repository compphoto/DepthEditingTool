export const selectors = {
  rgbImageUrl: state => state.image.rgbImageUrl,
  depthImageUrl: state => state.image.depthImageUrl,
  mainRgbCanvas: state => state.image.mainRgbCanvas,
  mainDepthCanvas: state => state.image.mainDepthCanvas,
  tempRgbCanvas: state => state.image.tempRgbCanvas,
  tempDepthCanvas: state => state.image.tempDepthCanvas,
  prevRgbSize: state => state.image.prevRgbSize,
  prevDepthSize: state => state.image.prevDepthSize,
  scaleParams: state => state.image.scaleParams,
  tools: state => state.image.tools,
  toolsParameters: state => state.image.toolsParameters,
  parameters: state => state.image.parameters,
  operationStack: state => state.image.operationStack
};
