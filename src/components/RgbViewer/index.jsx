import React, { Component, createRef } from "react";
import { connect } from "react-redux";
import { imageActions } from "store/image";
import { selectors as imageSelectors } from "store/image";
import RgbViewerStyle from "./style";
import { getImageUrl } from "utils/getImageFromFile";
import { drawCanvasImage } from "utils/canvasUtils";

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
    let { rgbImageUrl, prevRgbSize, initImage } = this.props;
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
          rgbImageDimension: rgbImageDimension,
          prevRgbSize: { width: rgbCanvas.width, height: rgbCanvas.height }
        });
      };
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
  tempDepthCanvas: imageSelectors.tempDepthCanvas(state),
  rgbImageDimension: imageSelectors.rgbImageDimension(state),
  prevRgbSize: imageSelectors.prevRgbSize(state)
});

const mapDispatchToProps = {
  initImage: imageActions.initImage
};

export default connect(mapStateToProps, mapDispatchToProps)(RgbViewer);
