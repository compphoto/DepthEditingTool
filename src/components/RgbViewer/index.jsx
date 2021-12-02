import React, { Component, createRef } from "react";
import { connect } from "react-redux";
import { imageActions } from "store/image";
import { selectors as imageSelectors } from "store/image";
import RgbViewerStyle from "./style";
import { getImageUrl } from "utils/getImageFromFile";
import {
  cloneCanvas,
  drawBox,
  drawCanvasImage,
  getDimension,
  getRatio,
  highlightPixelAreaRgb
} from "utils/canvasUtils";
import { runCanvasOperations, runTempOperations } from "utils/stackOperations";

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
      prevRgbSize,
      tools,
      toolsParameters,
      parameters,
      operationStack,
      initImage,
      addOperation,
      removeOperation
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
            rgbCanvasStack: [],
            tempRgbStack: []
          }
        });
      };
    }
    // If main image changes, add draw/redraw canvas to operation
    if (prevProps.mainRgbCanvas !== mainRgbCanvas) {
      const { ratio, centerShift_x, centerShift_y } = getRatio(mainRgbCanvas, rgbCanvas);
      addOperation({
        name: "rgbCanvasStack",
        value: { func: drawCanvasImage, params: [ratio, centerShift_x, centerShift_y] }
      });
      addOperation({
        name: "tempRgbStack",
        value: { func: drawCanvasImage, params: [ratio, centerShift_x, centerShift_y] }
      });
      initImage({
        prevRgbSize: { width: rgbCanvas.width, height: rgbCanvas.height },
        rgbCanvasDimension: getDimension(mainRgbCanvas, ratio, centerShift_x, centerShift_y)
      });
    }
    // If operation is added to the stack, rerun all operations in operation stack
    if (prevProps.operationStack.rgbCanvasStack !== operationStack.rgbCanvasStack) {
      runCanvasOperations("rgbCanvasStack", mainRgbCanvas, rgbContext);
    }
    if (prevProps.operationStack.tempRgbStack !== operationStack.tempRgbStack) {
      runTempOperations("tempRgbStack", mainRgbCanvas, rgbCanvas.width, rgbCanvas.height);
    }
    // Highlight pixel range from specified range for either cropped image or initial full image
    if (prevProps.parameters.pixelRange !== parameters.pixelRange) {
      if (parameters.pixelRange || parameters.croppedArea) {
        const { croppedArea, pixelRange } = parameters;
        const depthContext = tempDepthCanvas.getContext("2d");
        rgbContext.clearRect(0, 0, rgbCanvas.width, rgbCanvas.height);
        let newArea = null;
        if (croppedArea) {
          newArea = croppedArea;
          rgbContext.beginPath();
          rgbContext.strokeStyle = "red";
          rgbContext.rect(newArea[0], newArea[1], newArea[2], newArea[3]);
          rgbContext.stroke();
        } else {
          newArea = [
            rgbCanvasDimension[0],
            rgbCanvasDimension[1],
            rgbCanvasDimension[2] - rgbCanvasDimension[0],
            rgbCanvasDimension[3] - rgbCanvasDimension[1]
          ];
        }
        addOperation({
          name: "rgbCanvasStack",
          value: { func: highlightPixelAreaRgb, params: [depthContext, newArea, pixelRange] }
        });
        addOperation({
          name: "tempRgbStack",
          value: { func: highlightPixelAreaRgb, params: [depthContext, newArea, pixelRange] }
        });
      }
    }
    // // On saving the image, this clears all annotations
    // if (prevProps.mainDepthCanvas !== mainDepthCanvas) {
    //   if (tempRgbCanvas && mainDepthCanvas) {
    //     rgbContext.clearRect(0, 0, rgbCanvas.width, rgbCanvas.height);
    //     rgbContext.globalAlpha = 1;
    //     rgbContext.drawImage(mainRgbCanvas, 0, 0);
    //     initImage({
    //       tempRgbCanvas: cloneCanvas(rgbCanvas)
    //     });
    //   }
    // }
    // // tempRgbCanvas changes on clicking the reset button
    // if (prevProps.tempDepthCanvas !== tempDepthCanvas) {
    //   if (tempRgbCanvas) {
    //     rgbContext.clearRect(0, 0, rgbCanvas.width, rgbCanvas.height);
    //     rgbContext.globalAlpha = 1;
    //     rgbContext.drawImage(mainRgbCanvas, 0, 0);
    //     initImage({
    //       tempRgbCanvas: cloneCanvas(rgbCanvas)
    //     });
    //   }
    // }
    if (prevProps.parameters.croppedArea !== parameters.croppedArea) {
      const { croppedArea } = parameters;
      if (croppedArea && tempRgbCanvas) {
        addOperation({
          name: "rgbCanvasStack",
          value: { func: drawBox, params: croppedArea }
        });
        addOperation({
          name: "tempRgbStack",
          value: { func: drawBox, params: croppedArea }
        });
      }
    }
    if (prevProps.tools.depth !== tools.depth) {
      if (!tools.depth) {
        removeOperation({
          name: "rgbCanvasStack",
          value: drawBox
        });
        removeOperation({
          name: "tempRgbStack",
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
    const { mainRgbCanvas, operationStack, initImage, addOperation } = this.props;
    const rgbCanvas = rgbImageRef.current;
    if (rgbCanvas && mainRgbCanvas) {
      rgbCanvas.width = (window.innerWidth / 1500) * 521;
      rgbCanvas.height = (window.innerHeight / 1200) * 352;
      const { ratio, centerShift_x, centerShift_y } = getRatio(mainRgbCanvas, rgbCanvas);
      initImage({
        operationStack: {
          ...operationStack,
          rgbCanvasStack: [],
          tempRgbStack: []
        },
        prevRgbSize: { width: rgbCanvas.width, height: rgbCanvas.height },
        rgbCanvasDimension: getDimension(mainRgbCanvas, ratio, centerShift_x, centerShift_y)
      });
      addOperation({
        name: "rgbCanvasStack",
        value: { func: drawCanvasImage, params: [ratio, centerShift_x, centerShift_y] }
      });
      addOperation({
        name: "tempRgbStack",
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
  tools: imageSelectors.tools(state),
  toolsParameters: imageSelectors.toolsParameters(state),
  parameters: imageSelectors.parameters(state),
  operationStack: imageSelectors.operationStack(state)
});

const mapDispatchToProps = {
  initImage: imageActions.initImage,
  addOperation: imageActions.addOperation,
  removeOperation: imageActions.removeOperation
};

export default connect(mapStateToProps, mapDispatchToProps)(RgbViewer);
