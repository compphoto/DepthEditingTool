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
import { canvasToImage } from "utils/canvasUtils";

class MainPane extends Component {
  onHandleChange = e => {
    this.props.handleChange(e);
    e.target.value = null;
  };
  render() {
    const { onHandleChange } = this;
    const { toolExtOpen, rgbImageUrl, depthImageUrl, mainDepthCanvas, removeItem, removeAllItem } = this.props;
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
                <ThreeDViewer rgbImageUrl={rgbImageUrl} depthImageUrl={canvasToImage(mainDepthCanvas)} />
              </div>
              <div className="box histogram-box">
                <HistViewer />
              </div>
            </div>
          </div>
        </div>
        <div className="main-side-bar">
          <div className="main-side-bar-body">
            <div className="main-side-bar-container">
              <p className="main-side-bar-container-text">RGB Image</p>
              <div className="main-side-bar-header">
                <input
                  id="upload-rgb-image"
                  type="file"
                  name="rgbImageUrl"
                  onChange={onHandleChange}
                  accept="image/png, image/gif, image/jpeg, image/jpg"
                />
                <label htmlFor="upload-rgb-image">
                  <div className="btn btn-default">
                    <AiOutlinePlus className="mb-1" /> Import
                  </div>
                </label>
              </div>
              <div style={rgbImageUrl ? { display: "block" } : { display: "none" }} className="main-side-bar-img">
                <img className="side-bar-img" src={getImageUrl(rgbImageUrl)} />
                <div
                  onClick={e => {
                    e.stopPropagation();
                    removeItem({ rgbImageUrl: null, loadedRgbImage: null });
                  }}
                  className="remove-img"
                >
                  <RiDeleteBin5Fill />
                </div>
              </div>
            </div>
            <div className="main-side-bar-divider" tabIndex="-1"></div>
            <div className="main-side-bar-container">
              <p className="main-side-bar-container-text">Depth Image</p>
              <div className="main-side-bar-header">
                <input
                  id="upload-depth-image"
                  type="file"
                  name="depthImageUrl"
                  onChange={onHandleChange}
                  accept="image/png, image/gif, image/jpeg, image/jpg"
                />
                <label htmlFor="upload-depth-image">
                  <div className="btn btn-default">
                    <AiOutlinePlus className="mb-1" /> Import
                  </div>
                </label>
              </div>
              <div style={depthImageUrl ? { display: "block" } : { display: "none" }} className="main-side-bar-img">
                <img className="side-bar-img" src={getImageUrl(depthImageUrl)} />
                <div
                  onClick={e => {
                    e.stopPropagation();
                    removeItem({
                      depthImageUrl: null,
                      loadedDepthImage: null,
                      mainDepthCanvas: null,
                      tools: {
                        currentTool: null,
                        depth: false
                      },
                      parameters: {
                        croppedCanvasImage: null,
                        croppedeArea: null
                      }
                    });
                  }}
                  className="remove-img"
                >
                  <RiDeleteBin5Fill />
                </div>
              </div>
            </div>
          </div>
          <div className="main-side-bar-footer">
            {/* <Button
              onClick={() => {
                if (tempDepthCanvas) {
                  let depthCanvas = depthImageRef.current;
                  let depthContext = depthCanvas.getContext("2d");
                  let tempDepthContext = tempDepthCanvas.getContext("2d");
                  editBoundingArea(parameters.croppedeArea, depthContext);
                  editBoundingArea(parameters.croppedeArea, tempDepthContext);
                }
              }}
              size="sm"
              color="default"
            >
              Increase
            </Button> */}
            <Button
              onClick={() => {
                removeAllItem();
              }}
              size="sm"
              color="default"
            >
              <RiDeleteBin5Fill className="mb-1" /> Clear All
            </Button>
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
  mainDepthCanvas: imageSelectors.mainDepthCanvas(state)
});

const mapDispatchToProps = {
  handleChange: imageActions.handleChange,
  removeItem: imageActions.removeItem,
  removeAllItem: imageActions.removeAllItem
};

export default connect(mapStateToProps, mapDispatchToProps)(MainPane);
