import React, { Component, createRef } from "react";
import { connect } from "react-redux";
import { imageActions } from "store/image";
import { selectors as imageSelectors } from "store/image";
import RangeSlider from "./rangeslider";
import HistViewerStyle from "./style";
import { getCanvasImageData, getImageData } from "utils/drawHistogram";
import { cropCanvas, dimensionToBox, getDimension, getRatio } from "utils/canvasUtils";

class HistViewer extends Component {
  constructor() {
    super();
  }
  state = {
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    data: []
  };
  componentDidUpdate(prevProps, prevState) {
    let { tempDepthCanvas, depthCanvasDimension, parameters } = this.props;
    if (
      prevProps.parameters.croppedCanvasImage !== parameters.croppedCanvasImage ||
      prevProps.tempDepthCanvas !== tempDepthCanvas
    ) {
      if (parameters.croppedCanvasImage) {
        let histDepthData = getImageData(parameters.croppedCanvasImage);
        this.setState({ data: histDepthData });
      } else {
        if (tempDepthCanvas) {
          const boundingBox = dimensionToBox(depthCanvasDimension);
          let histDepthData = getImageData(cropCanvas(tempDepthCanvas, boundingBox));
          this.setState({ data: histDepthData });
        }
      }
    }
  }
  render() {
    const { data } = this.state;
    return (
      <HistViewerStyle>
        <RangeSlider data={data} />
      </HistViewerStyle>
    );
  }
}

const mapStateToProps = state => ({
  mainDepthCanvas: imageSelectors.mainDepthCanvas(state),
  tempDepthCanvas: imageSelectors.tempDepthCanvas(state),
  depthCanvasDimension: imageSelectors.depthCanvasDimension(state),
  parameters: imageSelectors.parameters(state)
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(HistViewer);
