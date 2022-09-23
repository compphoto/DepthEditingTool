import React, { Component, createRef } from "react";
import { connect } from "react-redux";
import { imageActions } from "store/image";
import { selectors as imageSelectors } from "store/image";
import DepthViewerStyle from "./style";
import { getImageUrl } from "utils/generalUtils";
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
  getBoundingBox,
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
      memoryDepthCanvas,
      isEffectNew,
      prevDepthSize,
      scribbleParams,
      depthScaleParams,
      boxParams,
      isPanActive,
      activeDepthTool,
      parameters,
      operationStack,
      initImage,
      initDepth,
      initLayer,
      addLayer,
      storeScaleParams,
      storeParameters,
      addEffect
    } = this.props;
    let depthCanvas = depthImageRef.current;
    let depthContext = depthCanvas.getContext("2d");
    // Load image and initialize main depth canvas
    if (prevProps.depthImageUrl !== depthImageUrl) {
      depthContext.clearRect(0, 0, prevDepthSize.width, prevDepthSize.height);
      let depthImage = new Image();
      if (typeof depthImageUrl === "object") {
        objectUrl = getImageUrl(depthImageUrl);
        depthImage.src = objectUrl;
      } else {
        depthImage.src = depthImageUrl;
      }
      depthImage.onload = () => {
        let maxi = Math.max(depthImage.height, depthImage.width);
        if (maxi > 1000) {
          depthImage = canvasResize(depthImage);
        } else {
          maxi = null;
        }
        initImage({ depthImageSize: maxi });
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
            func: drawCanvasImage,
            params: []
          }
        });
        initLayer();
        addLayer();
      }
    }
    // If operation is added to the stack, rerun all operations in operation stack
    if (prevProps.operationStack.depthStack !== operationStack.depthStack) {
      if (mainDepthCanvas) {
        if (isEffectNew) {
          runDepthOperations(mainDepthCanvas);
        } else {
          runCachedDepthOperations(mainDepthCanvas);
        }
      }
    }
    if (
      prevProps.memoryDepthCanvas !== memoryDepthCanvas ||
      prevProps.parameters.histogramParams.pixelRange !== parameters.histogramParams.pixelRange ||
      prevProps.depthScaleParams !== depthScaleParams ||
      prevProps.boxParams.end !== boxParams.end
    ) {
      if (memoryDepthCanvas) {
        const { ratio, centerShift_x, centerShift_y, translatePos, scale } = depthScaleParams;
        drawScaledCanvasImage(memoryDepthCanvas, depthCanvas, ratio, centerShift_x, centerShift_y, scale, translatePos);
        if (parameters.histogramParams.pixelRange || parameters.croppedArea) {
          const { croppedArea, histogramParams } = parameters;
          let newArea = null;
          if (croppedArea) {
            newArea = croppedArea;
          } else {
            newArea = getBoundingArea(memoryDepthCanvas);
          }
          highlightPixelArea(
            depthCanvas,
            downScaleBox(newArea, ratio, centerShift_x, centerShift_y, translatePos, scale),
            histogramParams.pixelRange
          );
        }
        if (parameters.croppedArea) {
          drawBox(
            depthCanvas,
            downScaleBox(parameters.croppedArea, ratio, centerShift_x, centerShift_y, translatePos, scale)
          );
        }
        if (boxParams.end) {
          let { x1, y1 } = boxParams.start;
          let { x2, y2 } = boxParams.end;
          let croppedArea = getBoundingBox(x1, y1, x2, y2, memoryDepthCanvas, depthScaleParams);
          if (croppedArea) drawBox(depthCanvas, croppedArea);
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
    if (prevProps.isPanActive !== isPanActive) {
      if (isPanActive && activeDepthTool) {
        depthCanvas.removeEventListener("mousedown", this.handleMouseDown);
        depthCanvas.removeEventListener("mouseup", this.handleMouseUp);
        depthCanvas.removeEventListener("mouseout", this.handleMouseUp);
        depthCanvas.removeEventListener("mouseover", this.handleMouseUp);
        depthCanvas.removeEventListener("mousemove", this.handleMouseMove);
      }
      if (!isPanActive && activeDepthTool) {
        depthCanvas.addEventListener("mousedown", this.handleMouseDown);
        depthCanvas.addEventListener("mouseup", this.handleMouseUp);
        depthCanvas.addEventListener("mouseout", this.handleMouseUp);
        depthCanvas.addEventListener("mouseover", this.handleMouseUp);
        depthCanvas.addEventListener("mousemove", this.handleMouseMove);
      }
    }
    // Listens for mouse movements around the depth canvas and draw bounding box
    if (prevProps.activeDepthTool !== activeDepthTool) {
      if (activeDepthTool) {
        if (!isPanActive) {
          depthCanvas.addEventListener("mousedown", this.handleMouseDown);
          depthCanvas.addEventListener("mouseup", this.handleMouseUp);
          depthCanvas.addEventListener("mouseout", this.handleMouseUp);
          depthCanvas.addEventListener("mouseover", this.handleMouseUp);
          depthCanvas.addEventListener("mousemove", this.handleMouseMove);
        } else {
          depthCanvas.removeEventListener("mousedown", this.handleMouseDown);
          depthCanvas.removeEventListener("mouseup", this.handleMouseUp);
          depthCanvas.removeEventListener("mouseout", this.handleMouseUp);
          depthCanvas.removeEventListener("mouseover", this.handleMouseUp);
          depthCanvas.removeEventListener("mousemove", this.handleMouseMove);
        }
      } else {
        depthCanvas.removeEventListener("mousedown", this.handleMouseDown);
        depthCanvas.removeEventListener("mouseup", this.handleMouseUp);
        depthCanvas.removeEventListener("mouseout", this.handleMouseUp);
        depthCanvas.removeEventListener("mouseover", this.handleMouseUp);
        depthCanvas.removeEventListener("mousemove", this.handleMouseMove);
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
    depthCanvas.removeEventListener("mousedown", this.handleMouseDown);
    depthCanvas.removeEventListener("mouseup", this.handleMouseUp);
    depthCanvas.removeEventListener("mouseout", this.handleMouseUp);
    depthCanvas.removeEventListener("mouseover", this.handleMouseUp);
    depthCanvas.removeEventListener("mousemove", this.handleMouseMove);
    URL.revokeObjectURL(objectUrl);
  }
  handleResize = () => {
    const { memoryDepthCanvas, scribbleParams, depthScaleParams, parameters, boxParams, initImage, storeScaleParams } =
      this.props;
    const { translatePos, scale } = depthScaleParams;
    const depthCanvas = this.depthImageRef.current;
    this.setState({ ...this.state, windowWidth: window.innerWidth });
    if (depthCanvas && memoryDepthCanvas) {
      depthCanvas.width = (window.innerWidth / 1500) * 521;
      depthCanvas.height = (window.innerHeight / 1200) * 352;
      const { ratio, centerShift_x, centerShift_y } = getRatio(memoryDepthCanvas, depthCanvas);
      initImage({
        prevDepthSize: { width: depthCanvas.width, height: depthCanvas.height }
      });
      storeScaleParams({ name: "depthScaleParams", value: { ratio, centerShift_x, centerShift_y } });
      drawScaledCanvasImage(memoryDepthCanvas, depthCanvas, ratio, centerShift_x, centerShift_y, scale, translatePos);
      if (parameters.histogramParams.pixelRange || parameters.croppedArea) {
        const { croppedArea, histogramParams } = parameters;
        let newArea = null;
        if (croppedArea) {
          newArea = croppedArea;
        } else {
          newArea = getBoundingArea(memoryDepthCanvas);
        }
        highlightPixelArea(
          depthCanvas,
          downScaleBox(newArea, ratio, centerShift_x, centerShift_y, translatePos, scale),
          histogramParams.pixelRange
        );
      }
      if (parameters.croppedArea) {
        drawBox(
          depthCanvas,
          downScaleBox(parameters.croppedArea, ratio, centerShift_x, centerShift_y, translatePos, scale)
        );
      }
      if (boxParams.end) {
        let { x1, y1 } = boxParams.start;
        let { x2, y2 } = boxParams.end;
        let croppedArea = getBoundingBox(x1, y1, x2, y2, memoryDepthCanvas, depthScaleParams);
        if (croppedArea) drawBox(depthCanvas, croppedArea);
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
  handleMouseDown = event => {
    let { memoryDepthCanvas, storeParameters, storeBoxParams } = this.props;
    if (memoryDepthCanvas) {
      const depthCanvas = this.depthImageRef.current;
      depthCanvas.style.cursor = "crosshair";
      let x = event.offsetX;
      let y = event.offsetY;
      storeBoxParams({
        start: { x1: x, y1: y },
        end: null
      });
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
  };
  handleMouseMove = event => {
    let { memoryDepthCanvas, boxParams, storeBoxParams } = this.props;
    if (event.buttons !== 1 || !boxParams.start) return;
    if (memoryDepthCanvas) {
      let x = event.offsetX;
      let y = event.offsetY;
      storeBoxParams({
        end: { x2: x, y2: y }
      });
    }
  };
  handleMouseUp = () => {
    let { memoryDepthCanvas, boxParams, depthScaleParams, storeBoxParams, storeParameters } = this.props;
    if (memoryDepthCanvas && boxParams.end) {
      let { x1, y1 } = boxParams.start;
      let { x2, y2 } = boxParams.end;
      let croppedArea = getBoundingBox(x1, y1, x2, y2, memoryDepthCanvas, depthScaleParams);
      if (croppedArea) {
        const { ratio, centerShift_x, centerShift_y, translatePos, scale } = depthScaleParams;
        croppedArea = upScaleBox(croppedArea, ratio, centerShift_x, centerShift_y, translatePos, scale);
        storeParameters({
          croppedCanvasImage: cropCanvas(memoryDepthCanvas, croppedArea),
          croppedArea: croppedArea
        });
      }
    }
    const depthCanvas = this.depthImageRef.current;
    depthCanvas.style.cursor = "default";
    storeBoxParams({
      start: null,
      end: null
    });
  };
  render() {
    const { depthImageRef } = this;
    const {
      memoryDepthCanvas,
      rgbScaleParams,
      depthScaleParams,
      parameters,
      isPanActive,
      activeDepthTool,
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
          style={{ cursor: isPanActive ? "grab" : "default" }}
          onMouseDown={e => {
            if (activeDepthTool) {
              if (activeDepthTool && SelectionBox[activeDepthTool].type === "scribble") {
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
              }
            }
            if (isPanActive) {
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
          }}
          onMouseUp={e => {
            if (activeDepthTool) {
              if (activeDepthTool && SelectionBox[activeDepthTool].type === "scribble") {
                if (Array.isArray(scribbleParams.path) || scribbleParams.path.length) {
                  if (activeDepthTool) {
                    let range = getScribbleRange(memoryDepthCanvas, scribbleParams.path);
                    storeParameters({
                      histogramParams: {
                        ...parameters.histogramParams,
                        pixelRange: range
                      }
                    });
                  }
                }
              }
            }
            if (isPanActive) {
              rgbScaleParams.mouseDown && storeScaleParams({ name: "rgbScaleParams", value: { mouseDown: false } });
              depthScaleParams.mouseDown && storeScaleParams({ name: "depthScaleParams", value: { mouseDown: false } });
            }
          }}
          onMouseOver={e => {
            if (activeDepthTool) {
              if (activeDepthTool && SelectionBox[activeDepthTool].type === "scribble") {
              }
            }
            if (isPanActive) {
              rgbScaleParams.mouseDown && storeScaleParams({ name: "rgbScaleParams", value: { mouseDown: false } });
              depthScaleParams.mouseDown && storeScaleParams({ name: "depthScaleParams", value: { mouseDown: false } });
            }
          }}
          onMouseOut={e => {
            if (activeDepthTool) {
              if (activeDepthTool && SelectionBox[activeDepthTool].type === "scribble") {
              }
            }
            if (isPanActive) {
              rgbScaleParams.mouseDown && storeScaleParams({ name: "rgbScaleParams", value: { mouseDown: false } });
              depthScaleParams.mouseDown && storeScaleParams({ name: "depthScaleParams", value: { mouseDown: false } });
            }
          }}
          onMouseEnter={e => {
            if (activeDepthTool) {
              if (activeDepthTool && SelectionBox[activeDepthTool].type === "scribble") {
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
              }
            }
            if (isPanActive) {
            }
          }}
          onMouseMove={e => {
            if (activeDepthTool) {
              if (activeDepthTool && SelectionBox[activeDepthTool].type === "scribble") {
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
              }
            }
            if (isPanActive) {
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
          }}
        ></canvas>
      </DepthViewerStyle>
    );
  }
}

const mapStateToProps = state => ({
  depthImageUrl: imageSelectors.depthImageUrl(state),
  mainDepthCanvas: imageSelectors.mainDepthCanvas(state),
  memoryDepthCanvas: imageSelectors.memoryDepthCanvas(state),
  isEffectNew: imageSelectors.isEffectNew(state),
  prevDepthSize: imageSelectors.prevDepthSize(state),
  scribbleParams: imageSelectors.scribbleParams(state),
  boxParams: imageSelectors.boxParams(state),
  rgbScaleParams: imageSelectors.rgbScaleParams(state),
  depthScaleParams: imageSelectors.depthScaleParams(state),
  isPanActive: imageSelectors.isPanActive(state),
  activeDepthTool: imageSelectors.activeDepthTool(state),
  parameters: imageSelectors.parameters(state),
  operationStack: imageSelectors.operationStack(state)
});

const mapDispatchToProps = {
  initImage: imageActions.initImage,
  initDepth: imageActions.initDepth,
  initLayer: imageActions.initLayer,
  addLayer: imageActions.addLayer,
  storeScribbleParams: imageActions.storeScribbleParams,
  storeBoxParams: imageActions.storeBoxParams,
  storeScaleParams: imageActions.storeScaleParams,
  storeParameters: imageActions.storeParameters,
  addEffect: imageActions.addEffect
};

export default connect(mapStateToProps, mapDispatchToProps)(DepthViewer);
