import React, { Component } from "react";
import { connect } from "react-redux";
import { selectors as imageSelectors } from "store/image";
import RangeSlider from "./rangeslider";
import HistViewerStyle from "./style";
import { getImageData } from "utils/drawHistogram";

class HistViewer extends Component {
  constructor() {
    super();
  }
  state = {
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    data: []
  };
  componentDidUpdate(prevProps) {
    let { memoryDepthCanvas, parameters } = this.props;
    if (
      prevProps.parameters.croppedCanvasImage !== parameters.croppedCanvasImage ||
      prevProps.memoryDepthCanvas !== memoryDepthCanvas
    ) {
      if (memoryDepthCanvas) {
        if (parameters.croppedCanvasImage) {
          let histDepthData = getImageData(parameters.croppedCanvasImage);
          this.setState({ data: histDepthData });
        } else {
          let histDepthData = getImageData(memoryDepthCanvas);
          this.setState({ data: histDepthData });
        }
      } else {
        this.setState({ data: [] });
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
  memoryDepthCanvas: imageSelectors.memoryDepthCanvas(state),
  parameters: imageSelectors.parameters(state)
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(HistViewer);
