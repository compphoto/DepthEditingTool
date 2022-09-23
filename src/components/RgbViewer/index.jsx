import React, { Component, createRef } from "react";
import { connect } from "react-redux";
import { imageActions } from "store/image";
import { selectors as imageSelectors } from "store/image";
import RgbViewerStyle from "./style";
import { getImageUrl } from "utils/generalUtils";
import {
  canvasLike,
  canvasResize,
  cloneCanvas,
  cropCanvas,
  downScaleBox,
  drawBox,
  drawCanvasImage,
  drawScaledCanvasImage,
  getBoundingArea,
  getBoundingBox,
  upScaleBox,
  getRatio,
  highlightPixelAreaRgb
} from "utils/canvasUtils";
import { runRgbOperations } from "utils/stackOperations";

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
  componentDidUpdate(prevProps) {
    let { rgbImageRef } = this;
    let {
      rgbImageUrl,
      mainRgbCanvas,
      memoryRgbCanvas,
      memoryDepthCanvas,
      boxParams,
      rgbScaleParams,
      prevRgbSize,
      isPanActive,
      activeDepthTool,
      parameters,
      operationStack,
      initImage,
      initRgb,
      storeScaleParams,
      storeParameters,
      addEffect
    } = this.props;
    let rgbCanvas = rgbImageRef.current;
    let rgbContext = rgbCanvas.getContext("2d");
    // Load image and initialize all canvas images
    if (prevProps.rgbImageUrl !== rgbImageUrl) {
      rgbContext.clearRect(0, 0, prevRgbSize.width, prevRgbSize.height);
      let rgbImage = new Image();
      if (typeof rgbImageUrl === "object") {
        objectUrl = getImageUrl(rgbImageUrl);
        rgbImage.src = objectUrl;
      } else {
        rgbImage.src = rgbImageUrl;
      }
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
            func: drawCanvasImage,
            params: []
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
      prevProps.memoryRgbCanvas !== memoryRgbCanvas ||
      prevProps.parameters.histogramParams.pixelRange !== parameters.histogramParams.pixelRange ||
      prevProps.rgbScaleParams !== rgbScaleParams ||
      prevProps.boxParams.end !== boxParams.end
    ) {
      if (memoryRgbCanvas) {
        const { ratio, centerShift_x, centerShift_y, translatePos, scale } = rgbScaleParams;
        drawScaledCanvasImage(memoryRgbCanvas, rgbCanvas, ratio, centerShift_x, centerShift_y, scale, translatePos);
        if ((parameters.histogramParams.pixelRange || parameters.croppedArea) && memoryDepthCanvas) {
          const { croppedArea, histogramParams } = parameters;
          const depthCanvas = canvasLike(rgbCanvas);
          drawScaledCanvasImage(
            memoryDepthCanvas,
            depthCanvas,
            ratio,
            centerShift_x,
            centerShift_y,
            scale,
            translatePos
          );
          const depthContext = depthCanvas.getContext("2d");
          let newArea = null;
          if (croppedArea) {
            newArea = croppedArea;
          } else {
            newArea = getBoundingArea(memoryRgbCanvas);
          }
          highlightPixelAreaRgb(
            rgbCanvas,
            depthContext,
            downScaleBox(newArea, ratio, centerShift_x, centerShift_y, translatePos, scale),
            histogramParams.pixelRange
          );
        }
        if (parameters.croppedArea) {
          drawBox(
            rgbCanvas,
            downScaleBox(parameters.croppedArea, ratio, centerShift_x, centerShift_y, translatePos, scale)
          );
        }
        if (boxParams.end) {
          let { x1, y1 } = boxParams.start;
          let { x2, y2 } = boxParams.end;
          let croppedArea = getBoundingBox(x1, y1, x2, y2, memoryRgbCanvas, rgbScaleParams);
          if (croppedArea) drawBox(rgbCanvas, croppedArea);
        }
      } else {
        let rgbContext = rgbCanvas.getContext("2d");
        rgbContext.clearRect(0, 0, rgbCanvas.width, rgbCanvas.height);
      }
    }
    if (prevProps.isPanActive !== isPanActive) {
      if (isPanActive && activeDepthTool) {
        rgbCanvas.removeEventListener("mousedown", this.handleMouseDown);
        rgbCanvas.removeEventListener("mouseup", this.handleMouseUp);
        rgbCanvas.removeEventListener("mouseout", this.handleMouseUp);
        rgbCanvas.removeEventListener("mouseover", this.handleMouseUp);
        rgbCanvas.removeEventListener("mousemove", this.handleMouseMove);
      }
      if (!isPanActive && activeDepthTool) {
        rgbCanvas.addEventListener("mousedown", this.handleMouseDown);
        rgbCanvas.addEventListener("mouseup", this.handleMouseUp);
        rgbCanvas.addEventListener("mouseout", this.handleMouseUp);
        rgbCanvas.addEventListener("mouseover", this.handleMouseUp);
        rgbCanvas.addEventListener("mousemove", this.handleMouseMove);
      }
    }
    // Listens for mouse movements around the depth canvas and draw bounding box
    if (prevProps.activeDepthTool !== activeDepthTool) {
      if (activeDepthTool) {
        if (!isPanActive) {
          rgbCanvas.addEventListener("mousedown", this.handleMouseDown);
          rgbCanvas.addEventListener("mouseup", this.handleMouseUp);
          rgbCanvas.addEventListener("mouseout", this.handleMouseUp);
          rgbCanvas.addEventListener("mouseover", this.handleMouseUp);
          rgbCanvas.addEventListener("mousemove", this.handleMouseMove);
        } else {
          rgbCanvas.removeEventListener("mousedown", this.handleMouseDown);
          rgbCanvas.removeEventListener("mouseup", this.handleMouseUp);
          rgbCanvas.removeEventListener("mouseout", this.handleMouseUp);
          rgbCanvas.removeEventListener("mouseover", this.handleMouseUp);
          rgbCanvas.removeEventListener("mousemove", this.handleMouseMove);
        }
      } else {
        rgbCanvas.removeEventListener("mousedown", this.handleMouseDown);
        rgbCanvas.removeEventListener("mouseup", this.handleMouseUp);
        rgbCanvas.removeEventListener("mouseout", this.handleMouseUp);
        rgbCanvas.removeEventListener("mouseover", this.handleMouseUp);
        rgbCanvas.removeEventListener("mousemove", this.handleMouseMove);
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
    let rgbCanvas = this.rgbImageRef.current;
    window.removeEventListener("resize", this.handleResize);
    rgbCanvas.removeEventListener("mousedown", this.handleMouseDown);
    rgbCanvas.removeEventListener("mouseup", this.handleMouseUp);
    rgbCanvas.removeEventListener("mouseout", this.handleMouseUp);
    rgbCanvas.removeEventListener("mouseover", this.handleMouseUp);
    rgbCanvas.removeEventListener("mousemove", this.handleMouseMove);
    URL.revokeObjectURL(objectUrl);
  }
  handleResize = () => {
    const { memoryRgbCanvas, memoryDepthCanvas, rgbScaleParams, boxParams, parameters, initImage, storeScaleParams } =
      this.props;
    const { translatePos, scale } = rgbScaleParams;
    const rgbCanvas = this.rgbImageRef.current;
    this.setState({ ...this.state, windowWidth: window.innerWidth });
    if (rgbCanvas && memoryRgbCanvas) {
      rgbCanvas.width = (window.innerWidth / 1500) * 521;
      rgbCanvas.height = (window.innerHeight / 1200) * 352;
      const { ratio, centerShift_x, centerShift_y } = getRatio(memoryRgbCanvas, rgbCanvas);
      initImage({
        prevRgbSize: { width: rgbCanvas.width, height: rgbCanvas.height }
      });
      storeScaleParams({ name: "rgbScaleParams", value: { ratio, centerShift_x, centerShift_y } });
      drawScaledCanvasImage(memoryRgbCanvas, rgbCanvas, ratio, centerShift_x, centerShift_y, scale, translatePos);
      if ((parameters.histogramParams.pixelRange || parameters.croppedArea) && memoryDepthCanvas) {
        const { croppedArea, histogramParams } = parameters;
        const depthCanvas = canvasLike(rgbCanvas);
        drawScaledCanvasImage(memoryDepthCanvas, depthCanvas, ratio, centerShift_x, centerShift_y, scale, translatePos);
        const depthContext = depthCanvas.getContext("2d");
        let newArea = null;
        if (croppedArea) {
          newArea = croppedArea;
        } else {
          newArea = getBoundingArea(memoryRgbCanvas);
        }
        highlightPixelAreaRgb(
          rgbCanvas,
          depthContext,
          downScaleBox(newArea, ratio, centerShift_x, centerShift_y, translatePos, scale),
          histogramParams.pixelRange
        );
      }
      if (parameters.croppedArea) {
        drawBox(
          rgbCanvas,
          downScaleBox(parameters.croppedArea, ratio, centerShift_x, centerShift_y, translatePos, scale)
        );
      }
      if (boxParams.end) {
        let { x1, y1 } = boxParams.start;
        let { x2, y2 } = boxParams.end;
        let croppedArea = getBoundingBox(x1, y1, x2, y2, memoryRgbCanvas, rgbScaleParams);
        if (croppedArea) drawBox(rgbCanvas, croppedArea);
      }
    }
  };
  handleMouseDown = event => {
    let { memoryRgbCanvas, storeParameters, storeBoxParams } = this.props;
    if (memoryRgbCanvas) {
      const rgbCanvas = this.rgbImageRef.current;
      rgbCanvas.style.cursor = "crosshair";
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
    let { memoryRgbCanvas, boxParams, storeBoxParams } = this.props;
    if (event.buttons !== 1 || !boxParams.start) return;
    if (memoryRgbCanvas) {
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
    const rgbCanvas = this.rgbImageRef.current;
    rgbCanvas.style.cursor = "default";
    storeBoxParams({
      start: null,
      end: null
    });
  };
  render() {
    const { rgbImageRef } = this;
    const { rgbScaleParams, depthScaleParams, isPanActive, activeDepthTool, storeScaleParams } = this.props;
    return (
      <RgbViewerStyle>
        <canvas
          width={(window.innerWidth / 1500) * 521}
          height={(window.innerHeight / 1200) * 352}
          ref={rgbImageRef}
          style={{ cursor: isPanActive ? "grab" : "default" }}
          onMouseDown={e => {
            if (activeDepthTool) {
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
            }
            if (isPanActive) {
              rgbScaleParams.mouseDown && storeScaleParams({ name: "rgbScaleParams", value: { mouseDown: false } });
              depthScaleParams.mouseDown && storeScaleParams({ name: "depthScaleParams", value: { mouseDown: false } });
            }
          }}
          onMouseOver={e => {
            if (activeDepthTool) {
            }
            if (isPanActive) {
              rgbScaleParams.mouseDown && storeScaleParams({ name: "rgbScaleParams", value: { mouseDown: false } });
              depthScaleParams.mouseDown && storeScaleParams({ name: "depthScaleParams", value: { mouseDown: false } });
            }
          }}
          onMouseOut={e => {
            if (activeDepthTool) {
            }
            if (isPanActive) {
              rgbScaleParams.mouseDown && storeScaleParams({ name: "rgbScaleParams", value: { mouseDown: false } });
              depthScaleParams.mouseDown && storeScaleParams({ name: "depthScaleParams", value: { mouseDown: false } });
            }
          }}
          onMouseMove={e => {
            if (activeDepthTool) {
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
      </RgbViewerStyle>
    );
  }
}

const mapStateToProps = state => ({
  rgbImageUrl: imageSelectors.rgbImageUrl(state),
  mainRgbCanvas: imageSelectors.mainRgbCanvas(state),
  memoryRgbCanvas: imageSelectors.memoryRgbCanvas(state),
  memoryDepthCanvas: imageSelectors.memoryDepthCanvas(state),
  prevRgbSize: imageSelectors.prevRgbSize(state),
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
  initRgb: imageActions.initRgb,
  storeBoxParams: imageActions.storeBoxParams,
  storeScaleParams: imageActions.storeScaleParams,
  storeParameters: imageActions.storeParameters,
  addEffect: imageActions.addEffect
};

export default connect(mapStateToProps, mapDispatchToProps)(RgbViewer);
