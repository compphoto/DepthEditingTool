import React, { Component, createRef } from "react";
import { connect } from "react-redux";
import { imageActions } from "store/image";
import { selectors as imageSelectors } from "store/image";
import DepthViewerStyle from "./style";
import { getImageUrl } from "utils/getImageFromFile";
import {
  cloneCanvas,
  drawCanvasImage,
  cropCanvas,
  highlightPixelArea,
  getRatio,
  getDimension,
  drawBox,
  drawScaledCanvasImage,
  getBoundingArea,
  upScaleBox,
  downScaleBox,
  drawScribble,
  upScalePoint,
  downScalePoint,
  getScribbleRange,
  boxToDimension,
  canvasResize
} from "utils/canvasUtils";
import { runDepthOperations, runCachedDepthOperations } from "utils/stackOperations";
import { SelectionBox } from "config/toolBox";
import { getScribbleValues } from "utils/calculation";

let objectUrl = null;

class DepthViewer extends Component {
  constructor() {
    super();
    this.depthImageRef = createRef();
  }
  state = {
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    initBoundingBox: null
  };
  componentDidMount() {
    this.handleResize();
    window.addEventListener("resize", this.handleResize);
  }
  componentDidUpdate(prevProps) {
    let { depthImageRef } = this;
    let {
      depthImageUrl,
      mainDepthCanvas,
      displayDepthCanvas,
      prevDepthSize,
      scribbleParams,
      depthScaleParams,
      tools,
      parameters,
      operationStack,
      initImage,
      initDepth,
      initLayer,
      storeScaleParams,
      storeParameters,
      addOperation,
      addEffect
    } = this.props;
    let depthCanvas = depthImageRef.current;
    let depthContext = depthCanvas.getContext("2d");
    // Load image and initialize main depth canvas
    if (prevProps.depthImageUrl !== depthImageUrl) {
      depthContext.clearRect(0, 0, prevDepthSize.width, prevDepthSize.height);
      let depthImage = new Image();
      objectUrl = getImageUrl(depthImageUrl);
      depthImage.src = objectUrl;
      depthImage.onload = () => {
        if (Math.max(depthImage.height, depthImage.width) > 1000) {
          depthImage = canvasResize(depthImage);
        }
        console.warn(depthImage.height, depthImage.width);
        initDepth(cloneCanvas(depthImage));
      };
    }
    // If main image changes, add draw/redraw canvas to operation
    if (prevProps.mainDepthCanvas !== mainDepthCanvas) {
      if (mainDepthCanvas) {
        const { ratio, centerShift_x, centerShift_y } = getRatio(mainDepthCanvas, depthCanvas);
        initImage({
          prevDepthSize: { width: depthCanvas.width, height: depthCanvas.height }
        });
        storeScaleParams({ name: "depthScaleParams", value: { ratio, centerShift_x, centerShift_y } });
        addEffect({
          name: "depthStack",
          value: {
            func: drawCanvasImage
          }
        });
        initLayer();
      }
    }
    // If operation is added to the stack, rerun all operations in operation stack
    if (prevProps.operationStack.depthStack !== operationStack.depthStack) {
      if (mainDepthCanvas) {
        runDepthOperations(mainDepthCanvas);
        // let prevStack = prevProps.operationStack.depthStack;
        // let currentStack = operationStack.depthStack;
        // console.warn("current", currentStack);
        // console.warn("previous", prevStack);
        // if (
        //   prevStack.length > 1 &&
        //   currentStack.length > 1 &&
        //   prevStack[prevStack.length - 1].func.toString() === currentStack[currentStack.length - 1].func.toString()
        // ) {
        //   console.warn("called cache");
        //   runCachedDepthOperations(mainDepthCanvas);
        // } else {
        //   runDepthOperations(mainDepthCanvas);
        // }
      }
    }
    if (
      prevProps.displayDepthCanvas !== displayDepthCanvas ||
      prevProps.depthScaleParams !== depthScaleParams ||
      prevProps.parameters.croppedArea !== parameters.croppedArea
    ) {
      if (displayDepthCanvas) {
        const { ratio, centerShift_x, centerShift_y, translatePos, scale } = depthScaleParams;
        drawScaledCanvasImage(
          displayDepthCanvas,
          depthCanvas,
          ratio,
          centerShift_x,
          centerShift_y,
          scale,
          translatePos
        );
        if (parameters.croppedArea) {
          drawBox(
            depthCanvas,
            downScaleBox(parameters.croppedArea, ratio, centerShift_x, centerShift_y, translatePos, scale)
          );
        }
        if (Array.isArray(scribbleParams.path) || scribbleParams.path.length) {
          for (let i = 0; i < scribbleParams.path.length; i++) {
            drawScribble(
              depthCanvas.getContext("2d"),
              downScalePoint(scribbleParams.path[i].start, ratio, centerShift_x, centerShift_y, translatePos, scale),
              downScalePoint(scribbleParams.path[i].end, ratio, centerShift_x, centerShift_y, translatePos, scale)
            );
          }
        }
      } else {
        let depthContext = depthCanvas.getContext("2d");
        depthContext.clearRect(0, 0, depthCanvas.width, depthCanvas.height);
      }
    }
    // Highlight pixel range from specified range for either cropped image or initial full image
    if (prevProps.parameters.histogramParams.pixelRange !== parameters.histogramParams.pixelRange) {
      if (parameters.histogramParams.pixelRange || parameters.croppedArea) {
        const { croppedArea, histogramParams } = parameters;
        let newArea = null;
        if (croppedArea) {
          newArea = croppedArea;
        } else {
          newArea = getBoundingArea(displayDepthCanvas);
        }
        addOperation({
          name: "depthStack",
          value: { func: highlightPixelArea, params: [newArea, histogramParams.pixelRange] }
        });
      }
    }
    // Listens for mouse movements around the depth canvas and draw bounding box
    if (prevProps.tools.currentTool !== tools.currentTool && tools.currentTool) {
      if (SelectionBox[tools.currentTool].type === "boundingBox") {
        depthCanvas.addEventListener("click", this.drawBoundingBox);
      } else {
        depthCanvas.style.cursor = "default";
        depthCanvas.removeEventListener("click", this.drawBoundingBox);
        storeParameters({
          croppedCanvasImage: null,
          croppedArea: null,
          histogramParams: {
            pixelRange: [0, 255],
            domain: [0, 255],
            values: [0, 255],
            update: [0, 255]
          }
        });
      }
    }
  }
  componentWillUnmount() {
    let depthCanvas = this.depthImageRef.current;
    window.removeEventListener("resize", this.handleResize);
    depthCanvas.removeEventListener("click", this.drawBoundingBox);
    URL.revokeObjectURL(objectUrl);
  }
  handleResize = () => {
    const { displayDepthCanvas, scribbleParams, depthScaleParams, parameters, initImage, storeScaleParams } =
      this.props;
    const { translatePos, scale } = depthScaleParams;
    const depthCanvas = this.depthImageRef.current;
    this.setState({ ...this.state, windowWidth: window.innerWidth });
    if (depthCanvas && displayDepthCanvas) {
      depthCanvas.width = (window.innerWidth / 1500) * 521;
      depthCanvas.height = (window.innerHeight / 1200) * 352;
      const { ratio, centerShift_x, centerShift_y } = getRatio(displayDepthCanvas, depthCanvas);
      initImage({
        prevDepthSize: { width: depthCanvas.width, height: depthCanvas.height }
      });
      storeScaleParams({ name: "depthScaleParams", value: { ratio, centerShift_x, centerShift_y } });
      drawScaledCanvasImage(displayDepthCanvas, depthCanvas, ratio, centerShift_x, centerShift_y, scale, translatePos);
      if (parameters.croppedArea) {
        drawBox(
          depthCanvas,
          downScaleBox(parameters.croppedArea, ratio, centerShift_x, centerShift_y, translatePos, scale)
        );
      }
      if (Array.isArray(scribbleParams.path) || scribbleParams.path.length) {
        for (let i = 0; i < scribbleParams.path.length; i++) {
          drawScribble(
            depthCanvas.getContext("2d"),
            downScalePoint(scribbleParams.path[i].start, ratio, centerShift_x, centerShift_y, translatePos, scale),
            downScalePoint(scribbleParams.path[i].end, ratio, centerShift_x, centerShift_y, translatePos, scale)
          );
        }
      }
    }
  };
  drawBoundingBox = event => {
    let depthCanvas = this.depthImageRef.current;
    let { initBoundingBox } = this.state;
    let { memoryDepthCanvas, depthScaleParams, storeParameters } = this.props;
    let { ratio, centerShift_x, centerShift_y, translatePos, scale } = depthScaleParams;
    if (memoryDepthCanvas) {
      let x = event.offsetX;
      let y = event.offsetY;
      if (initBoundingBox) {
        let depthCanvasDimension = getDimension(
          memoryDepthCanvas,
          ratio,
          centerShift_x,
          centerShift_y,
          translatePos,
          scale
        );
        let [image_x1, image_y1, image_x2, image_y2] = depthCanvasDimension;
        console.warn("X ", x, " X Dimension", image_x1, " ", image_x2);
        console.warn("Y ", y, " Y Dimension", image_y1, " ", image_y2);
        let new_x = Math.max(Math.min(initBoundingBox.x, x), image_x1);
        let new_y = Math.max(Math.min(initBoundingBox.y, y), image_y1);
        let new_w = Math.min(Math.max(initBoundingBox.x, x), image_x2) - new_x;
        let new_h = Math.min(Math.max(initBoundingBox.y, y), image_y2) - new_y;
        if (
          new_x >= image_x1 &&
          new_x <= image_x2 &&
          new_y >= image_y1 &&
          new_y <= image_y2 &&
          new_x + new_w <= image_x2 &&
          new_x + new_w >= image_x1 &&
          new_y + new_h <= image_y2 &&
          new_y + new_h >= image_y1
        ) {
          if (new_w !== 0 || new_w !== 0) {
            let croppedArea = upScaleBox(
              [new_x, new_y, new_w, new_h],
              ratio,
              centerShift_x,
              centerShift_y,
              translatePos,
              scale
            );
            this.setState({ initBoundingBox: null }, () => {
              depthCanvas.style.cursor = "default";
              storeParameters({
                croppedCanvasImage: cropCanvas(memoryDepthCanvas, croppedArea),
                croppedArea: croppedArea
              });
            });
          }
        }
      } else {
        this.setState({ initBoundingBox: { x, y } }, () => {
          depthCanvas.style.cursor = "crosshair";
          storeParameters({
            croppedArea: null,
            histogramParams: {
              pixelRange: [0, 255],
              domain: [0, 255],
              values: [0, 255],
              update: [0, 255]
            }
          });
        });
      }
    }
  };
  render() {
    const { depthImageRef } = this;
    const {
      memoryDepthCanvas,
      rgbScaleParams,
      depthScaleParams,
      parameters,
      tools,
      scribbleParams,
      storeScribbleParams,
      storeScaleParams,
      storeParameters
    } = this.props;
    const depthCanvas = depthImageRef.current;
    return (
      <DepthViewerStyle>
        <canvas
          width={(window.innerWidth / 1500) * 521}
          height={(window.innerHeight / 1200) * 352}
          ref={depthImageRef}
          onMouseDown={e => {
            if (tools.currentTool) {
              if (SelectionBox[tools.currentTool].type === "scribble") {
                const { croppedArea } = parameters;
                let { ratio, centerShift_x, centerShift_y, translatePos, scale } = depthScaleParams;
                let dimension = null;
                if (croppedArea) {
                  dimension = boxToDimension(croppedArea);
                } else {
                  dimension = getDimension(memoryDepthCanvas, ratio, centerShift_x, centerShift_y, translatePos, scale);
                }
                let [x, y] = getScribbleValues(
                  e.clientX - depthCanvas.offsetLeft,
                  e.clientY - depthCanvas.offsetTop,
                  dimension
                );
                storeScribbleParams({
                  pos: { x, y }
                });
              } else if (SelectionBox[tools.currentTool].type === "pan") {
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
              if (SelectionBox[tools.currentTool].type === "scribble") {
                if (Array.isArray(scribbleParams.path) || scribbleParams.path.length) {
                  let range = getScribbleRange(memoryDepthCanvas, scribbleParams.path);
                  storeParameters({
                    histogramParams: {
                      ...parameters.histogramParams,
                      pixelRange: range
                    }
                  });
                }
              } else if (SelectionBox[tools.currentTool].type === "pan") {
                rgbScaleParams.mouseDown && storeScaleParams({ name: "rgbScaleParams", value: { mouseDown: false } });
                depthScaleParams.mouseDown &&
                  storeScaleParams({ name: "depthScaleParams", value: { mouseDown: false } });
              }
            }
          }}
          onMouseOver={e => {
            if (tools.currentTool) {
              if (SelectionBox[tools.currentTool].type === "scribble") {
              } else if (SelectionBox[tools.currentTool].type === "pan") {
                rgbScaleParams.mouseDown && storeScaleParams({ name: "rgbScaleParams", value: { mouseDown: false } });
                depthScaleParams.mouseDown &&
                  storeScaleParams({ name: "depthScaleParams", value: { mouseDown: false } });
              }
            }
          }}
          onMouseOut={e => {
            if (tools.currentTool) {
              if (SelectionBox[tools.currentTool].type === "scribble") {
              } else if (SelectionBox[tools.currentTool].type === "pan") {
                rgbScaleParams.mouseDown && storeScaleParams({ name: "rgbScaleParams", value: { mouseDown: false } });
                depthScaleParams.mouseDown &&
                  storeScaleParams({ name: "depthScaleParams", value: { mouseDown: false } });
              }
            }
          }}
          onMouseEnter={e => {
            if (tools.currentTool) {
              if (SelectionBox[tools.currentTool].type === "scribble") {
                const { croppedArea } = parameters;
                let { ratio, centerShift_x, centerShift_y, translatePos, scale } = depthScaleParams;
                let dimension = null;
                if (croppedArea) {
                  dimension = boxToDimension(croppedArea);
                } else {
                  dimension = getDimension(memoryDepthCanvas, ratio, centerShift_x, centerShift_y, translatePos, scale);
                }
                let [x, y] = getScribbleValues(
                  e.clientX - depthCanvas.offsetLeft,
                  e.clientY - depthCanvas.offsetTop,
                  dimension
                );
                storeScribbleParams({
                  pos: { x, y }
                });
              } else if (SelectionBox[tools.currentTool].type === "pan") {
              }
            }
          }}
          onMouseMove={e => {
            if (tools.currentTool) {
              if (SelectionBox[tools.currentTool].type === "scribble") {
                if (e.buttons !== 1) return;
                const { croppedArea } = parameters;
                let { ratio, centerShift_x, centerShift_y, translatePos, scale } = depthScaleParams;
                let dimension = null;
                if (croppedArea) {
                  dimension = boxToDimension(croppedArea);
                } else {
                  dimension = getDimension(memoryDepthCanvas, ratio, centerShift_x, centerShift_y, translatePos, scale);
                }
                let [x, y] = getScribbleValues(
                  e.clientX - depthCanvas.offsetLeft,
                  e.clientY - depthCanvas.offsetTop,
                  dimension
                );
                const depthContext = depthCanvas.getContext("2d");
                let start = { x: scribbleParams.pos.x, y: scribbleParams.pos.y };
                let end = { x, y };
                drawScribble(depthContext, start, end);
                storeScribbleParams({
                  pos: { x, y },
                  path: [
                    ...scribbleParams.path,
                    {
                      start: upScalePoint(start, ratio, centerShift_x, centerShift_y, translatePos, scale),
                      end: upScalePoint(end, ratio, centerShift_x, centerShift_y, translatePos, scale)
                    }
                  ]
                });
              } else if (SelectionBox[tools.currentTool].type === "pan") {
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
      </DepthViewerStyle>
    );
  }
}

const mapStateToProps = state => ({
  depthImageUrl: imageSelectors.depthImageUrl(state),
  mainDepthCanvas: imageSelectors.mainDepthCanvas(state),
  displayDepthCanvas: imageSelectors.displayDepthCanvas(state),
  memoryDepthCanvas: imageSelectors.memoryDepthCanvas(state),
  prevDepthSize: imageSelectors.prevDepthSize(state),
  scribbleParams: imageSelectors.scribbleParams(state),
  rgbScaleParams: imageSelectors.rgbScaleParams(state),
  depthScaleParams: imageSelectors.depthScaleParams(state),
  tools: imageSelectors.tools(state),
  toolsParameters: imageSelectors.toolsParameters(state),
  parameters: imageSelectors.parameters(state),
  operationStack: imageSelectors.operationStack(state)
});

const mapDispatchToProps = {
  initImage: imageActions.initImage,
  initDepth: imageActions.initDepth,
  initLayer: imageActions.initLayer,
  storeScribbleParams: imageActions.storeScribbleParams,
  storeScaleParams: imageActions.storeScaleParams,
  storeParameters: imageActions.storeParameters,
  addOperation: imageActions.addOperation,
  addEffect: imageActions.addEffect
};

export default connect(mapStateToProps, mapDispatchToProps)(DepthViewer);
