import React, { Component, createRef } from "react";
import { connect } from "react-redux";
import { imageActions } from "store/image";
import { selectors as toolExtSelectors } from "store/toolext";
import { selectors as imageSelectors } from "store/image";
import HistViewerStyle from "./style";
import { drawBar, drawLine, getImageData, processImage } from "utils/drawHistogram";
import { cloneCanvas, editBoundingArea, drawCanvasImage, canvasToImage, cropCanvas } from "utils/canvasUtils";

class HistViewer extends Component {
  constructor() {
    super();
    this.histImageRef = createRef();
  }
  state = {
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight
  };
  componentDidMount() {
    // this.handleResize();
    // window.addEventListener("resize", this.handleResize);
  }
  componentDidUpdate(prevProps, prevState) {
    let { histImageRef } = this;
    let { parameters, initImage } = this.props;
    let histCanvas = histImageRef.current;
    let histContext = histCanvas.getContext("2d");
    if (prevProps.parameters.croppedCanvasImage !== parameters.croppedCanvasImage) {
      if (parameters.croppedCanvasImage && histCanvas) {
        let histDepth = getImageData(parameters.croppedCanvasImage);
        let padding = 2;
        let newCanvasWidth = histCanvas.width - padding * 2;
        let newCanvasHeight = histCanvas.height - padding * 2;
        let maxDepth = Math.max(...Object.values(histDepth));
        let binSizeY = newCanvasHeight / maxDepth;
        let binSizeX = newCanvasWidth / 256;
        drawLine(histContext, padding, padding, padding, newCanvasHeight, "black");
        drawLine(histContext, padding, newCanvasHeight, newCanvasWidth, newCanvasHeight, "black");
        let lastPositionX = 0;
        for (const [key, value] of Object.entries(histDepth)) {
          let upperLeftCornerX = padding + lastPositionX;
          let upperLeftCornerY = padding + newCanvasHeight - value * binSizeY;
          let width = binSizeX;
          let height = value * binSizeY;
          let color = key % 2 === 0 ? "#080808" : "#333";
          lastPositionX += binSizeX;
          drawBar(histContext, upperLeftCornerX, upperLeftCornerY, width, height, color);
        }
      }
    }
  }
  componentWillUnmount() {
    // let depthCanvas = this.depthImageRef.current;
    // window.removeEventListener("resize", this.handleResize);
    // depthCanvas.removeEventListener("click", this.drawBoundingBox);
  }
  // handleResize = () => {
  //   this.setState({ ...this.state, windowWidth: window.innerWidth });
  //   let { loadedDepthImage, initImage, parameters } = this.props;
  //   let depthCanvas = this.depthImageRef.current;
  //   if (depthCanvas) {
  //     let depthContext = depthCanvas.getContext("2d");
  //     depthCanvas.width = (window.innerWidth / 1500) * 521;
  //     depthCanvas.height = (window.innerHeight / 1200) * 352;
  //     if (loadedDepthImage) {
  //       let depthImageDimension = drawCanvasImage(loadedDepthImage, depthCanvas, depthContext);
  //       initImage({
  //         mainDepthCanvas: cloneCanvas(depthCanvas),
  //         tempDepthCanvas: cloneCanvas(depthCanvas),
  //         depthImageDimension: depthImageDimension,
  //         prevDepthSize: { width: depthCanvas.width, height: depthCanvas.height }
  //       });
  //     }
  //   } else {
  //     return;
  //   }
  // };
  render() {
    const { histImageRef } = this;
    return (
      <HistViewerStyle>
        <canvas
          width={(window.innerWidth / 1500) * 421}
          height={(window.innerHeight / 1200) * 352}
          ref={histImageRef}
        ></canvas>
      </HistViewerStyle>
    );
  }
}

const mapStateToProps = state => ({
  toolExtOpen: toolExtSelectors.toolExtOpen(state),
  rgbImageUrl: imageSelectors.rgbImageUrl(state),
  depthImageUrl: imageSelectors.depthImageUrl(state),
  loadedRgbImage: imageSelectors.loadedRgbImage(state),
  loadedDepthImage: imageSelectors.loadedDepthImage(state),
  mainDepthCanvas: imageSelectors.mainDepthCanvas(state),
  tempDepthCanvas: imageSelectors.tempDepthCanvas(state),
  rgbImageDimension: imageSelectors.rgbImageDimension(state),
  depthImageDimension: imageSelectors.depthImageDimension(state),
  prevRgbSize: imageSelectors.prevRgbSize(state),
  prevDepthSize: imageSelectors.prevDepthSize(state),
  tools: imageSelectors.tools(state),
  parameters: imageSelectors.parameters(state)
});

const mapDispatchToProps = {
  handleChange: imageActions.handleChange,
  initImage: imageActions.initImage,
  selectTool: imageActions.selectTool,
  storeParameters: imageActions.storeParameters,
  removeItem: imageActions.removeItem,
  removeAllItem: imageActions.removeAllItem
};

export default connect(mapStateToProps, mapDispatchToProps)(HistViewer);
