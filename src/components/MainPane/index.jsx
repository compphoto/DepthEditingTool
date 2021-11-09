import React, { useState, useEffect, useRef } from "react";
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

export function MainPane({
  toolExtOpen,
  rgbImageUrl,
  depthImageUrl,
  threeDepthImage,
  setThreeDepthImage,
  handleChange,
  removeItem,
  removeAllItem
}) {
  const rgbImageRef = useRef(null);
  const depthImageRef = useRef(null);
  const histRef = useRef(null);
  const loadedRgbImageRef = useRef(null);
  const loadedDepthImageRef = useRef(null); // Original Depth Image (Used for Resizing)
  const loadedDepthCanvasRef = useRef(null); // Scaled Depth Image Canvas (Used for resetting depth image canvas)
  const depthImageDimension = useRef([0, 0, 0, 0]);
  const boundingBox = useRef(null);
  const croppedeArea = useRef(null);

  const [prevRgbSize, setPrevRgbSize] = useState({ width: null, height: null });
  const [prevDepthSize, setPrevDepthSize] = useState({ width: null, height: null });

  const setLoadedRgb = rgbImage => {
    loadedRgbImageRef.current = rgbImage;
  };

  const setLoadedDepth = (depthImage, depthCanvas) => {
    loadedDepthImageRef.current = depthImage;
    loadedDepthCanvasRef.current = cloneCanvas(depthCanvas);
    setThreeDepthImage(canvasToImage(loadedDepthCanvasRef.current));
  };

  const handleResize = () => {
    const rgbCanvas = rgbImageRef.current;
    const depthCanvas = depthImageRef.current;
    if (rgbCanvas && depthCanvas) {
      const rgbContext = rgbCanvas.getContext("2d");
      const depthContext = depthCanvas.getContext("2d");

      rgbContext.clearRect(0, 0, rgbCanvas.width, rgbCanvas.height);
      depthContext.clearRect(0, 0, depthCanvas.width, depthCanvas.height);

      rgbCanvas.width = (window.innerWidth / 1500) * 521;
      rgbCanvas.height = (window.innerHeight / 1200) * 352;
      depthCanvas.width = (window.innerWidth / 1500) * 521;
      depthCanvas.height = (window.innerHeight / 1200) * 352;

      loadedRgbImageRef.current && drawCanvasImage(loadedRgbImageRef.current, rgbCanvas, rgbContext);
      if (loadedDepthImageRef.current) {
        depthImageDimension.current = drawCanvasImage(loadedDepthImageRef.current, depthCanvas, depthContext);
        loadedDepthCanvasRef.current = cloneCanvas(depthCanvas);
        setThreeDepthImage(canvasToImage(loadedDepthCanvasRef.current));
      }
    } else {
      return;
    }
  };

  const onHandleChange = e => {
    handleChange(e);
    e.target.value = null;
  };

  const drawBoundingBox = (event, depthCanvas, depthContext) => {
    if (loadedDepthCanvasRef.current) {
      const box = boundingBox.current;
      var x = event.layerX;
      var y = event.layerY;
      if (box) {
        let [image_x1, image_y1, image_x2, image_y2] = depthImageDimension.current;
        depthContext.beginPath();
        depthContext.globalAlpha = 0.2;
        depthContext.fillStyle = "blue";
        let new_x = Math.max(Math.min(box.x, x), image_x1);
        let new_y = Math.max(Math.min(box.y, y), image_y1);
        let new_w = Math.min(Math.max(box.x, x), image_x2) - new_x;
        let new_h = Math.min(Math.max(box.y, y), image_y2) - new_y;
        depthContext.fillRect(new_x, new_y, new_w, new_h);
        boundingBox.current = null;
        croppedeArea.current = [new_x, new_y, new_w, new_h];
      } else {
        depthContext.clearRect(0, 0, depthCanvas.width, depthCanvas.height);
        depthContext.globalAlpha = 1;
        depthContext.drawImage(loadedDepthCanvasRef.current, 0, 0);
        boundingBox.current = { x, y };
      }
    }
  };

  useEffect(() => {
    let rgbCanvas = rgbImageRef.current;
    let rgbContext = rgbCanvas.getContext("2d");
    if (rgbImageUrl === null) {
      rgbContext.clearRect(0, 0, prevRgbSize.width, prevRgbSize.height);
    } else {
      let rgbImage = new Image();
      let objectUrl = getImageUrl(rgbImageUrl);
      rgbImage.src = objectUrl;
      rgbImage.onload = () => {
        drawCanvasImage(rgbImage, rgbCanvas, rgbContext);
        setLoadedRgb(rgbImage);
        setPrevRgbSize(prevState => ({ ...prevState, width: rgbCanvas.width, height: rgbCanvas.height }));
      };
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [rgbImageUrl]);

  useEffect(() => {
    let depthCanvas = depthImageRef.current;
    let depthContext = depthCanvas.getContext("2d");
    if (depthImageUrl === null) {
      depthContext.clearRect(0, 0, prevDepthSize.width, prevDepthSize.height);
    } else {
      let depthImage = new Image();
      let objectUrl = getImageUrl(depthImageUrl);
      depthImage.src = objectUrl;
      depthImage.onload = () => {
        depthImageDimension.current = drawCanvasImage(depthImage, depthCanvas, depthContext);
        setLoadedDepth(depthImage, depthCanvas);
        setPrevDepthSize(prevState => ({
          ...prevState,
          width: depthCanvas.width,
          height: depthCanvas.height
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

  useEffect(() => {
    const depthCanvas = depthImageRef.current;
    const depthContext = depthCanvas.getContext("2d");
    depthCanvas.addEventListener("click", function (event) {
      drawBoundingBox(event, depthCanvas, depthContext);
    });
  }, []);

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
                  loadedDepthCanvasRef.current = null;
                  setThreeDepthImage(null);
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
              loadedDepthCanvasRef.current = cloneCanvas(depthImageRef.current);
              setThreeDepthImage(canvasToImage(loadedDepthCanvasRef.current));
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
              editBoundingArea(croppedeArea.current, depthContext);
            }}
            size="sm"
            color="default"
          >
            Increase
          </Button>
          <Button
            onClick={() => {
              removeAllItem();
              loadedRgbImageRef.current = null;
              loadedDepthImageRef.current = null;
              loadedDepthCanvasRef.current = null;
              setThreeDepthImage(null);
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
