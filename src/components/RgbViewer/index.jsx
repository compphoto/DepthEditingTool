import React, { Component, createRef } from "react";
import { connect } from "react-redux";
import { imageActions } from "store/image";
import { selectors as imageSelectors } from "store/image";
import RgbViewerStyle from "./style";
import { getImageUrl } from "utils/getImageFromFile";
import {
  canvasResize,
  cloneCanvas,
  downScaleBox,
  drawBox,
  drawCanvasImage,
  drawScaledCanvasImage,
  getBoundingArea,
  getRatio,
  highlightPixelAreaRgb
} from "utils/canvasUtils";
import { runRgbOperations } from "utils/stackOperations";
import { SelectionBox } from "config/toolBox";

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
      displayRgbCanvas,
      memoryDepthCanvas,
      rgbScaleParams,
      prevRgbSize,
      parameters,
      operationStack,
      initImage,
      initRgb,
      storeScaleParams,
      addOperation,
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
        if (Math.max(rgbImage.height, rgbImage.width) > 1000) {
          rgbImage = canvasResize(rgbImage);
        }
        initRgb(cloneCanvas(rgbImage));
      };
    }
    // If main image changes, add draw/redraw canvas to operation
    if (prevProps.mainRgbCanvas !== mainRgbCanvas) {
      if (mainRgbCanvas) {
        const { ratio, centerShift_x, centerShift_y } = getRatio(mainRgbCanvas, rgbCanvas);
        initImage({
          prevRgbSize: { width: rgbCanvas.width, height: rgbCanvas.height }
        });
        storeScaleParams({ name: "rgbScaleParams", value: { ratio, centerShift_x, centerShift_y } });
        addEffect({
          name: "rgbStack",
          value: {
            func: drawCanvasImage
          }
        });
      }
    }
    // If operation is added to the stack, rerun all operations in operation stack
    if (prevProps.operationStack.rgbStack !== operationStack.rgbStack) {
      if (mainRgbCanvas) {
        runRgbOperations(mainRgbCanvas);
      }
    }
    if (
      prevProps.displayRgbCanvas !== displayRgbCanvas ||
      prevProps.rgbScaleParams !== rgbScaleParams ||
      prevProps.parameters.croppedArea !== parameters.croppedArea
    ) {
      if (displayRgbCanvas) {
        const { ratio, centerShift_x, centerShift_y, translatePos, scale } = rgbScaleParams;
        drawScaledCanvasImage(displayRgbCanvas, rgbCanvas, ratio, centerShift_x, centerShift_y, scale, translatePos);
        if (parameters.croppedArea) {
          drawBox(
            rgbCanvas,
            downScaleBox(parameters.croppedArea, ratio, centerShift_x, centerShift_y, translatePos, scale)
          );
        }
      } else {
        let rgbContext = rgbCanvas.getContext("2d");
        rgbContext.clearRect(0, 0, rgbCanvas.width, rgbCanvas.height);
      }
    }
    // Highlight pixel range from specified range for either cropped image or initial full image
    if (prevProps.parameters.histogramParams.pixelRange !== parameters.histogramParams.pixelRange) {
      if ((parameters.histogramParams.pixelRange || parameters.croppedArea) && memoryDepthCanvas) {
        const { croppedArea, histogramParams } = parameters;
        const depthContext = memoryDepthCanvas.getContext("2d");
        let newArea = null;
        if (croppedArea) {
          newArea = croppedArea;
        } else {
          newArea = getBoundingArea(displayRgbCanvas);
        }
        addOperation({
          name: "rgbStack",
          value: { func: highlightPixelAreaRgb, params: [depthContext, newArea, histogramParams.pixelRange] }
        });
      }
    }
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
    URL.revokeObjectURL(objectUrl);
  }
  handleResize = () => {
    const { displayRgbCanvas, rgbScaleParams, parameters, initImage, storeScaleParams } = this.props;
    const { translatePos, scale } = rgbScaleParams;
    const rgbCanvas = this.rgbImageRef.current;
    this.setState({ ...this.state, windowWidth: window.innerWidth });
    if (rgbCanvas && displayRgbCanvas) {
      rgbCanvas.width = (window.innerWidth / 1500) * 521;
      rgbCanvas.height = (window.innerHeight / 1200) * 352;
      const { ratio, centerShift_x, centerShift_y } = getRatio(displayRgbCanvas, rgbCanvas);
      initImage({
        prevRgbSize: { width: rgbCanvas.width, height: rgbCanvas.height }
      });
      storeScaleParams({ name: "rgbScaleParams", value: { ratio, centerShift_x, centerShift_y } });
      drawScaledCanvasImage(displayRgbCanvas, rgbCanvas, ratio, centerShift_x, centerShift_y, scale, translatePos);
      if (parameters.croppedArea) {
        drawBox(
          rgbCanvas,
          downScaleBox(parameters.croppedArea, ratio, centerShift_x, centerShift_y, translatePos, scale)
        );
      }
    }
  };
  render() {
    const { rgbImageRef } = this;
    const {
      mainDepthCanvas,
      rgbScaleParams,
      depthScaleParams,
      parameters,
      tools,
      storeScaleParams,
      storeParameters,
      addOperation
    } = this.props;
    return (
      <RgbViewerStyle>
        <canvas
          width={(window.innerWidth / 1500) * 521}
          height={(window.innerHeight / 1200) * 352}
          ref={rgbImageRef}
          onMouseDown={e => {
            if (tools.currentTool) {
              if (SelectionBox[tools.currentTool].type === "pan") {
                storeScaleParams({
                  name: "rgbScaleParams",
                  value: {
                    startDragOffset: {
                      x: e.clientX - rgbScaleParams.translatePos.x,
                      y: e.clientY - rgbScaleParams.translatePos.y
                    },
                    mouseDown: true
                  }
                });
                storeScaleParams({
                  name: "depthScaleParams",
                  value: {
                    startDragOffset: {
                      x: e.clientX - depthScaleParams.translatePos.x,
                      y: e.clientY - depthScaleParams.translatePos.y
                    },
                    mouseDown: true
                  }
                });
              }
            }
          }}
          onMouseUp={e => {
            if (tools.currentTool) {
              if (SelectionBox[tools.currentTool].type === "pan") {
                rgbScaleParams.mouseDown && storeScaleParams({ name: "rgbScaleParams", value: { mouseDown: false } });
                depthScaleParams.mouseDown &&
                  storeScaleParams({ name: "depthScaleParams", value: { mouseDown: false } });
              }
            }
          }}
          onMouseOver={e => {
            if (tools.currentTool) {
              if (SelectionBox[tools.currentTool].type === "pan") {
                rgbScaleParams.mouseDown && storeScaleParams({ name: "rgbScaleParams", value: { mouseDown: false } });
                depthScaleParams.mouseDown &&
                  storeScaleParams({ name: "depthScaleParams", value: { mouseDown: false } });
              }
            }
          }}
          onMouseOut={e => {
            if (tools.currentTool) {
              if (SelectionBox[tools.currentTool].type === "pan") {
                rgbScaleParams.mouseDown && storeScaleParams({ name: "rgbScaleParams", value: { mouseDown: false } });
                depthScaleParams.mouseDown &&
                  storeScaleParams({ name: "depthScaleParams", value: { mouseDown: false } });
              }
            }
          }}
          onMouseMove={e => {
            if (tools.currentTool) {
              if (SelectionBox[tools.currentTool].type === "pan") {
                if (depthScaleParams.mouseDown) {
                  storeScaleParams({
                    name: "rgbScaleParams",
                    value: {
                      translatePos: {
                        x: e.clientX - rgbScaleParams.startDragOffset.x,
                        y: e.clientY - rgbScaleParams.startDragOffset.y
                      }
                    }
                  });
                  storeScaleParams({
                    name: "depthScaleParams",
                    value: {
                      translatePos: {
                        x: e.clientX - depthScaleParams.startDragOffset.x,
                        y: e.clientY - depthScaleParams.startDragOffset.y
                      }
                    }
                  });
                }
              }
            }
          }}
        ></canvas>
      </RgbViewerStyle>
    );
  }
}

