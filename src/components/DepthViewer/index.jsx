import React, { Component, createRef } from "react";
import { connect } from "react-redux";
import { imageActions } from "store/image";
import { selectors as toolExtSelectors } from "store/toolext";
import { selectors as imageSelectors } from "store/image";
import DepthViewerStyle from "./style";
import { getImageUrl } from "utils/getImageFromFile";
import { cloneCanvas, editBoundingArea, drawCanvasImage, canvasToImage, cropCanvas } from "utils/canvasUtils";

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
    let { depthImageUrl, mainDepthCanvas, prevDepthSize, tools, parameters, initImage } = this.props;
    let depthCanvas = depthImageRef.current;
    let depthContext = depthCanvas.getContext("2d");
    if (prevProps.depthImageUrl !== depthImageUrl) {
      // d3.selectAll(".histogram").remove();
      // d3.selectAll("g.y-axis").remove();
      // d3.selectAll("text").remove();
      depthContext.clearRect(0, 0, prevDepthSize.width, prevDepthSize.height);
      let depthImage = new Image();
      objectUrl = getImageUrl(depthImageUrl);
      depthImage.src = objectUrl;
      depthImage.onload = () => {
        let depthImageDimension = drawCanvasImage(depthImage, depthCanvas, depthContext);
        initImage({
          loadedDepthImage: depthImage,
          mainDepthCanvas: cloneCanvas(depthCanvas),
          tempDepthCanvas: cloneCanvas(depthCanvas),
          depthImageDimension: depthImageDimension,
          prevDepthSize: { width: depthCanvas.width, height: depthCanvas.height }
        });
      };
    }
    if (prevProps.tools.depth !== tools.depth) {
      if (tools.depth) {
        depthCanvas.addEventListener("click", this.drawBoundingBox);
      } else {
        depthCanvas.removeEventListener("click", this.drawBoundingBox);
        depthContext.clearRect(0, 0, depthCanvas.width, depthCanvas.height);
        depthContext.globalAlpha = 1;
        depthContext.drawImage(mainDepthCanvas, 0, 0);
        initImage({ tempDepthCanvas: cloneCanvas(depthCanvas) });
      }
    }
    if (prevProps.mainDepthCanvas !== mainDepthCanvas) {
      if (mainDepthCanvas) {
        depthContext.clearRect(0, 0, depthCanvas.width, depthCanvas.height);
        depthContext.globalAlpha = 1;
        depthContext.drawImage(mainDepthCanvas, 0, 0);
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
    let { loadedDepthImage, initImage, parameters } = this.props;
    let depthCanvas = this.depthImageRef.current;
    if (depthCanvas) {
      let depthContext = depthCanvas.getContext("2d");
      depthCanvas.width = (window.innerWidth / 1500) * 521;
      depthCanvas.height = (window.innerHeight / 1200) * 352;
      if (loadedDepthImage) {
        let depthImageDimension = drawCanvasImage(loadedDepthImage, depthCanvas, depthContext);
        initImage({
          mainDepthCanvas: cloneCanvas(depthCanvas),
          tempDepthCanvas: cloneCanvas(depthCanvas),
          depthImageDimension: depthImageDimension,
          prevDepthSize: { width: depthCanvas.width, height: depthCanvas.height }
        });
      }
    } else {
      return;
    }
  };
  drawBoundingBox = event => {
    let { initBoundingBox } = this.state;
    let { mainDepthCanvas, tempDepthCanvas, depthImageDimension, storeParameters } = this.props;
    let depthCanvas = this.depthImageRef.current;
    let depthContext = depthCanvas.getContext("2d");
    if (mainDepthCanvas) {
      let x = event.layerX;
      let y = event.layerY;
      if (initBoundingBox) {
        let [image_x1, image_y1, image_x2, image_y2] = depthImageDimension;
        depthContext.beginPath();
        depthContext.globalAlpha = 0.2;
        depthContext.fillStyle = "blue";
        let new_x = Math.max(Math.min(initBoundingBox.x, x), image_x1);
        let new_y = Math.max(Math.min(initBoundingBox.y, y), image_y1);
        let new_w = Math.min(Math.max(initBoundingBox.x, x), image_x2) - new_x;
        let new_h = Math.min(Math.max(initBoundingBox.y, y), image_y2) - new_y;
        depthContext.fillRect(new_x, new_y, new_w, new_h);
        let croppedArea = [new_x, new_y, new_w, new_h];
        this.setState({ initBoundingBox: null }, () => {
          storeParameters({ croppedCanvasImage: cropCanvas(tempDepthCanvas, croppedArea), croppedeArea: croppedArea });
        });
      } else {
        depthContext.clearRect(0, 0, depthCanvas.width, depthCanvas.height);
        depthContext.globalAlpha = 1;
        depthContext.drawImage(mainDepthCanvas, 0, 0);
        this.setState({ initBoundingBox: { x, y } });
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

export default connect(mapStateToProps, mapDispatchToProps)(DepthViewer);
