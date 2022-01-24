import React, { Component, createRef } from "react";
import { connect } from "react-redux";
import { imageActions } from "store/image";
import { selectors as toolExtSelectors } from "store/toolext";
import { selectors as imageSelectors } from "store/image";
import { Button } from "reactstrap";
import { AiOutlinePlus } from "react-icons/ai";
import { RiDeleteBin5Fill } from "react-icons/ri";
import DepthViewer from "components/DepthViewer";
import RgbViewer from "components/RgbViewer";
import HistViewer from "components/HistViewer";
import ThreeDViewer from "components/ThreeDViewer";
import MainPaneStyle from "./style";
import { getImageUrl } from "utils/getImageFromFile";
import { canvasToImage, cropCanvas } from "utils/canvasUtils";

class MainPane extends Component {
  onHandleChange = e => {
    this.props.handleChange(e);
    e.target.value = null;
  };
  render() {
    const { onHandleChange } = this;
    const {
      toolExtOpen,
      rgbImageUrl,
      depthImageUrl,
      displayRgbCanvas,
      memoryDepthCanvas,
      operationStack,
      removeItem,
      removeAllItem
    } = this.props;
    return (
      <MainPaneStyle>
        <div className={toolExtOpen ? "main main-shrink" : "main main-expand"}>
          <div className="main-row">
            <div className="main-column main-column-2d">
              <div className="box rgb-box">
                <RgbViewer />
              </div>
              <div className="box depth-box">
                <DepthViewer />
              </div>
            </div>
            <div className="main-column main-column-3d">
              <div className="box threeD-box">
                <ThreeDViewer
                  rgbImageCanvas={canvasToImage(displayRgbCanvas)}
                  depthImageCanvas={canvasToImage(memoryDepthCanvas)}
                />
              </div>
              <div className="box histogram-box">
                <HistViewer />
              </div>
            </div>
          </div>
        </div>
      </MainPaneStyle>
    );
  }
}

const mapStateToProps = state => ({
  toolExtOpen: toolExtSelectors.toolExtOpen(state),
  rgbImageUrl: imageSelectors.rgbImageUrl(state),
  depthImageUrl: imageSelectors.depthImageUrl(state),
  displayRgbCanvas: imageSelectors.displayRgbCanvas(state),
  memoryDepthCanvas: imageSelectors.memoryDepthCanvas(state),
  operationStack: imageSelectors.operationStack(state)
});

const mapDispatchToProps = {
  handleChange: imageActions.handleChange,
  removeItem: imageActions.removeItem,
  removeAllItem: imageActions.removeAllItem
};

export default connect(mapStateToProps, mapDispatchToProps)(MainPane);
