import React, { Component, createRef } from "react";
import { connect } from "react-redux";
import { imageActions } from "store/image";
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
    data: [],
    pixelToIntensityMap: {}
  };
  componentDidUpdate(prevProps, prevState) {
    let { parameters } = this.props;
    if (prevProps.parameters.croppedCanvasImage !== parameters.croppedCanvasImage) {
      if (parameters.croppedCanvasImage) {
        let [histDepthData, histDepthMapper] = getImageData(parameters.croppedCanvasImage);
        this.setState({ data: histDepthData, pixelToIntensityMap: histDepthMapper });
      }
    }
  }
  render() {
    const { data, pixelToIntensityMap } = this.state;
    return (
      <HistViewerStyle>
        <RangeSlider data={data} pixelToIntensityMap={pixelToIntensityMap} />
      </HistViewerStyle>
    );
  }
}

const mapStateToProps = state => ({
  parameters: imageSelectors.parameters(state)
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(HistViewer);
