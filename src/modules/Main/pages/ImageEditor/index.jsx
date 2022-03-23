import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { imageActions } from "store/image";
import { selectors as imageSelectors } from "store/image";
import { Helmet } from "react-helmet";
import { Container, Button, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { ImUndo2 } from "react-icons/im";
import ImageEditorStyle from "./style";
import SidePane from "components/SidePane";
import MainPane from "components/MainPane";
import { canvasToImage, cloneCanvas, maskToImage } from "utils/canvasUtils";
import {} from "utils/stackOperations";
import { getImageUrl } from "utils/getImageFromFile";

let objectUrl = null;

export function ImageEditor({
  selectionImageUrl,
  maskImageUrl,
  mainDepthCanvas,
  memoryDepthCanvas,
  operationStack,
  zoomIn,
  zoomOut,
  undo,
  clear,
  reset,
  handleChange,
  updateLayer
}) {
  const onHandleChange = e => {
    handleChange(e);
    e.target.value = null;
  };
  const openAttachment = id => {
    document.getElementById(id).click();
  };
  useEffect(() => {
    if (selectionImageUrl) {
      let selectionImage = new Image();
      objectUrl = getImageUrl(selectionImageUrl);
      selectionImage.src = objectUrl;
      selectionImage.onload = () => {
        updateLayer({
          index: operationStack.activeIndex,
          value: { bitmap: cloneCanvas(selectionImage), toolsParameters: null }
        });
      };
    }
  }, [selectionImageUrl]);
  useEffect(() => {
    if (maskImageUrl) {
      let maskImage = new Image();
      objectUrl = getImageUrl(maskImageUrl);
      maskImage.src = objectUrl;
      maskImage.onload = () => {
        let maskBitmap = maskToImage(cloneCanvas(maskImage), mainDepthCanvas);
        updateLayer({ index: operationStack.activeIndex, value: { bitmap: maskBitmap, toolsParameters: null } });
      };
    }
  }, [maskImageUrl]);
  return (
    <ImageEditorStyle>
      <Helmet>
        <title>Image Editor</title>
      </Helmet>
      <header>
        <input
          id="upload-rgb-image"
          type="file"
          name="rgbImageUrl"
          onChange={onHandleChange}
          accept="image/png, image/gif, image/jpeg, image/jpg"
        />
        <input
          id="upload-depth-image"
          type="file"
          name="depthImageUrl"
          onChange={onHandleChange}
          accept="image/png, image/gif, image/jpeg, image/jpg"
        />
        <input
          id="upload-selection-image"
          type="file"
          name="selectionImageUrl"
          onChange={onHandleChange}
          accept="image/png"
        />
        <input id="upload-mask-image" type="file" name="maskImageUrl" onChange={onHandleChange} accept="image/png" />
        <Container fluid>
          <div className="nav-bar">
            <div className="nav-intro">
              <h4>Image Editor</h4>
              <div className="nav-intro-tabs">
                <UncontrolledDropdown>
                  <DropdownToggle>Files</DropdownToggle>
                  <DropdownMenu>
                    {/* <DropdownItem header>Header</DropdownItem> */}
                    <DropdownItem
                      onClick={() => {
                        openAttachment("upload-rgb-image");
                      }}
                    >
                      <label htmlFor="upload-rgb-image">Open RGB Image</label>
                    </DropdownItem>
                    <DropdownItem
                      onClick={() => {
                        openAttachment("upload-depth-image");
                      }}
                    >
                      <label htmlFor="upload-depth-image">Open Depth Image</label>
                    </DropdownItem>
                    <DropdownItem divider />
                    <DropdownItem
                      disabled={operationStack.activeIndex < 1}
                      onClick={() => {
                        openAttachment("upload-selection-image");
                      }}
                    >
                      <label htmlFor="upload-selection-image">Import Selection Image</label>
                    </DropdownItem>
                    <DropdownItem
                      disabled={operationStack.activeIndex < 1}
                      onClick={() => {
                        openAttachment("upload-mask-image");
                      }}
                    >
                      <label htmlFor="upload-mask-image">Import Selection Mask</label>
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
                <UncontrolledDropdown>
                  <DropdownToggle>Edit</DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem header>Header</DropdownItem>
                    <DropdownItem>Action</DropdownItem>
                    <DropdownItem>Another Action</DropdownItem>
                    <DropdownItem divider />
                    <DropdownItem>Another Action</DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              </div>
            </div>
            <div className="nav-button">
              <Button
                onClick={() => {
                  zoomOut();
                }}
                size="sm"
                color="outline"
              >
                <AiOutlineMinus />
              </Button>
              <Button
                onClick={() => {
                  zoomIn();
                }}
                size="sm"
                color="outline"
              >
                <AiOutlinePlus />
              </Button>
              <Button
                onClick={() => {
                  undo();
                }}
                size="sm"
                color="outline"
              >
                <ImUndo2 />
              </Button>
              <Button
                onClick={() => {
                  clear();
                }}
                size="sm"
                color="secondary"
              >
                Clear
              </Button>
              <Button
                onClick={() => {
                  reset();
                }}
                size="sm"
                color="secondary"
                className="mx-3"
              >
                Reset
              </Button>
              <Button
                onClick={() => {
                  let image = canvasToImage(memoryDepthCanvas);
                  window.location.href = image;
                }}
                disabled={memoryDepthCanvas === null}
                size="sm"
                color="primary"
              >
                Download
              </Button>
            </div>
          </div>
        </Container>
      </header>
      <section>
        <SidePane />
        <MainPane />
      </section>
      <footer>
        <div>Computational Photography Labs SFU</div>
      </footer>
    </ImageEditorStyle>
  );
}

const mapStateToProps = state => ({
  selectionImageUrl: imageSelectors.selectionImageUrl(state),
  maskImageUrl: imageSelectors.maskImageUrl(state),
  mainDepthCanvas: imageSelectors.mainDepthCanvas(state),
  memoryDepthCanvas: imageSelectors.memoryDepthCanvas(state),
  layerMode: imageSelectors.layerMode(state),
  operationStack: imageSelectors.operationStack(state)
});

const mapDispatchToProps = {
  handleChange: imageActions.handleChange,
  updateLayer: imageActions.updateLayer,
  addEffect: imageActions.addEffect,
  zoomIn: imageActions.zoomIn,
  zoomOut: imageActions.zoomOut,
  undo: imageActions.undo,
  clear: imageActions.clear,
  reset: imageActions.reset
};

export default connect(mapStateToProps, mapDispatchToProps)(ImageEditor);
