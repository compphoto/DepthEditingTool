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
import { cloneCanvas, editBoundingArea, drawCanvasImage, canvasToImage } from "utils/canvasUtils";

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
    loadedRgbImage: null,
    loadedDepthImage: null, // Original Depth Image (Used for Resizing)
    mainDepthCanvas: null, // Initial Scaled Depth Image Canvas (Used for resetting depth image canvas to last saved canvas)
    depthImageDimension: [0, 0, 0, 0],
    initBoundingBox: null,
    croppedeArea: [0, 0, 0, 0],
    prevRgbSize: { width: null, height: null },
    prevDepthSize: { width: null, height: null },
    selectDepth: false
  };
  componentDidMount() {
    this.handleResize();
    window.addEventListener("resize", this.handleResize);
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.rgbImageUrl !== this.props.rgbImageUrl) {
      let rgbCanvas = this.rgbImageRef.current;
      let rgbContext = rgbCanvas.getContext("2d");
      if (this.props.rgbImageUrl === null) {
        rgbContext.clearRect(0, 0, this.state.prevRgbSize.width, this.state.prevRgbSize.height);
      } else {
        let rgbImage = new Image();
        objectUrl = getImageUrl(this.props.rgbImageUrl);
        rgbImage.src = objectUrl;
        rgbImage.onload = () => {
          drawCanvasImage(rgbImage, rgbCanvas, rgbContext);
          this.setLoadedRgb(rgbImage);
          this.setState({ ...this.state, prevRgbSize: { width: rgbCanvas.width, height: rgbCanvas.height } });
        };
      }
    }
    if (prevProps.depthImageUrl !== this.props.depthImageUrl) {
      let depthCanvas = this.depthImageRef.current;
      let depthContext = depthCanvas.getContext("2d");
      if (this.props.depthImageUrl === null) {
        depthContext.clearRect(0, 0, this.state.prevDepthSize.width, this.state.prevDepthSize.height);
      } else {
        let depthImage = new Image();
        objectUrl = getImageUrl(this.props.depthImageUrl);
        depthImage.src = objectUrl;
        depthImage.onload = () => {
          let depthImageDimension = drawCanvasImage(depthImage, depthCanvas, depthContext);
          this.setLoadedDepth(depthImage, depthCanvas, depthImageDimension);
          this.setState({ ...this.state, prevDepthSize: { width: depthCanvas.width, height: depthCanvas.height } });
        };
      }
      if (this.props.depthImageUrl === null) {
        d3.selectAll(".histogram").remove();
        d3.selectAll("g.y-axis").remove();
      } else {
        let histImage = new Image();
        objectUrl = getImageUrl(this.props.depthImageUrl);
        histImage.src = objectUrl;
        histImage.onload = () => {
          if (this.histRef.current) {
            processImage(this.histRef.current, getImageData(histImage));
          }
        };
      }
    }
    if (prevState.selectDepth !== this.state.selectDepth) {
      if (this.state.selectDepth) {
        let depthCanvas = this.depthImageRef.current;
        let depthContext = depthCanvas.getContext("2d");
        depthCanvas.addEventListener("click", event => {
          this.drawBoundingBox(event, depthCanvas, depthContext);
        });
      } else {
        let depthCanvas = this.depthImageRef.current;
        let depthContext = depthCanvas.getContext("2d");
        depthCanvas.removeEventListener("click", event => {
          this.drawBoundingBox(event, depthCanvas, depthContext);
        });
      }
    }
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
    URL.revokeObjectURL(objectUrl);
    let depthCanvas = this.depthImageRef.current;
    let depthContext = depthCanvas.getContext("2d");
    depthCanvas.removeEventListener("click", event => {
      this.drawBoundingBox(event, depthCanvas, depthContext);
    });
  }
  setLoadedRgb = rgbImage => {
    this.setState({ ...this.state, loadedRgbImage: rgbImage });
  };
  setLoadedDepth = (depthImage, depthCanvas, depthImageDimension) => {
    this.setState(
      {
        ...this.state,
        loadedDepthImage: depthImage,
        mainDepthCanvas: cloneCanvas(depthCanvas),
        depthImageDimension: depthImageDimension
      },
      () => {
        this.props.setThreeDepthImage(canvasToImage(this.state.mainDepthCanvas));
      }
    );
  };
  onHandleChange = e => {
    this.props.handleChange(e);
    e.target.value = null;
  };
  handleResize = () => {
    this.setState({ ...this.state, windowWidth: window.innerWidth });
    let { loadedRgbImage, loadedDepthImage } = this.state;
    let rgbCanvas = this.rgbImageRef.current;
    let depthCanvas = this.depthImageRef.current;
    if (rgbCanvas && depthCanvas) {
      let rgbContext = rgbCanvas.getContext("2d");
      let depthContext = depthCanvas.getContext("2d");

      rgbContext.clearRect(0, 0, rgbCanvas.width, rgbCanvas.height);
      depthContext.clearRect(0, 0, depthCanvas.width, depthCanvas.height);

      rgbCanvas.width = (window.innerWidth / 1500) * 521;
      rgbCanvas.height = (window.innerHeight / 1200) * 352;
      depthCanvas.width = (window.innerWidth / 1500) * 521;
      depthCanvas.height = (window.innerHeight / 1200) * 352;

      loadedRgbImage && drawCanvasImage(loadedRgbImage, rgbCanvas, rgbContext);
      if (loadedDepthImage) {
        let depthImageDimension = drawCanvasImage(loadedDepthImage, depthCanvas, depthContext);
        this.setState(
          { ...this.state, mainDepthCanvas: cloneCanvas(depthCanvas), depthImageDimension: depthImageDimension },
          () => {
            this.props.setThreeDepthImage(canvasToImage(this.state.mainDepthCanvas));
          }
        );
      }
    } else {
      return;
    }
  };
  drawBoundingBox = (event, depthCanvas, depthContext) => {
    let { mainDepthCanvas, initBoundingBox, depthImageDimension } = this.state;
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
        this.setState({ ...this.state, initBoundingBox: null, croppedeArea: [new_x, new_y, new_w, new_h] });
      } else {
        depthContext.clearRect(0, 0, depthCanvas.width, depthCanvas.height);
        depthContext.globalAlpha = 1;
        depthContext.drawImage(mainDepthCanvas, 0, 0);
        this.setState({ ...this.state, initBoundingBox: { x, y } });
      }
    }
  };
  render() {
    const { mainDepthCanvas, croppedeArea } = this.state;
    const { rgbImageRef, depthImageRef, histRef, onHandleChange } = this;
    const { toolExtOpen, rgbImageUrl, depthImageUrl, threeDepthImage, setThreeDepthImage, removeItem, removeAllItem } =
      this.props;
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
                <ThreeDViewer rgbImageUrl={rgbImageUrl} depthImageUrl={threeDepthImage} />
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
                  name="rgbImage"
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
                    removeItem("rgbImage");
                    this.setState({ ...this.state, loadedRgbImage: null });
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
                  name="depthImage"
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
                    removeItem("depthImage");
                    this.setState({ ...this.state, loadedDepthImage: null, mainDepthCanvas: null }, () => {
                      setThreeDepthImage(null);
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
            <Button
              onClick={() => {
                this.setState({ ...this.state, selectDepth: !this.state.selectDepth });
              }}
              size="sm"
              color="default"
            >
              Select Depth
            </Button>
            <Button
              onClick={() => {
                this.setState({ ...this.state, mainDepthCanvas: cloneCanvas(depthImageRef.current) }, () => {
                  setThreeDepthImage(canvasToImage(mainDepthCanvas));
                });
              }}
              size="sm"
              color="default"
            >
              Save
            </Button>
            <Button
              onClick={() => {
                const depthCanvas = depthImageRef.current;
                const depthContext = depthCanvas.getContext("2d");
                editBoundingArea(croppedeArea, depthContext);
              }}
              size="sm"
              color="default"
            >
              Increase
            </Button>
            <Button
              onClick={() => {
                removeAllItem();
                this.setState(
                  { ...this.state, loadedRgbImage: null, loadedDepthImage: null, mainDepthCanvas: null },
                  () => {
                    setThreeDepthImage(null);
                  }
                );
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
  rgbImageUrl: imageSelectors.rgbImage(state),
  depthImageUrl: imageSelectors.depthImage(state),
  threeDepthImage: imageSelectors.threeDepthImage(state)
});

const mapDispatchToProps = {
  handleChange: imageActions.handleChange,
  setThreeDepthImage: imageActions.setThreeDepthImage,
  removeItem: imageActions.removeItem,
  removeAllItem: imageActions.removeAllItem
};

export default connect(mapStateToProps, mapDispatchToProps)(MainPane);
