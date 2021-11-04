import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { connect } from "react-redux";
import { uploadImageActions } from "store/uploadimage";
import { selectors as toolExtSelectors } from "store/toolext";
import { selectors as uploadImageSelectors } from "store/uploadimage";
import { Button } from "reactstrap";
import { AiOutlinePlus } from "react-icons/ai";
import { RiDeleteBin5Fill } from "react-icons/ri";
import { ThreeDViewer } from "components/ThreeDViewer";
import MainPaneStyle from "./style";
import { getImageUrl } from "utils/getImageFromFile";
import { getImageData, processImage } from "utils/drawHistogram";
import { drawCanvasImage } from "utils/canvasUtils";

export function MainPane({ toolExtOpen, rgbImageUrl, depthImageUrl, handleChange, removeItem, removeAllItem }) {
  const rgbImageRef = useRef(null);
  const depthImageRef = useRef(null);
  const histRef = useRef(null);
  const [prevRbgSize, setPrevRbgSize] = useState({ width: null, height: null });
  const [prevDepthSize, setPrevDepthSize] = useState({ width: null, height: null });

  const loadedRgbImageRef = useRef(null);
  const loadedDepthImageRef = useRef(null);
  const setLoadedRgbImage = rgbImage => {
    loadedRgbImageRef.current = rgbImage;
  };
  const setLoadedDepthImage = depthImage => {
    loadedDepthImageRef.current = depthImage;
  };

  const handleResize = () => {
    const rgbCanvas = rgbImageRef.current;
    const depthCanvas = depthImageRef.current;
    if (rgbCanvas && depthCanvas) {
      const rgbContext = rgbCanvas.getContext("2d");
      const depthContext = depthCanvas.getContext("2d");

      rgbCanvas.width = (window.innerWidth / 1200) * 521;
      rgbCanvas.height = (window.innerHeight / 900) * 352;
      depthCanvas.width = (window.innerWidth / 1200) * 521;
      depthCanvas.height = (window.innerHeight / 900) * 352;

      loadedRgbImageRef.current && drawCanvasImage(loadedRgbImageRef.current, rgbCanvas, rgbContext);
      loadedDepthImageRef.current && drawCanvasImage(loadedDepthImageRef.current, depthCanvas, depthContext);
    } else {
      return;
    }
  };

  const onHandleChange = e => {
    handleChange(e);
    e.target.value = null;
  };

  useEffect(() => {
    const rgbCanvas = rgbImageRef.current;
    const rgbContext = rgbCanvas.getContext("2d");
    if (rgbImageUrl === null) {
      rgbContext.clearRect(0, 0, prevRbgSize.width, prevRbgSize.height);
    } else {
      const rgbImage = new Image();
      const objectUrl = getImageUrl(rgbImageUrl);
      rgbImage.src = objectUrl;
      rgbImage.onload = () => {
        setLoadedRgbImage(rgbImage);
        drawCanvasImage(rgbImage, rgbCanvas, rgbContext);
        setPrevRbgSize(prevState => ({ ...prevState, width: rgbImage.naturalWidth, height: rgbImage.naturalHeight }));
      };
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [rgbImageUrl]);

  useEffect(() => {
    const depthCanvas = depthImageRef.current;
    const depthContext = depthCanvas.getContext("2d");
    if (depthImageUrl === null) {
      depthContext.clearRect(0, 0, prevDepthSize.width, prevDepthSize.height);
    } else {
      const depthImage = new Image();
      const objectUrl = getImageUrl(depthImageUrl);
      depthImage.src = objectUrl;
      depthImage.onload = () => {
        setLoadedDepthImage(depthImage);
        drawCanvasImage(depthImage, depthCanvas, depthContext);
        setPrevDepthSize(prevState => ({
          ...prevState,
          width: depthImage.naturalWidth,
          height: depthImage.naturalHeight
        }));
      };
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [depthImageUrl]);

  useEffect(() => {
    if (depthImageUrl === null) {
      d3.selectAll(".histogram").remove();
      d3.selectAll("g.y-axis").remove();
    } else {
      const histImage = new Image();
      const objectUrl = getImageUrl(depthImageUrl);
      histImage.src = objectUrl;
      histImage.onload = () => {
        processImage(histRef, getImageData(histImage));
      };
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [depthImageUrl]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <MainPaneStyle>
      <div className={toolExtOpen ? "main main-shrink" : "main main-expand"}>
        <div className="main-row">
          <div className="main-column main-column-2d">
            <div className="box rgb-box">
              <canvas
                width={(window.innerWidth / 1200) * 521}
                height={(window.innerHeight / 900) * 352}
                ref={rgbImageRef}
              ></canvas>
            </div>
            <div className="box depth-box">
              <canvas
                width={(window.innerWidth / 1200) * 521}
                height={(window.innerHeight / 900) * 352}
                ref={depthImageRef}
              ></canvas>
            </div>
          </div>
          <div className="main-column main-column-3d">
            <div className="box threeD-box">
              <ThreeDViewer rgbImageUrl={rgbImageUrl} depthImageUrl={depthImageUrl} />
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
                  loadedRgbImageRef.current = null;
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
                  loadedDepthImageRef.current = null;
                }}
                className="remove-img"
              >
                <RiDeleteBin5Fill />
              </div>
            </div>
          </div>
        </div>
        <div className="main-side-bar-footer">
          <Button onClick={removeAllItem} size="sm" color="default">
            <RiDeleteBin5Fill className="mb-1" /> Clear All
          </Button>
        </div>
      </div>
    </MainPaneStyle>
  );
}

const mapStateToProps = state => ({
  toolExtOpen: toolExtSelectors.toolExtOpen(state),
  rgbImageUrl: uploadImageSelectors.rgbImage(state),
  depthImageUrl: uploadImageSelectors.depthImage(state)
});

const mapDispatchToProps = {
  handleChange: uploadImageActions.handleChange,
  removeItem: uploadImageActions.removeItem,
  removeAllItem: uploadImageActions.removeAllItem
};

export default connect(mapStateToProps, mapDispatchToProps)(MainPane);
