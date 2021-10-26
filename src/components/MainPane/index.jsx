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

export function MainPane({
  toolExtOpen,
  handleChange,
  files,
  selectActiveImage,
  activeImage,
  removeItem,
  removeAllItem
}) {
  const [displayImage, setDisplayImage] = useState();
  const getImageUrl = file => {
    return URL.createObjectURL(file);
  };
  useEffect(() => {
    if (!files[activeImage]) {
      setDisplayImage(undefined);
      return;
    }
    const objectUrl = URL.createObjectURL(files[activeImage]);
    setDisplayImage(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [activeImage, files]);

  const onHandleChange = e => {
    handleChange(e);
    e.target.value = null;
  };

  return (
    <MainPaneStyle>
      <div className={toolExtOpen ? "main main-shrink" : "main main-expand"}>
        {/* <img src={displayImage} /> */}
        <ThreeDViewer />
      </div>
      <div className="main-side-bar">
        <div className="main-side-bar-body">
          <div className="main-side-bar-container">
            <p className="main-side-bar-container-text">RGB Image</p>
            <div className="main-side-bar-header">
              <input
                id="upload-image"
                type="file"
                onChange={onHandleChange}
                accept="image/png, image/gif, image/jpeg, image/jpg"
                multiple
              />
              <label htmlFor="upload-image">
                <div className="btn btn-default">
                  <AiOutlinePlus className="mb-1" /> Import
                </div>
              </label>
            </div>
            <div className="main-side-bar-content">
              {files.map((file, key) => (
                <div
                  key={key}
                  onClick={() => {
                    selectActiveImage(key);
                  }}
                  className={activeImage === key ? "main-side-bar-img main-side-bar-img-active" : "main-side-bar-img"}
                >
                  <img className="side-bar-img" src={getImageUrl(file)} />
                  <div
                    onClick={e => {
                      e.stopPropagation();
                      removeItem(key);
                    }}
                    className="remove-img"
                  >
                    <RiDeleteBin5Fill />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="main-side-bar-divider" tabIndex="-1"></div>
          <div className="main-side-bar-container">
            <p className="main-side-bar-container-text">Depth Image</p>
            <div className="main-side-bar-header">
              <input
                id="upload-image"
                type="file"
                onChange={onHandleChange}
                accept="image/png, image/gif, image/jpeg, image/jpg"
                multiple
              />
              <label htmlFor="upload-image">
                <div className="btn btn-default">
                  <AiOutlinePlus className="mb-1" /> Import
                </div>
              </label>
            </div>
            <div className="main-side-bar-content">
              {files.map((file, key) => (
                <div
                  key={key}
                  onClick={() => {
                    selectActiveImage(key);
                  }}
                  className={activeImage === key ? "main-side-bar-img main-side-bar-img-active" : "main-side-bar-img"}
                >
                  <img className="side-bar-img" src={getImageUrl(file)} />
                  <div
                    onClick={e => {
                      e.stopPropagation();
                      removeItem(key);
                    }}
                    className="remove-img"
                  >
                    <RiDeleteBin5Fill />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="main-side-bar-footer">
          <p>{`${activeImage !== null ? activeImage + 1 : 0}/${files.length}`}</p>
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
  files: uploadImageSelectors.files(state),
  activeImage: uploadImageSelectors.activeImage(state)
});

const mapDispatchToProps = {
  handleChange: uploadImageActions.handleChange,
  selectActiveImage: uploadImageActions.selectActiveImage,
  removeItem: uploadImageActions.removeItem,
  removeAllItem: uploadImageActions.removeAllItem
};

export default connect(mapStateToProps, mapDispatchToProps)(MainPane);
