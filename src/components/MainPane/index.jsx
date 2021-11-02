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
  const src = new Uint32Array(context.getImageData(0, 0, img.naturalWidth, img.naturalHeight).data.buffer);
  let histBrightness = new Array(256).fill(0);
  for (let i = 0; i < src.length; i++) {
    let r = src[i] & 0xff;
    let g = (src[i] >> 8) & 0xff;
    let b = (src[i] >> 16) & 0xff;
    histBrightness[r]++;
    histBrightness[g]++;
    histBrightness[b]++;
  }
  return histBrightness;
};

export function MainPane({ toolExtOpen, handleChange, rgbImageUrl, depthImageUrl, removeItem, removeAllItem }) {
  const rgbImageRef = useRef(null);
  const depthImageRef = useRef(null);
  const histRef = useRef(null);
  let yAxis = false;

  const processImage = histBrightness => {
    let W = 800;
    let H = W / 2;
    const svg = d3.select("#hist-svg");
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = W - margin.left - margin.right;
    const height = H - margin.top - margin.bottom;
    let q = histRef.current;
    q.style.width = W;
    q.style.height = H;
    if (yAxis) {
      d3.selectAll("g.y-axis").remove();
      yAxis = false;
    }

    function graphComponent(histData) {
      d3.selectAll(".histogram").remove();
      var data = histData.map((key, value) => {
        return { freq: value, idx: +key };
      });
      var x = d3
        .scaleLinear()
        .range([0, width])
        .domain([
          0,
          d3.max(data, d => {
            return d.idx;
          })
        ]);
      var y = d3
        .scaleLinear()
        .range([height, 0])
        .domain([
          0,
          d3.max(data, d => {
            return d.freq;
          })
        ]);
      var g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);
      if (!yAxis) {
        yAxis = true;
        g.append("g")
          .attr("class", "y-axis")
          .attr("transform", "translate(" + -5 + ",0)")
          .call(d3.axisLeft(y).ticks(10).tickSizeInner(10).tickSizeOuter(2));
      }
      g.selectAll(".histogram")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "histogram")
        .attr("fill", "gray")
        .attr("x", d => {
          return x(d.idx);
        })
        .attr("y", d => {
          return y(d.freq);
        })
        .attr("width", 2)
        .attr("opacity", 0.8)
        .attr("height", d => {
          return height - y(d.freq);
        });
    }
    graphComponent(histBrightness);
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
              <svg id="hist-svg" width="1" height="1" ref={histRef}></svg>
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
