import React, { Component, createRef } from "react";
import { connect } from "react-redux";
import { imageActions } from "store/image";
import { selectors as imageSelectors } from "store/image";
import DepthViewerStyle from "./style";
import { getImageUrl } from "utils/getImageFromFile";
import { cloneCanvas, drawCanvasImage, cropCanvas, editBoundingArea, highlightPixelArea } from "utils/canvasUtils";

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
      depthCanvaUpdate,
      tempDepthCanvas,
      prevDepthSize,
      tools,
      parameters,
      initImage,
      storeParameters
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
    // On saving the image, this clears all annotations
    if (prevProps.mainDepthCanvas !== mainDepthCanvas) {
      if (mainDepthCanvas) {
        depthContext.clearRect(0, 0, depthCanvas.width, depthCanvas.height);
        depthContext.globalAlpha = 1;
        depthContext.drawImage(mainDepthCanvas, 0, 0);
      }
    }
    // tempDepthCanvas changes on clicking the reset button
    if (prevProps.tempDepthCanvas !== tempDepthCanvas) {
      if (tempDepthCanvas) {
        storeParameters({
          croppedCanvasImage: null,
          croppedeArea: null,
          pixelRange: null
        });
        depthContext.clearRect(0, 0, depthCanvas.width, depthCanvas.height);
        depthContext.globalAlpha = 1;
        depthContext.drawImage(tempDepthCanvas, 0, 0);
      }
    }
    if (prevProps.depthCanvaUpdate !== depthCanvaUpdate) {
      if (depthCanvaUpdate) {
        editBoundingArea(parameters.croppedeArea, depthContext, depthCanvaUpdate);
      }
    }
    // Listens for mouse movements around the depth canvas and draw bounding box
    if (prevProps.tools.depth !== tools.depth) {
      if (tools.depth) {
        depthCanvas.addEventListener("click", this.drawBoundingBox);
      } else {
        depthCanvas.removeEventListener("click", this.drawBoundingBox);
        if (mainDepthCanvas) {
          depthContext.clearRect(0, 0, depthCanvas.width, depthCanvas.height);
          depthContext.globalAlpha = 1;
          depthContext.drawImage(mainDepthCanvas, 0, 0);
          initImage({ tempDepthCanvas: cloneCanvas(depthCanvas) });
        }
      }
    }
    // Highlight pixel range from specified range
    if (prevProps.parameters.pixelRange !== parameters.pixelRange) {
      if (parameters.pixelRange && parameters.croppedeArea) {
        const { croppedeArea, pixelRange } = parameters;
        depthContext.clearRect(0, 0, depthCanvas.width, depthCanvas.height);
        depthContext.globalAlpha = 1;
        depthContext.drawImage(mainDepthCanvas, 0, 0);
        depthContext.beginPath();
        depthContext.strokeStyle = "blue";
        depthContext.rect(croppedeArea[0], croppedeArea[1], croppedeArea[2], croppedeArea[3]);
        depthContext.stroke();
        highlightPixelArea(croppedeArea, depthContext, pixelRange);
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
    let { depthImageRef } = this;
    this.setState({ ...this.state, windowWidth: window.innerWidth });
    let { loadedDepthImage, initImage } = this.props;
    let depthCanvas = depthImageRef.current;
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
        let new_x = Math.max(Math.min(initBoundingBox.x, x), image_x1);
        let new_y = Math.max(Math.min(initBoundingBox.y, y), image_y1);
        let new_w = Math.min(Math.max(initBoundingBox.x, x), image_x2) - new_x;
        let new_h = Math.min(Math.max(initBoundingBox.y, y), image_y2) - new_y;
        depthContext.beginPath();
        depthContext.strokeStyle = "blue";
        depthContext.rect(new_x, new_y, new_w, new_h);
        depthContext.stroke();
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
  depthImageUrl: imageSelectors.depthImageUrl(state),
  loadedDepthImage: imageSelectors.loadedDepthImage(state),
  mainDepthCanvas: imageSelectors.mainDepthCanvas(state),
  tempDepthCanvas: imageSelectors.tempDepthCanvas(state),
  depthCanvaUpdate: imageSelectors.depthCanvaUpdate(state),
  depthImageDimension: imageSelectors.depthImageDimension(state),
  prevDepthSize: imageSelectors.prevDepthSize(state),
  tools: imageSelectors.tools(state),
  parameters: imageSelectors.parameters(state)
});

const mapDispatchToProps = {
  initImage: imageActions.initImage,
  storeParameters: imageActions.storeParameters
};

export default connect(mapStateToProps, mapDispatchToProps)(DepthViewer);
