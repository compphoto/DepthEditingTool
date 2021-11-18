import React, { Component, createRef } from "react";
import * as d3 from "d3";
import { connect } from "react-redux";
import { imageActions } from "store/image";
import { selectors as toolExtSelectors } from "store/toolext";
import { selectors as imageSelectors } from "store/image";
import { Button } from "reactstrap";
import { AiOutlinePlus } from "react-icons/ai";
import { RiDeleteBin5Fill } from "react-icons/ri";
import { ThreeDViewer } from "components/ThreeDViewer";
import MainPaneStyle from "./style";
import { getImageUrl } from "utils/getImageFromFile";
import { getImageData, processImage } from "utils/drawHistogram";
import { cloneCanvas, editBoundingArea, drawCanvasImage, canvasToImage, cropCanvas } from "utils/canvasUtils";

let objectUrl = null;

class MainPane extends Component {
  constructor() {
    super();
    this.rgbImageRef = createRef();
    this.depthImageRef = createRef();
    this.histRef = createRef();
  }
  state = {
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    initBoundingBox: null
  };
  componentDidMount() {
    this.handleResize();
    window.addEventListener("resize", this.handleResize);
  }
  componentDidUpdate(prevProps, prevState) {
    let { rgbImageRef, depthImageRef } = this;
    let { rgbImageUrl, depthImageUrl, mainDepthCanvas, prevRgbSize, prevDepthSize, tools, parameters, initImage } =
      this.props;
    let rgbCanvas = rgbImageRef.current;
    let rgbContext = rgbCanvas.getContext("2d");
    let depthCanvas = depthImageRef.current;
    let depthContext = depthCanvas.getContext("2d");
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
    if (prevProps.depthImageUrl !== depthImageUrl) {
      d3.selectAll(".histogram").remove();
      d3.selectAll("g.y-axis").remove();
      d3.selectAll("text").remove();
      depthContext.clearRect(0, 0, prevDepthSize.width, prevDepthSize.height);
      let depthImage = new Image();
      objectUrl = getImageUrl(depthImageUrl);
      depthImage.src = objectUrl;
      depthImage.onload = () => {
        let depthImageDimension = drawCanvasImage(depthImage, depthCanvas, depthContext);
        initImage({
          loadedDepthImage: depthImage,
          mainDepthCanvas: cloneCanvas(depthCanvas),
          tempDepthCanvas: cloneCanvas(depthCanvas),
          depthImageDimension: depthImageDimension,
          prevDepthSize: { width: depthCanvas.width, height: depthCanvas.height }
        });
      };
    }
    if (prevProps.parameters.croppedCanvasImage !== parameters.croppedCanvasImage) {
      if (parameters.croppedCanvasImage && this.histRef.current) {
        processImage(this.histRef.current, getImageData(parameters.croppedCanvasImage));
      }
    }
    if (prevProps.tools.depth !== tools.depth) {
      if (tools.depth) {
        depthCanvas.addEventListener("click", this.drawBoundingBox);
      } else {
        depthCanvas.removeEventListener("click", this.drawBoundingBox);
        depthContext.clearRect(0, 0, depthCanvas.width, depthCanvas.height);
        depthContext.globalAlpha = 1;
        depthContext.drawImage(mainDepthCanvas, 0, 0);
        initImage({ tempDepthCanvas: cloneCanvas(depthCanvas) });
      }
    }
    if (prevProps.mainDepthCanvas !== mainDepthCanvas) {
      if (mainDepthCanvas) {
        depthContext.clearRect(0, 0, depthCanvas.width, depthCanvas.height);
        depthContext.globalAlpha = 1;
        depthContext.drawImage(mainDepthCanvas, 0, 0);
      }
    }
  }
  componentWillUnmount() {
    let depthCanvas = this.depthImageRef.current;
    window.removeEventListener("resize", this.handleResize);
    depthCanvas.removeEventListener("click", this.drawBoundingBox);
    URL.revokeObjectURL(objectUrl);
  }
  onHandleChange = e => {
    this.props.handleChange(e);
    e.target.value = null;
  };
  handleResize = () => {
    this.setState({ ...this.state, windowWidth: window.innerWidth });
    let { loadedRgbImage, loadedDepthImage, initImage, parameters } = this.props;
    let rgbCanvas = this.rgbImageRef.current;
    let depthCanvas = this.depthImageRef.current;
    if (rgbCanvas && depthCanvas) {
      let rgbContext = rgbCanvas.getContext("2d");
      let depthContext = depthCanvas.getContext("2d");

      rgbCanvas.width = (window.innerWidth / 1500) * 521;
      rgbCanvas.height = (window.innerHeight / 1200) * 352;
      depthCanvas.width = (window.innerWidth / 1500) * 521;
      depthCanvas.height = (window.innerHeight / 1200) * 352;

      if (loadedRgbImage) {
        let rgbImageDimension = drawCanvasImage(loadedRgbImage, rgbCanvas, rgbContext);
        initImage({
          rgbImageDimension: rgbImageDimension,
          prevRgbSize: { width: rgbCanvas.width, height: rgbCanvas.height }
        });
      }
      if (loadedDepthImage) {
        let depthImageDimension = drawCanvasImage(loadedDepthImage, depthCanvas, depthContext);
        initImage({
          mainDepthCanvas: cloneCanvas(depthCanvas),
          tempDepthCanvas: cloneCanvas(depthCanvas),
          depthImageDimension: depthImageDimension,
          prevDepthSize: { width: depthCanvas.width, height: depthCanvas.height }
        });
      }
      if (parameters.croppedCanvasImage) {
        processImage(this.histRef.current, getImageData(parameters.croppedCanvasImage));
      }
    } else {
      return;
    }
  };
  drawBoundingBox = event => {
    let { initBoundingBox } = this.state;
    let { mainDepthCanvas, tempDepthCanvas, depthImageDimension, storeParameters } = this.props;
    let depthCanvas = this.depthImageRef.current;
    let depthContext = depthCanvas.getContext("2d");
    if (mainDepthCanvas) {
      let x = event.layerX;
      let y = event.layerY;
      if (initBoundingBox) {
        let [image_x1, image_y1, image_x2, image_y2] = depthImageDimension;
        depthContext.beginPath();
        depthContext.globalAlpha = 0.2;
        depthContext.fillStyle = "blue";
        let new_x = Math.max(Math.min(initBoundingBox.x, x), image_x1);
        let new_y = Math.max(Math.min(initBoundingBox.y, y), image_y1);
        let new_w = Math.min(Math.max(initBoundingBox.x, x), image_x2) - new_x;
        let new_h = Math.min(Math.max(initBoundingBox.y, y), image_y2) - new_y;
        depthContext.fillRect(new_x, new_y, new_w, new_h);
        let croppedArea = [new_x, new_y, new_w, new_h];
        this.setState({ initBoundingBox: null }, () => {
          storeParameters({ croppedCanvasImage: cropCanvas(tempDepthCanvas, croppedArea), croppedeArea: croppedArea });
        });
      } else {
        depthContext.clearRect(0, 0, depthCanvas.width, depthCanvas.height);
        depthContext.globalAlpha = 1;
        depthContext.drawImage(mainDepthCanvas, 0, 0);
        this.setState({ initBoundingBox: { x, y } });
      }
    }
  };
  render() {
    const { rgbImageRef, depthImageRef, histRef, onHandleChange } = this;
    const {
      toolExtOpen,
      rgbImageUrl,
      depthImageUrl,
      mainDepthCanvas,
      tempDepthCanvas,
      parameters,
      initImage,
      selectTool,
      removeItem,
      removeAllItem
    } = this.props;
    return (
      <MainPaneStyle>
        <div className={toolExtOpen ? "main main-shrink" : "main main-expand"}>
          <div className="main-row">
            <div className="main-column main-column-2d">
              <div className="box rgb-box">
                <canvas
                  width={(window.innerWidth / 1500) * 521}
                  height={(window.innerHeight / 1200) * 352}
                  ref={rgbImageRef}
                ></canvas>
              </div>
              <div className="box depth-box">
                <canvas
                  width={(window.innerWidth / 1500) * 521}
                  height={(window.innerHeight / 1200) * 352}
                  ref={depthImageRef}
                ></canvas>
              </div>
            </div>
            <div className="main-column main-column-3d">
              <div className="box threeD-box">
                <ThreeDViewer rgbImageUrl={rgbImageUrl} depthImageUrl={canvasToImage(mainDepthCanvas)} />
              </div>
              <div className="box histogram-box">
                <svg id="hist-svg" height="1" width="1" ref={histRef}></svg>
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
                    removeItem({ depthImageUrl: null, loadedDepthImage: null, mainDepthCanvas: null });
                  }}
                  className="remove-img"
                >
                  <RiDeleteBin5Fill />
                </div>
              </div>
            </div>
          </div>
          <div className="main-side-bar-footer">
            <Button
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
            </Button>
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
  loadedRgbImage: imageSelectors.loadedRgbImage(state),
  loadedDepthImage: imageSelectors.loadedDepthImage(state),
  mainDepthCanvas: imageSelectors.mainDepthCanvas(state),
  tempDepthCanvas: imageSelectors.tempDepthCanvas(state),
  rgbImageDimension: imageSelectors.rgbImageDimension(state),
  depthImageDimension: imageSelectors.depthImageDimension(state),
  prevRgbSize: imageSelectors.prevRgbSize(state),
  prevDepthSize: imageSelectors.prevDepthSize(state),
  tools: imageSelectors.tools(state),
  parameters: imageSelectors.parameters(state)
});

const mapDispatchToProps = {
  handleChange: imageActions.handleChange,
  initImage: imageActions.initImage,
  selectTool: imageActions.selectTool,
  storeParameters: imageActions.storeParameters,
  removeItem: imageActions.removeItem,
  removeAllItem: imageActions.removeAllItem
};

export default connect(mapStateToProps, mapDispatchToProps)(MainPane);
