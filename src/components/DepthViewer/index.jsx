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
  drawBox
} from "utils/canvasUtils";
import { runCanvasOperations, runTempDepthOperations } from "utils/stackOperations";
import { addEffect } from "@react-three/fiber";

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
  componentDidUpdate(prevProps, prevState) {
    let { depthImageRef } = this;
    let {
      depthImageUrl,
      mainDepthCanvas,
      tempDepthCanvas,
      depthCanvasDimension,
      prevDepthSize,
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
        depthCanvasDimension: getDimension(mainDepthCanvas, ratio, centerShift_x, centerShift_y)
      });
    }
    // If operation is added to the stack, rerun all operations in operation stack
    if (prevProps.operationStack.depthStack !== operationStack.depthStack) {
      runCanvasOperations("depthStack", mainDepthCanvas, depthContext);
      runTempDepthOperations("depthStack", mainDepthCanvas, depthCanvas.width, depthCanvas.height);
    }
    // Highlight pixel range from specified range for either cropped image or initial full image
    if (prevProps.parameters.pixelRange !== parameters.pixelRange) {
      if (parameters.pixelRange || parameters.croppedArea) {
        const { croppedArea, pixelRange } = parameters;
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
          value: { func: highlightPixelArea, params: [newArea, pixelRange] }
        });
      }
    }
    // if (prevProps.toolsParameters.depthRangeIntensity !== toolsParameters.depthRangeIntensity) {
    //   if (
    //     toolsParameters.depthRangeIntensity &&
    //     parameters.pixelRange &&
    //     (parameters.croppedArea || depthCanvasDimension)
    //   ) {
    //     const { croppedArea, pixelRange } = parameters;
    //     let newArea = null;
    //     if (croppedArea) {
    //       newArea = croppedArea;
    //     } else {
    //       newArea = [
    //         depthCanvasDimension[0],
    //         depthCanvasDimension[1],
    //         depthCanvasDimension[2] - depthCanvasDimension[0],
    //         depthCanvasDimension[3] - depthCanvasDimension[1]
    //       ];
    //     }
    //     editHighlightPixelArea(newArea, depthContext, pixelRange, toolsParameters.depthRangeIntensity);
    //   }
    // }
    // Listens for mouse movements around the depth canvas and draw bounding box
    if (prevProps.tools.depth !== tools.depth) {
      if (tools.depth) {
        depthCanvas.addEventListener("click", this.drawBoundingBox);
      } else {
        depthCanvas.removeEventListener("click", this.drawBoundingBox);
        removeOperation({
          name: "depthStack",
          value: drawBox
        });
        storeParameters({
          croppedCanvasImage: null,
          croppedArea: null,
          pixelRange: [0, 255]
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
    const { mainDepthCanvas, operationStack, initImage, addEffect } = this.props;
    const depthCanvas = depthImageRef.current;
    if (depthCanvas && mainDepthCanvas) {
      depthCanvas.width = (window.innerWidth / 1500) * 521;
      depthCanvas.height = (window.innerHeight / 1200) * 352;
      const { ratio, centerShift_x, centerShift_y } = getRatio(mainDepthCanvas, depthCanvas);
      initImage({
        operationStack: {
          ...operationStack,
          depthStack: []
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
            pixelRange: [0, 255]
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
    return (
      <DepthViewerStyle>
        <canvas
          width={(window.innerWidth / 1500) * 521}
          height={(window.innerHeight / 1200) * 352}
          ref={depthImageRef}
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
