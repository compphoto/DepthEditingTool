import React, { Component, createRef } from "react";
import { connect } from "react-redux";
import { imageActions } from "store/image";
import { selectors as imageSelectors } from "store/image";
import RgbViewerStyle from "./style";
import { getImageUrl } from "utils/getImageFromFile";
import { cloneCanvas, drawCanvasImage, highlightPixelArea } from "utils/canvasUtils";

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
      rgbImageDimension,
      prevRgbSize,
      tools,
      toolsParameters,
      parameters,
      initImage
    } = this.props;
    let rgbCanvas = rgbImageRef.current;
    let rgbContext = rgbCanvas.getContext("2d");
    if (prevProps.rgbImageUrl !== rgbImageUrl) {
      rgbContext.clearRect(0, 0, prevRgbSize.width, prevRgbSize.height);
      let rgbImage = new Image();
      objectUrl = getImageUrl(rgbImageUrl);
      rgbImage.src = objectUrl;
      rgbImage.onload = () => {
        let rgbImageDimension = drawCanvasImage(rgbImage, rgbCanvas, rgbContext);
        initImage({
          loadedRgbImage: rgbImage,
          mainRgbCanvas: cloneCanvas(rgbCanvas),
          tempRgbCanvas: cloneCanvas(rgbCanvas),
          rgbImageDimension: rgbImageDimension,
          prevRgbSize: { width: rgbCanvas.width, height: rgbCanvas.height }
        });
      };
    }
    // On saving the image, this clears all annotations
    if (prevProps.mainDepthCanvas !== mainDepthCanvas) {
      if (tempRgbCanvas && mainDepthCanvas) {
        rgbContext.clearRect(0, 0, rgbCanvas.width, rgbCanvas.height);
        rgbContext.globalAlpha = 1;
        rgbContext.drawImage(mainRgbCanvas, 0, 0);
        initImage({
          tempRgbCanvas: cloneCanvas(rgbCanvas)
        });
      }
    }
    // tempRgbCanvas changes on clicking the reset button
    if (prevProps.tempDepthCanvas !== tempDepthCanvas) {
      if (tempRgbCanvas) {
        rgbContext.clearRect(0, 0, rgbCanvas.width, rgbCanvas.height);
        rgbContext.globalAlpha = 1;
        rgbContext.drawImage(mainRgbCanvas, 0, 0);
        initImage({
          tempRgbCanvas: cloneCanvas(rgbCanvas)
        });
      }
    }
    if (prevProps.parameters.croppedeArea !== parameters.croppedeArea) {
      const { croppedeArea } = parameters;
      if (croppedeArea && tempRgbCanvas) {
        rgbContext.beginPath();
        rgbContext.strokeStyle = "red";
        rgbContext.rect(croppedeArea[0], croppedeArea[1], croppedeArea[2], croppedeArea[3]);
        rgbContext.stroke();
        initImage({
          tempRgbCanvas: cloneCanvas(rgbCanvas)
        });
      }
    }
    // Highlight pixel range from specified range for either cropped image or initial full image
    if (prevProps.parameters.pixelRange !== parameters.pixelRange) {
      if (tempRgbCanvas && parameters.pixelRange && (parameters.croppedeArea || rgbImageDimension)) {
        const { croppedeArea, pixelRange } = parameters;
        let newArea = null;
        rgbContext.clearRect(0, 0, rgbCanvas.width, rgbCanvas.height);
        rgbContext.globalAlpha = 1;
        rgbContext.drawImage(mainRgbCanvas, 0, 0);
        if (croppedeArea) {
          newArea = croppedeArea;
          rgbContext.beginPath();
          rgbContext.strokeStyle = "red";
          rgbContext.rect(newArea[0], newArea[1], newArea[2], newArea[3]);
          rgbContext.stroke();
        } else {
          newArea = [
            rgbImageDimension[0],
            rgbImageDimension[1],
            rgbImageDimension[2] - rgbImageDimension[0],
            rgbImageDimension[3] - rgbImageDimension[1]
          ];
        }
        highlightPixelArea(newArea, rgbContext, pixelRange);
        initImage({
          tempRgbCanvas: cloneCanvas(rgbCanvas)
        });
      }
    }
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
    URL.revokeObjectURL(objectUrl);
  }
  handleResize = () => {
    let { rgbImageRef } = this;
    this.setState({ ...this.state, windowWidth: window.innerWidth });
    let { loadedRgbImage, initImage } = this.props;
    let rgbCanvas = rgbImageRef.current;
    if (rgbCanvas) {
      let rgbContext = rgbCanvas.getContext("2d");
      rgbCanvas.width = (window.innerWidth / 1500) * 521;
      rgbCanvas.height = (window.innerHeight / 1200) * 352;
      if (loadedRgbImage) {
        let rgbImageDimension = drawCanvasImage(loadedRgbImage, rgbCanvas, rgbContext);
        initImage({
          rgbImageDimension: rgbImageDimension,
          prevRgbSize: { width: rgbCanvas.width, height: rgbCanvas.height }
        });
      }
    } else {
      return;
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
  loadedRgbImage: imageSelectors.loadedRgbImage(state),
  mainRgbCanvas: imageSelectors.mainRgbCanvas(state),
  mainDepthCanvas: imageSelectors.mainDepthCanvas(state),
  tempRgbCanvas: imageSelectors.tempRgbCanvas(state),
  tempDepthCanvas: imageSelectors.tempDepthCanvas(state),
  rgbImageDimension: imageSelectors.rgbImageDimension(state),
  prevRgbSize: imageSelectors.prevRgbSize(state),
  tools: imageSelectors.tools(state),
  toolsParameters: imageSelectors.toolsParameters(state),
  parameters: imageSelectors.parameters(state)
});

const mapDispatchToProps = {
  initImage: imageActions.initImage
};

export default connect(mapStateToProps, mapDispatchToProps)(RgbViewer);
