import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { imageActions } from "store/image";
import { selectors as imageSelectors } from "store/image";
import { Helmet } from "react-helmet";
import {
  Container,
  Button,
  CardBody,
  Card,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";
import { AiOutlineClose, AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { MdDoubleArrow, MdCancel } from "react-icons/md";
import { ImUndo2 } from "react-icons/im";
import ImageEditorStyle from "./style";
import SidePane from "components/SidePane";
import MainPane from "components/MainPane";
import { canvasToImage, cloneCanvas, drawLayerCanvas } from "utils/canvasUtils";
import {} from "utils/stackOperations";

export function ImageEditor({
  mainDepthCanvas,
  memoryDepthCanvas,
  depthBitmapCanvas,
  zoomIn,
  zoomOut,
  undo,
  clear,
  reset,
  handleChange
}) {
  const onHandleChange = e => {
    handleChange(e);
    e.target.value = null;
  };
  const openAttachment = id => {
    document.getElementById(id).click();
  };
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
                    <DropdownItem>
                      <p>Test</p>
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
  mainDepthCanvas: imageSelectors.mainDepthCanvas(state),
  memoryDepthCanvas: imageSelectors.memoryDepthCanvas(state),
  depthBitmapCanvas: imageSelectors.depthBitmapCanvas(state),
  layerMode: imageSelectors.layerMode(state),
  operationStack: imageSelectors.operationStack(state)
});

const mapDispatchToProps = {
  handleChange: imageActions.handleChange,
  addEffect: imageActions.addEffect,
  zoomIn: imageActions.zoomIn,
  zoomOut: imageActions.zoomOut,
  undo: imageActions.undo,
  clear: imageActions.clear,
  reset: imageActions.reset
};

export default connect(mapStateToProps, mapDispatchToProps)(ImageEditor);
