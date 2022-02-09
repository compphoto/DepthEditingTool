import React, { useState, useEffect, Fragment } from "react";
import { connect } from "react-redux";
import { imageActions } from "store/image";
import { selectors as imageSelectors } from "store/image";
import { Helmet } from "react-helmet";
import { Container, Button, CardBody, Card } from "reactstrap";
import { AiOutlineClose, AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { MdDoubleArrow, MdCancel } from "react-icons/md";
import { ImUndo2 } from "react-icons/im";
import ImageEditorStyle from "./style";
import SidePane from "components/SidePane";
import MainPane from "components/MainPane";
import UploadPane from "components/UploadPane";
import { canvasToImage, cloneCanvas, drawLayerCanvas } from "utils/canvasUtils";
import {} from "utils/stackOperations";

export function ImageEditor({
  memoryDepthCanvas,
  depthBitmapCanvas,
  zoomIn,
  zoomOut,
  undo,
  clear,
  reset,
  layerMode,
  operationStack,
  toggleLayerMode,
  addEffect,
  addLayer,
  updateLayerIndex,
  updateLayer,
  removeLayer,
  removeAllLayers
}) {
  const [layerToggle, setLayerToggle] = useState(false);
  const [layers, setLayers] = useState(null);
  useEffect(() => {
    let tempLayer = operationStack.layerStack.map((element, key) => {
      let image = canvasToImage(element.bitmap);
      return (
        <Fragment key={key}>
          <div
            onClick={() => {
              updateLayerIndex(key);
            }}
            className={
              operationStack.activeIndex === key
                ? "my-2 layer-mode-body-content layer-mode-body-content-active"
                : "my-2 layer-mode-body-content"
            }
          >
            <Card className="layer-mode-body-content-image-card">
              <CardBody className="layer-mode-body-content-image">
                <img src={image} />
              </CardBody>
            </Card>
            {key !== 0 ? (
              <div
                onClick={e => {
                  e.stopPropagation();
                  removeLayer(key);
                }}
                className="remove-layer"
              >
                <MdCancel />
              </div>
            ) : null}
          </div>
          {key === 0 ? <hr style={{ borderTop: "1px solid #7e838e", width: "100%", marginBottom: "20px" }} /> : null}
        </Fragment>
      );
    });
    setLayers(tempLayer);
  }, [operationStack.layerStack]);
  return (
    <ImageEditorStyle>
      <Helmet>
        <title>Image Editor</title>
      </Helmet>
      <header>
        <Container fluid>
          <div className="nav-bar">
            <div className="nav-intro">
              <h4>Image Editor</h4>
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
        <UploadPane />
      </section>
      <footer>
        <div>Computational Photography Labs SFU</div>
        <div
          className="btn layer-mode-toggle"
          onClick={() => {
            setLayerToggle(!layerToggle);
          }}
        >
          <MdDoubleArrow className={layerToggle ? "toggle-down mb-1" : "toggle-up mb-1"} /> Layer Panel
        </div>
        <div
          className={
            layerToggle ? "layer-mode-pane layer-mode-pane-active" : "layer-mode-pane layer-mode-pane-inactive"
          }
        >
          <div className="layer-mode-header">
            <div className="layer-mode-header-title">
              <p>Selection Pane</p>
              <Button
                onClick={() => {
                  setLayerToggle(!layerToggle);
                }}
                size="sm"
                color="outline"
              >
                <AiOutlineClose />
              </Button>
            </div>
          </div>
          <div className="layer-mode-body">
            {layers || null}
            {/* if later stack is empty, disable this */}
            <div className="my-2 layer-mode-body-add">
              <Card className="layer-mode-body-add-card" onClick={addLayer}>
                <AiOutlinePlus />
              </Card>
            </div>
          </div>
          <div className="layer-mode-footer text-center">
            <div className="layer-mode-apply-button mx-2">
              <Button size="sm" color="secondary" onClick={addLayer}>
                Add
              </Button>
            </div>
            <div className="layer-mode-apply-button mx-2">
              <Button size="sm" color="secondary" onClick={removeAllLayers}>
                Remove all
              </Button>
            </div>

            {/* <Button
              disabled={tempLayerStack === undefined || tempLayerStack.length == 0}
              onClick={() => {
                addEffect({
                  name: "depthStack",
                  value: {
                    func: drawLayerCanvas,
                    params: [cloneCanvas(memoryDepthCanvas)]
                  }
                });
              }}
              className="layer-mode-apply-button"
              size="sm"
              color="secondary"
            >
              Apply
            </Button> */}
          </div>
        </div>
      </footer>
    </ImageEditorStyle>
  );
}

const mapStateToProps = state => ({
  memoryDepthCanvas: imageSelectors.memoryDepthCanvas(state),
  depthBitmapCanvas: imageSelectors.depthBitmapCanvas(state),
  layerMode: imageSelectors.layerMode(state),
  operationStack: imageSelectors.operationStack(state)
});

const mapDispatchToProps = {
  addEffect: imageActions.addEffect,
  zoomIn: imageActions.zoomIn,
  zoomOut: imageActions.zoomOut,
  undo: imageActions.undo,
  clear: imageActions.clear,
  reset: imageActions.reset,
  toggleLayerMode: imageActions.toggleLayerMode,
  addLayer: imageActions.addLayer,
  updateLayerIndex: imageActions.updateLayerIndex,
  updateLayer: imageActions.updateLayer,
  removeLayer: imageActions.removeLayer,
  removeAllLayers: imageActions.removeAllLayers
};

export default connect(mapStateToProps, mapDispatchToProps)(ImageEditor);
