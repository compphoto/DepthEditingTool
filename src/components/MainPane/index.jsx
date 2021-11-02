import React, { useState, useEffect, useRef } from "react";
import { connect } from "react-redux";
import { uploadImageActions } from "store/uploadimage";
import { selectors as toolExtSelectors } from "store/toolext";
import { selectors as uploadImageSelectors } from "store/uploadimage";
import { Button } from "reactstrap";
import { AiOutlinePlus } from "react-icons/ai";
import { RiDeleteBin5Fill } from "react-icons/ri";
import { ThreeDViewer } from "components/ThreeDViewer";
import MainPaneStyle from "./style";

const getImageUrl = file => {
  if (file) {
    return URL.createObjectURL(file);
  }
};

const getImageData = img => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  context.drawImage(img, 0, 0);
  return context.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
};

export function MainPane({ toolExtOpen, handleChange, rgbImageUrl, depthImageUrl, removeItem, removeAllItem }) {
  const rgbImageRef = useRef(null);
  const depthImageRef = useRef(null);
  const histRef = useRef(null);

  const processImage = histImage => {
    const src = new Uint32Array(histImage.data.buffer);

    let histBrightness = new Array(256).fill(0);
    for (let i = 0; i < src.length; i++) {
      let r = src[i] & 0xff;
      let g = (src[i] >> 8) & 0xff;
      let b = (src[i] >> 16) & 0xff;
      histBrightness[r]++;
      histBrightness[g]++;
      histBrightness[b]++;
    }

    let maxBrightness = 0;
    for (let i = 1; i < 256; i++) {
      if (maxBrightness < histBrightness[i]) {
        maxBrightness = histBrightness[i];
      }
    }

    const histCanvas = histRef.current;
    const histContext = histCanvas.getContext("2d");
    let guideHeight = 8;
    let startY = histCanvas.height - guideHeight;
    let dx = histCanvas.width / 256;
    let dy = startY / maxBrightness;
    histContext.lineWidth = dx;
    histContext.fillStyle = "#fff";
    histContext.fillRect(0, 0, histCanvas.width, histCanvas.height);

    for (let i = 0; i < 256; i++) {
      let x = i * dx;
      // Value
      histContext.strokeStyle = "#000000";
      histContext.beginPath();
      histContext.moveTo(x, startY);
      histContext.lineTo(x, startY - histBrightness[i] * dy);
      histContext.closePath();
      histContext.stroke();
      // Guide
      histContext.strokeStyle = "rgb(" + i + ", " + i + ", " + i + ")";
      histContext.beginPath();
      histContext.moveTo(x, startY);
      histContext.lineTo(x, histCanvas.height);
      histContext.closePath();
      histContext.stroke();
    }
  };

  useEffect(() => {
    const rgbCanvas = rgbImageRef.current;
    const rgbContext = rgbCanvas.getContext("2d");
    const rgbImage = new Image();
    const objectUrl = getImageUrl(rgbImageUrl);
    rgbImage.src = objectUrl;
    rgbImage.onload = () => {
      let hRatio = rgbCanvas.width / rgbImage.naturalWidth;
      let vRatio = rgbCanvas.height / rgbImage.naturalHeight;
      let ratio = Math.min(hRatio, vRatio);
      let centerShift_x = (rgbCanvas.width - rgbImage.naturalWidth * ratio) / 2;
      let centerShift_y = (rgbCanvas.height - rgbImage.naturalHeight * ratio) / 2;
      rgbContext.imageSmoothingEnabled = false;
      rgbContext.drawImage(
        rgbImage,
        0,
        0,
        rgbImage.naturalWidth,
        rgbImage.naturalHeight,
        centerShift_x,
        centerShift_y,
        rgbImage.naturalWidth * ratio,
        rgbImage.naturalHeight * ratio
      );
    };
    return () => URL.revokeObjectURL(objectUrl);
  }, [rgbImageUrl]);

  useEffect(() => {
    const depthCanvas = depthImageRef.current;
    const depthContext = depthCanvas.getContext("2d");
    const depthImage = new Image();
    const objectUrl = getImageUrl(depthImageUrl);
    depthImage.src = objectUrl;
    depthImage.onload = () => {
      let hRatio = depthCanvas.width / depthImage.naturalWidth;
      let vRatio = depthCanvas.height / depthImage.naturalHeight;
      let ratio = Math.min(hRatio, vRatio);
      let centerShift_x = (depthCanvas.width - depthImage.naturalWidth * ratio) / 2;
      let centerShift_y = (depthCanvas.height - depthImage.naturalHeight * ratio) / 2;
      depthContext.imageSmoothingEnabled = false;
      depthContext.drawImage(
        depthImage,
        0,
        0,
        depthImage.naturalWidth,
        depthImage.naturalHeight,
        centerShift_x,
        centerShift_y,
        depthImage.naturalWidth * ratio,
        depthImage.naturalHeight * ratio
      );
    };
    return () => URL.revokeObjectURL(objectUrl);
  }, [depthImageUrl]);

  useEffect(() => {
    if (!depthImageUrl) {
      return;
    }

    const histImage = new Image();
    const objectUrl = getImageUrl(depthImageUrl);
    histImage.src = objectUrl;
    histImage.onload = () => {
      processImage(getImageData(histImage));
    };
    return () => URL.revokeObjectURL(objectUrl);
  }, [depthImageUrl]);

  const onHandleChange = e => {
    handleChange(e);
    e.target.value = null;
  };

  return (
    <MainPaneStyle>
      <div className={toolExtOpen ? "main main-shrink" : "main main-expand"}>
        <div className="main-row">
          <div className="main-column main-column-2d">
            <div className="box rgb-box">
              <canvas height="352" width="521" ref={rgbImageRef}></canvas>
            </div>
            <div className="box depth-box">
              <canvas height="352" width="521" ref={depthImageRef}></canvas>
            </div>
          </div>
          <div className="main-column main-column-3d">
            <div className="box threeD-box">
              <ThreeDViewer rgbImageUrl={rgbImageUrl} depthImageUrl={depthImageUrl} />
            </div>
            <div className="box histogram-box">
              <canvas height="200" width="300" ref={histRef}></canvas>
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
