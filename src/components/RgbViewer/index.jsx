import React, { Component, createRef } from "react";
import { connect } from "react-redux";
import { imageActions } from "store/image";
import { selectors as imageSelectors } from "store/image";
import RgbViewerStyle from "./style";
import { getImageUrl } from "utils/getImageFromFile";
import {
  cloneCanvas,
  dimensionToBox,
  drawBox,
  drawCanvasImage,
  getDimension,
  getRatio,
  highlightPixelAreaRgb
} from "utils/canvasUtils";
import { runCanvasOperations, runTempRgbOperations } from "utils/stackOperations";
import { runRgbLayerOperations, runTempRgbLayerOperations } from "utils/layerOperations";

let objectUrl = null;

class RgbViewer extends Component {
  constructor() {
    super();
    this.rgbImageRef = createRef();
  }
  state = {
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight
  };
  componentDidMount() {
    this.handleResize();
    window.addEventListener("resize", this.handleResize);
  }
  componentDidUpdate(prevProps, prevState) {
    let { rgbImageRef } = this;
    let {
      rgbImageUrl,
      mainRgbCanvas,
      mainDepthCanvas,
      tempRgbCanvas,
      tempDepthCanvas,
      rgbCanvasDimension,
      bitmapCanvas,
      layerMode,
      prevRgbSize,
      tools,
      toolsParameters,
      parameters,
      operationStack,
      initImage,
      addOperation,
      removeOperation,
      addEffect
    } = this.props;
    let rgbCanvas = rgbImageRef.current;
    let rgbContext = rgbCanvas.getContext("2d");
    // Load image and initialize all canvas images
    if (prevProps.rgbImageUrl !== rgbImageUrl) {
      rgbContext.clearRect(0, 0, prevRgbSize.width, prevRgbSize.height);
      let rgbImage = new Image();
      objectUrl = getImageUrl(rgbImageUrl);
      rgbImage.src = objectUrl;
      rgbImage.onload = () => {
        initImage({
          mainRgbCanvas: cloneCanvas(rgbImage), // Draw original canvas
          tempRgbCanvas: null,
          rgbCanvasDimension: null,
          operationStack: {
            ...operationStack,
            rgbStack: []
          }
        });
      };
    }
    // If main image changes, add draw/redraw canvas to operation
    if (prevProps.mainRgbCanvas !== mainRgbCanvas) {
      const { ratio, centerShift_x, centerShift_y } = getRatio(mainRgbCanvas, rgbCanvas);
      addEffect({
        name: "rgbStack",
        value: { func: drawCanvasImage, params: [ratio, centerShift_x, centerShift_y] }
      });
      initImage({
        prevRgbSize: { width: rgbCanvas.width, height: rgbCanvas.height },
        rgbCanvasDimension: getDimension(mainRgbCanvas, ratio, centerShift_x, centerShift_y)
      });
    }
    // If operation is added to the stack, rerun all operations in operation stack
    if (prevProps.operationStack.rgbStack !== operationStack.rgbStack || prevProps.layerMode !== layerMode) {
      if (!layerMode) {
        rgbContext.clearRect(0, 0, rgbCanvas.width, rgbCanvas.height);
        runCanvasOperations("rgbStack", mainRgbCanvas, rgbContext);
        runTempRgbOperations("rgbStack", mainRgbCanvas, rgbCanvas.width, rgbCanvas.height);
      }
    }
    if (
      prevProps.operationStack.layerStack.length !== operationStack.layerStack.length ||
      prevProps.layerMode !== layerMode
    ) {
      if (layerMode) {
        rgbContext.clearRect(0, 0, rgbCanvas.width, rgbCanvas.height);
        runRgbLayerOperations(rgbContext);
        runTempRgbLayerOperations(rgbCanvas.width, rgbCanvas.height);
      }
    }
    // Highlight pixel range from specified range for either cropped image or initial full image
    if (prevProps.parameters.histogramParams.pixelRange !== parameters.histogramParams.pixelRange) {
      if (parameters.histogramParams.pixelRange || parameters.croppedArea) {
        const { croppedArea, histogramParams } = parameters;
        const depthContext = tempDepthCanvas.getContext("2d");
        rgbContext.clearRect(0, 0, rgbCanvas.width, rgbCanvas.height);
        let newArea = null;
        if (croppedArea) {
          newArea = croppedArea;
        } else {
          newArea = dimensionToBox(rgbCanvasDimension);
        }
        addOperation({
          name: "rgbStack",
          value: { func: highlightPixelAreaRgb, params: [depthContext, newArea, histogramParams.pixelRange] }
        });
      }
    }
    if (prevProps.parameters.croppedArea !== parameters.croppedArea) {
      const { croppedArea } = parameters;
      if (croppedArea && tempRgbCanvas) {
        addOperation({
          name: "rgbStack",
          value: { func: drawBox, params: croppedArea }
        });
      }
    }
    if (prevProps.tools.currentTool !== tools.currentTool) {
      if (!tools.currentTool) {
        removeOperation({
          name: "rgbStack",
          value: drawBox
        });
      }
    }
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
    URL.revokeObjectURL(objectUrl);
  }
  handleResize = () => {
    this.setState({ ...this.state, windowWidth: window.innerWidth });
    const { rgbImageRef } = this;
    const { mainRgbCanvas, operationStack, initImage, addEffect } = this.props;
    const rgbCanvas = rgbImageRef.current;
    if (rgbCanvas && mainRgbCanvas) {
      rgbCanvas.width = (window.innerWidth / 1500) * 521;
      rgbCanvas.height = (window.innerHeight / 1200) * 352;
      const { ratio, centerShift_x, centerShift_y } = getRatio(mainRgbCanvas, rgbCanvas);
      initImage({
        operationStack: {
          ...operationStack,
          rgbStack: []
        },
        prevRgbSize: { width: rgbCanvas.width, height: rgbCanvas.height },
        rgbCanvasDimension: getDimension(mainRgbCanvas, ratio, centerShift_x, centerShift_y)
      });
      addEffect({
        name: "rgbStack",
        value: { func: drawCanvasImage, params: [ratio, centerShift_x, centerShift_y] }
      });
    }
  };
  render() {
    const { rgbImageRef } = this;
    return (
      <RgbViewerStyle>
        <canvas
          width={(window.innerWidth / 1500) * 521}
          height={(window.innerHeight / 1200) * 352}
          ref={rgbImageRef}
        ></canvas>
      </RgbViewerStyle>
    );
  }
}

const mapStateToProps = state => ({
  rgbImageUrl: imageSelectors.rgbImageUrl(state),
  mainRgbCanvas: imageSelectors.mainRgbCanvas(state),
  mainDepthCanvas: imageSelectors.mainDepthCanvas(state),
  tempRgbCanvas: imageSelectors.tempRgbCanvas(state),
  tempDepthCanvas: imageSelectors.tempDepthCanvas(state),
  prevRgbSize: imageSelectors.prevRgbSize(state),
  rgbCanvasDimension: imageSelectors.rgbCanvasDimension(state),
  bitmapCanvas: imageSelectors.bitmapCanvas(state),
  layerMode: imageSelectors.layerMode(state),
  tools: imageSelectors.tools(state),
  toolsParameters: imageSelectors.toolsParameters(state),
  parameters: imageSelectors.parameters(state),
  operationStack: imageSelectors.operationStack(state)
});

const mapDispatchToProps = {
  initImage: imageActions.initImage,
  addOperation: imageActions.addOperation,
  removeOperation: imageActions.removeOperation,
  addEffect: imageActions.addEffect
};

export default connect(mapStateToProps, mapDispatchToProps)(RgbViewer);
