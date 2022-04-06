import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { imageActions } from "store/image";
import { selectors as imageSelectors } from "store/image";
import { djangoActions } from "store/django";
import { selectors as djangoSelectors } from "store/django";
import { Helmet } from "react-helmet";
import { Container, Button, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import ImageEditorStyle from "./style";
import SidePane from "components/SidePane";
import MainPane from "components/MainPane";
import { canvasToImage, cloneCanvas, downloadCanvas, getGroundMask, maskToImage } from "utils/canvasUtils";
import { getImageUrl } from "utils/getImageFromFile";

let objectUrl = null;

function arrayBufferToBase64(buffer) {
  var binary = "";
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export function ImageEditor({
  groundImage,
  selectionImageUrl,
  maskImageUrl,
  mainRgbCanvas,
  mainDepthCanvas,
  memoryDepthCanvas,
  operationStack,
  zoomIn,
  zoomOut,
  undo,
  clear,
  reset,
  handleChange,
  updateLayer,
  getGround
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
  useEffect(() => {
    if (groundImage) {
      let groundMaskImage = new Image();
      groundMaskImage.src = "data:image/png;base64," + arrayBufferToBase64(groundImage);
      groundMaskImage.onload = () => {
        let rectangle = [0, 384, 768, 384];
        let groundMaskBitmap = getGroundMask(groundMaskImage, mainDepthCanvas, rectangle);
        updateLayer({ index: operationStack.activeIndex, value: { bitmap: groundMaskBitmap, toolsParameters: null } });
      };
    }
  }, [groundImage]);
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
                    <DropdownItem divider />
                    <DropdownItem
                      disabled={mainRgbCanvas === null}
                      onClick={() => {
                        downloadCanvas(mainRgbCanvas, "modified-rgb.png");
                      }}
                    >
                      <label>Export RGB Image</label>
                    </DropdownItem>
                    <DropdownItem
                      disabled={memoryDepthCanvas === null}
                      onClick={() => {
                        downloadCanvas(memoryDepthCanvas, "modified-depth.png");
                      }}
                    >
                      <label>Export Depth Image</label>
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
                <UncontrolledDropdown>
                  <DropdownToggle>Edit</DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem
                      disabled={memoryDepthCanvas === null}
                      onClick={() => {
                        undo();
                      }}
                    >
                      <label>Undo</label>
                    </DropdownItem>
                    <DropdownItem
                      disabled={memoryDepthCanvas === null || mainRgbCanvas === null}
                      onClick={() => {
                        clear();
                      }}
                    >
                      <label>Clear</label>
                    </DropdownItem>
                    <DropdownItem
                      disabled={memoryDepthCanvas === null || mainRgbCanvas === null}
                      onClick={() => {
                        reset();
                      }}
                    >
                      <label>Reset</label>
                    </DropdownItem>
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
                disabled={memoryDepthCanvas === null}
                onClick={() => {
                  let points =
                    "[(366, 35, 0.8431372549019608),(166, 35, 0.47843137254901963),(66, 100, 0.33725490196078434),(316, 200, 0.7411764705882353),(216, 300, 0.38823529411764707),(266, 500, 0.5764705882352941),(166, 750, 0.3254901960784314)]";
                  let formData = new FormData();
                  formData.append("image", canvasToImage(memoryDepthCanvas));
                  formData.append("rectangle", "(0, 384, 768, 384)");
                  formData.append("points", points);
                  formData.append("z_length", 250);
                  formData.append("threshold", 1);
                  getGround(formData);
                }}
                size="sm"
                color="primary"
              >
                Test Estimate
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
  groundImage: djangoSelectors.groundImage(state),
  selectionImageUrl: imageSelectors.selectionImageUrl(state),
  maskImageUrl: imageSelectors.maskImageUrl(state),
  mainRgbCanvas: imageSelectors.mainRgbCanvas(state),
  mainDepthCanvas: imageSelectors.mainDepthCanvas(state),
  memoryDepthCanvas: imageSelectors.memoryDepthCanvas(state),
  operationStack: imageSelectors.operationStack(state)
});

const mapDispatchToProps = {
  getGround: djangoActions.getGround,
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
