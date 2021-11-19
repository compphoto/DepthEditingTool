import React, { Component, createRef } from "react";
import { connect } from "react-redux";
import { imageActions } from "store/image";
import { selectors as imageSelectors } from "store/image";
import { Grid, Typography } from "@material-ui/core";
import RangeSlider from "./rangeslider";
import HistViewerStyle from "./style";
import { getImageData } from "utils/drawHistogram";

const prices = [];
for (let i = 0; i < 500; i++) {
  prices.push(Math.floor(Math.random() * 80) + 1);
}

class HistViewer extends Component {
  constructor() {
    super();
  }
  state = {
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    data: null
  };
  componentDidUpdate(prevProps, prevState) {
    let { parameters } = this.props;
    if (prevProps.parameters.croppedCanvasImage !== parameters.croppedCanvasImage) {
      if (parameters.croppedCanvasImage) {
        let histDepthData = getImageData(parameters.croppedCanvasImage);
        this.setState({ data: histDepthData });
      }
    }
  }
  render() {
    const { data } = this.state;
    console.warn(prices);
    return (
      <HistViewerStyle>
        <RangeSlider data={data || prices} />
      </HistViewerStyle>
    );
  }
}

const mapStateToProps = state => ({
  parameters: imageSelectors.parameters(state)
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(HistViewer);
