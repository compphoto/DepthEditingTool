export const selectors = {
  rgbImageUrl: state => state.image.rgbImageUrl,
  depthImageUrl: state => state.image.depthImageUrl,
  loadedRgbImage: state => state.image.loadedRgbImage,
  loadedDepthImage: state => state.image.loadedDepthImage,
  mainDepthCanvas: state => state.image.mainDepthCanvas,
  tempDepthCanvas: state => state.image.tempDepthCanvas,
  rgbImageDimension: state => state.image.rgbImageDimension,
  depthImageDimension: state => state.image.depthImageDimension,
  prevRgbSize: state => state.image.prevRgbSize,
  prevDepthSize: state => state.image.prevDepthSize,
  tools: state => state.image.tools,
  parameters: state => state.image.parameters
};