const mapStateToProps = state => ({
  rgbImageUrl: imageSelectors.rgbImageUrl(state),
  mainRgbCanvas: imageSelectors.mainRgbCanvas(state),
  mainDepthCanvas: imageSelectors.mainDepthCanvas(state),
  displayRgbCanvas: imageSelectors.displayRgbCanvas(state),
  memoryDepthCanvas: imageSelectors.memoryDepthCanvas(state),
  prevRgbSize: imageSelectors.prevRgbSize(state),
  rgbBitmapCanvas: imageSelectors.rgbBitmapCanvas(state),
  rgbScaleParams: imageSelectors.rgbScaleParams(state),
  depthScaleParams: imageSelectors.depthScaleParams(state),
  tools: imageSelectors.tools(state),
  toolsParameters: imageSelectors.toolsParameters(state),
  parameters: imageSelectors.parameters(state),
  operationStack: imageSelectors.operationStack(state)
});

const mapDispatchToProps = {
  initImage: imageActions.initImage,
  initRgb: imageActions.initRgb,
  storeScaleParams: imageActions.storeScaleParams,
  addOperation: imageActions.addOperation,
  removeOperation: imageActions.removeOperation,
  addEffect: imageActions.addEffect
};

export default connect(mapStateToProps, mapDispatchToProps)(RgbViewer);
