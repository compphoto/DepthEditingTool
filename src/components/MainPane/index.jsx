import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { uploadImageActions } from "store/uploadimage";
import { selectors as toolExtSelectors } from "store/toolext";
import { selectors as uploadImageSelectors } from "store/uploadimage";
import { Button } from "reactstrap";
import { AiOutlinePlus } from "react-icons/ai";
import { RiDeleteBin5Fill } from "react-icons/ri";
import { ThreeDViewer } from "components/ThreeDViewer";
import MainPaneStyle from "./style";

export function MainPane({ toolExtOpen, handleChange, rgbImage, depthImage, removeItem, removeAllItem }) {
  const [displayImage, setDisplayImage] = useState();
  const getImageUrl = file => {
    if (file) {
      return URL.createObjectURL(file);
    }
  };
  // useEffect(() => {
  //   if (!files[activeImage]) {
  //     setDisplayImage(undefined);
  //     return;
  //   }
  //   const objectUrl = URL.createObjectURL(files[activeImage]);
  //   setDisplayImage(objectUrl);
  //   return () => URL.revokeObjectURL(objectUrl);
  // }, [activeImage, files]);

  const onHandleChange = e => {
    handleChange(e);
    e.target.value = null;
  };

  return (
    <MainPaneStyle>
      <div className={toolExtOpen ? "main main-shrink" : "main main-expand"}>
        <div className="main-row">
          <div className="main-column">
            <div className="box rbg-box"></div>
            <div className="box depth-box"></div>
          </div>
          <div className="main-column">
            <div className="box histogram-box"></div>
            <div className="box threeD-box">
              <ThreeDViewer />
            </div>
          </div>
        </div>
        {/* <img src={displayImage} /> */}
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
            <div style={rgbImage ? { display: "block" } : { display: "none" }} className="main-side-bar-img">
              <img className="side-bar-img" src={getImageUrl(rgbImage)} />
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
            <div style={depthImage ? { display: "block" } : { display: "none" }} className="main-side-bar-img">
              <img className="side-bar-img" src={getImageUrl(depthImage)} />
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
  rgbImage: uploadImageSelectors.rgbImage(state),
  depthImage: uploadImageSelectors.depthImage(state)
});

const mapDispatchToProps = {
  handleChange: uploadImageActions.handleChange,
  removeItem: uploadImageActions.removeItem,
  removeAllItem: uploadImageActions.removeAllItem
};

export default connect(mapStateToProps, mapDispatchToProps)(MainPane);
