import React, { Component, createRef } from "react";
import { connect } from "react-redux";
import { imageActions } from "store/image";
import { selectors as imageSelectors } from "store/image";
import DepthViewerStyle from "./style";
import { getImageUrl } from "utils/getImageFromFile";
import {
  cloneCanvas,
  drawCanvasImage,
  drawMainImage,
  cropCanvas,
  editBoundingArea,
  highlightPixelArea,
  editHighlightPixelArea,
  getRatio,
  getDimension,
  drawBox,
  drawScaledCanvasImage,
  modifyBitmap
} from "utils/canvasUtils";
import {
  runCanvasOperations,
  runLayerOperations,
  runTempDepthOperations,
  runTempLayerOperations
} from "utils/stackOperations";

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
    const { bitmapCanvas } = this.props;
    const depthCanvas = this.depthImageRef.current;
    bitmapCanvas.width = depthCanvas.width;
    bitmapCanvas.height = depthCanvas.height;
    this.handleResize();
    window.addEventListener("resize", this.handleResize);
  }
  componentDidUpdate(prevProps, prevState) {
    let { depthImageRef } = this;
    let {
      depthImageUrl,
      mainDepthCanvas,
      tempDepthCanvas,
      prevDepthSize,
      depthCanvasDimension,
      bitmapCanvas,
      layerMode,
      tools,
      toolsParameters,
      parameters,
      operationStack,
      initImage,
      storeParameters,
      addOperation,
      removeOperation,
      addEffect
    } = this.props;
    let depthCanvas = depthImageRef.current;
    let depthContext = depthCanvas.getContext("2d");
    // Load image and initialize all canvas images
    if (prevProps.depthImageUrl !== depthImageUrl) {
      depthContext.clearRect(0, 0, prevDepthSize.width, prevDepthSize.height);
      let depthImage = new Image();
      objectUrl = getImageUrl(depthImageUrl);
      depthImage.src = objectUrl;
      depthImage.onload = () => {
        initImage({
          mainDepthCanvas: cloneCanvas(depthImage), // Draw original canvas
          tempDepthCanvas: null,
          depthCanvasDimension: null,
          operationStack: {
            ...operationStack,
            depthStack: []
          }
        });
      };
    }
    // If main image changes, add draw/redraw canvas to operation
    if (prevProps.mainDepthCanvas !== mainDepthCanvas) {
      const { ratio, centerShift_x, centerShift_y } = getRatio(mainDepthCanvas, depthCanvas);
      addEffect({
        name: "depthStack",
        value: { func: drawCanvasImage, params: [ratio, centerShift_x, centerShift_y] }
      });
      initImage({
        prevDepthSize: { width: depthCanvas.width, height: depthCanvas.height },
        depthCanvasDimension: getDimension(mainDepthCanvas, ratio, centerShift_x, centerShift_y),
        parameters: {
          ...parameters,
          canvasParams: {
            translatePos: {
              x: 0,
              y: 0
            },
            scale: 1.0,
            scaleMultiplier: 0.8,
            startDragOffset: {},
            mouseDown: false
          }
        }
      });
    }
    // If operation is added to the stack, rerun all operations in operation stack
    if (prevProps.operationStack.depthStack !== operationStack.depthStack || prevProps.layerMode !== layerMode) {
      if (!layerMode) {
        depthContext.clearRect(0, 0, depthCanvas.width, depthCanvas.height);
        runCanvasOperations("depthStack", mainDepthCanvas, depthContext);
        runTempDepthOperations("depthStack", mainDepthCanvas, depthCanvas.width, depthCanvas.height);
      }
    }
    if (prevProps.operationStack.layerStack !== operationStack.layerStack || prevProps.layerMode !== layerMode) {
      if (layerMode) {
        depthContext.clearRect(0, 0, depthCanvas.width, depthCanvas.height);
        runLayerOperations(depthContext);
        runTempLayerOperations(depthCanvas.width, depthCanvas.height);
      }
    }
    // If operation is added to the move stack, rerun all operations in operation stack
    if (prevProps.operationStack.moveStack !== operationStack.moveStack) {
      runCanvasOperations("moveStack", mainDepthCanvas, depthContext);
    }
    // Highlight pixel range from specified range for either cropped image or initial full image
    if (prevProps.parameters.histogramParams.pixelRange !== parameters.histogramParams.pixelRange) {
      if (parameters.histogramParams.pixelRange || parameters.croppedArea) {
        const { croppedArea, histogramParams } = parameters;
        let newArea = null;
        depthContext.clearRect(0, 0, depthCanvas.width, depthCanvas.height);
        if (croppedArea) {
          newArea = croppedArea;
        } else {
          newArea = [
            depthCanvasDimension[0],
            depthCanvasDimension[1],
            depthCanvasDimension[2] - depthCanvasDimension[0],
            depthCanvasDimension[3] - depthCanvasDimension[1]
          ];
        }
        addOperation({
          name: "depthStack",
          value: { func: highlightPixelArea, params: [newArea, histogramParams.pixelRange] }
        });
      }
    }
    // Listens for mouse movements around the depth canvas and draw bounding box
    if (prevProps.tools.currentTool !== tools.currentTool) {
      if (tools.currentTool) {
        depthCanvas.addEventListener("click", this.drawBoundingBox);
      } else {
        depthCanvas.removeEventListener("click", this.drawBoundingBox);
        const bitmapContext = bitmapCanvas.getContext("2d");
        bitmapContext.clearRect(0, 0, bitmapCanvas.width, bitmapCanvas.height);
        removeOperation({
          name: "depthStack",
          value: drawBox
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
    }
  }
  componentWillUnmount() {
    let depthCanvas = this.depthImageRef.current;
    window.removeEventListener("resize", this.handleResize);
    depthCanvas.removeEventListener("click", this.drawBoundingBox);
    URL.revokeObjectURL(objectUrl);
  }
  handleResize = () => {
    this.setState({ ...this.state, windowWidth: window.innerWidth });
    const { depthImageRef } = this;
    const { mainDepthCanvas, bitmapCanvas, parameters, operationStack, initImage, addEffect } = this.props;
    const depthCanvas = depthImageRef.current;
    if (depthCanvas && mainDepthCanvas) {
      depthCanvas.width = (window.innerWidth / 1500) * 521;
      depthCanvas.height = (window.innerHeight / 1200) * 352;
      bitmapCanvas.width = depthCanvas.width;
      bitmapCanvas.height = depthCanvas.height;
      const { ratio, centerShift_x, centerShift_y } = getRatio(mainDepthCanvas, depthCanvas);
      initImage({
        parameters: {
          ...parameters,
          canvasParams: {
            translatePos: {
              x: 0,
              y: 0
            },
            scale: 1.0,
            scaleMultiplier: 0.8,
            startDragOffset: {},
            mouseDown: false
          }
        },
        operationStack: {
          ...operationStack,
          depthStack: [],
          moveStack: []
        },
        prevDepthSize: { width: depthCanvas.width, height: depthCanvas.height },
        depthCanvasDimension: getDimension(mainDepthCanvas, ratio, centerShift_x, centerShift_y)
      });
      addEffect({
        name: "depthStack",
        value: { func: drawCanvasImage, params: [ratio, centerShift_x, centerShift_y] }
      });
    }
  };
  drawBoundingBox = event => {
    let { initBoundingBox } = this.state;
    let { tempDepthCanvas, depthCanvasDimension, storeParameters, addOperation, removeOperation } = this.props;
    if (tempDepthCanvas) {
      let x = event.layerX;
      let y = event.layerY;
      if (initBoundingBox) {
        let [image_x1, image_y1, image_x2, image_y2] = depthCanvasDimension;
        let new_x = Math.max(Math.min(initBoundingBox.x, x), image_x1);
        let new_y = Math.max(Math.min(initBoundingBox.y, y), image_y1);
        let new_w = Math.min(Math.max(initBoundingBox.x, x), image_x2) - new_x;
        let new_h = Math.min(Math.max(initBoundingBox.y, y), image_y2) - new_y;
        let croppedArea = [new_x, new_y, new_w, new_h];
        this.setState({ initBoundingBox: null }, () => {
          storeParameters({ croppedCanvasImage: cropCanvas(tempDepthCanvas, croppedArea), croppedArea: croppedArea });
          addOperation({
            name: "depthStack",
            value: { func: drawBox, params: croppedArea }
          });
        });
      } else {
        this.setState({ initBoundingBox: { x, y } }, () => {
          storeParameters({
            histogramParams: {
              pixelRange: [0, 255],
              domain: [0, 255],
              values: [0, 255],
              update: [0, 255]
            }
          });
          removeOperation({
            name: "depthStack",
            value: drawBox
          });
        });
      }
    }
  };
  render() {
    const { depthImageRef } = this;
    const depthCanvas = depthImageRef.current;
    const { mainDepthCanvas, parameters, tools, storeParameters, addOperation } = this.props;
    const { scale, translatePos, startDragOffset, mouseDown } = parameters.canvasParams;
    return (
      <DepthViewerStyle>
        <canvas
          width={(window.innerWidth / 1500) * 521}
          height={(window.innerHeight / 1200) * 352}
          ref={depthImageRef}
          onMouseDown={e =>
            storeParameters({
              canvasParams: {
                ...parameters.canvasParams,
                startDragOffset: {
                  x: e.clientX - translatePos.x,
                  y: e.clientY - translatePos.y
                },
                mouseDown: true
              }
            })
          }
          onMouseUp={e =>
            mouseDown &&
            storeParameters({
              canvasParams: {
                ...parameters.canvasParams,
                mouseDown: false
              }
            })
          }
          onMouseOver={e =>
            mouseDown &&
            storeParameters({
              canvasParams: {
                ...parameters.canvasParams,
                mouseDown: false
              }
            })
          }
          onMouseOut={e =>
            mouseDown &&
            storeParameters({
              canvasParams: {
                ...parameters.canvasParams,
                mouseDown: false
              }
            })
          }
          onMouseMove={e => {
            if (mouseDown && !tools.currentTool) {
              const { ratio, centerShift_x, centerShift_y } = getRatio(mainDepthCanvas, depthCanvas);
              storeParameters({
                canvasParams: {
                  ...parameters.canvasParams,
                  translatePos: {
                    x: e.clientX - startDragOffset.x,
                    y: e.clientY - startDragOffset.y
                  }
                }
              });
              addOperation({
                name: "moveStack",
                value: {
                  func: drawScaledCanvasImage,
                  params: [depthCanvas, ratio, centerShift_x, centerShift_y, scale, translatePos]
                }
              });
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
  tempDepthCanvas: imageSelectors.tempDepthCanvas(state),
  prevDepthSize: imageSelectors.prevDepthSize(state),
  depthCanvasDimension: imageSelectors.depthCanvasDimension(state),
  bitmapCanvas: imageSelectors.bitmapCanvas(state),
  layerMode: imageSelectors.layerMode(state),
  tools: imageSelectors.tools(state),
  toolsParameters: imageSelectors.toolsParameters(state),
  parameters: imageSelectors.parameters(state),
  operationStack: imageSelectors.operationStack(state)
});

const mapDispatchToProps = {
  initImage: imageActions.initImage,
  storeParameters: imageActions.storeParameters,
  addOperation: imageActions.addOperation,
  removeOperation: imageActions.removeOperation,
  addEffect: imageActions.addEffect
};

export default connect(mapStateToProps, mapDispatchToProps)(DepthViewer);
