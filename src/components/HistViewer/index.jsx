import React, { Component, createRef } from "react";
import { connect } from "react-redux";
import { imageActions } from "store/image";
import { selectors as imageSelectors } from "store/image";
import HistViewerStyle from "./style";
import { drawHistogramImage, getImageData } from "utils/drawHistogram";

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
    this.handleResize();
    window.addEventListener("resize", this.handleResize);
  }
  componentDidUpdate(prevProps, prevState) {
    let { histImageRef } = this;
    let { parameters } = this.props;
    let histCanvas = histImageRef.current;
    let histContext = histCanvas.getContext("2d");
    if (prevProps.parameters.croppedCanvasImage !== parameters.croppedCanvasImage) {
      histContext.clearRect(0, 0, histCanvas.width, histCanvas.height);
      if (parameters.croppedCanvasImage) {
        let histDepthData = getImageData(parameters.croppedCanvasImage);
        drawHistogramImage(histCanvas, histContext, histDepthData);
      }
    }
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }
  handleResize = () => {
    let { histImageRef } = this;
    let { parameters } = this.props;
    this.setState({ ...this.state, windowWidth: window.innerWidth });
    let histCanvas = histImageRef.current;
    if (histCanvas) {
      let histContext = histCanvas.getContext("2d");
      histContext.clearRect(0, 0, histCanvas.width, histCanvas.height);
      histCanvas.width = (window.innerWidth / 1500) * 421;
      histCanvas.height = (window.innerHeight / 1200) * 352;
      if (parameters.croppedCanvasImage) {
        let histDepthData = getImageData(parameters.croppedCanvasImage);
        drawHistogramImage(histCanvas, histContext, histDepthData);
      }
    } else {
      return;
    }
  };
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
  parameters: imageSelectors.parameters(state)
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(HistViewer);
