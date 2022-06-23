import React, { Component } from "react";
import { connect } from "react-redux";
import { selectors as toolExtSelectors } from "store/toolext";
import { selectors as imageSelectors } from "store/image";
import DepthViewer from "components/DepthViewer";
import RgbViewer from "components/RgbViewer";
import HistViewer from "components/HistViewer";
import ThreeDViewer from "components/ThreeDViewer";
import MainPaneStyle from "./style";
import { canvasToImage } from "utils/canvasUtils";

class MainPane extends Component {
  render() {
    const { toolExtOpen, memoryRgbCanvas, memoryDepthCanvas } = this.props;
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
                  rgbImageCanvas={canvasToImage(memoryRgbCanvas)}
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
  memoryRgbCanvas: imageSelectors.memoryRgbCanvas(state),
  memoryDepthCanvas: imageSelectors.memoryDepthCanvas(state)
});

export default connect(mapStateToProps, null)(MainPane);
