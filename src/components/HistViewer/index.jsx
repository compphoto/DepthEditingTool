import React, { Component, createRef } from "react";
import { connect } from "react-redux";
import { imageActions } from "store/image";
import { selectors as imageSelectors } from "store/image";
import RangeSlider from "./rangeslider";
import HistViewerStyle from "./style";
import { getCanvasImageData, getImageData } from "utils/drawHistogram";

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
    let { tempDepthCanvas, parameters } = this.props;
    if (prevProps.parameters.croppedCanvasImage !== parameters.croppedCanvasImage) {
      if (parameters.croppedCanvasImage) {
        let histDepthData = getImageData(parameters.croppedCanvasImage);
        this.setState({ data: histDepthData });
      }
    }
    if (prevProps.tempDepthCanvas !== tempDepthCanvas) {
      if (tempDepthCanvas) {
        let histDepthData = getImageData(tempDepthCanvas);
        this.setState({ data: histDepthData });
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
  tempDepthCanvas: imageSelectors.tempDepthCanvas(state),
  parameters: imageSelectors.parameters(state)
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(HistViewer);
