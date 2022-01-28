import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { imageActions } from "store/image";
import { selectors as imageSelectors } from "store/image";
import { Helmet } from "react-helmet";
import Switch from "react-switch";
import { Container, Button, FormGroup, Label, Input } from "reactstrap";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { MdOutlinePanTool, MdDoubleArrow, MdCancel } from "react-icons/md";
import { ImUndo2 } from "react-icons/im";
import ImageEditorStyle from "./style";
import SidePane from "components/SidePane";
import MainPane from "components/MainPane";
import UploadPane from "components/UploadPane";
import { canvasToImage, cloneCanvas, drawLayerCanvas } from "utils/canvasUtils";
import {} from "utils/stackOperations";

export function ImageEditor({
  memoryDepthCanvas,
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
  updateLayer,
  removeLayer,
  removeAllLayers
}) {
  const [layerToggle, setLayerToggle] = useState(false);
  const [layers, setLayers] = useState(null);
  const [tempLayerStack, setTempLayerStack] = useState([]);
  const onHandleLayerChange = e => {
    let { name, value } = e.target;
    let [key, index] = name.split("-");
    let items = [...tempLayerStack];
    let item = {
      ...tempLayerStack[+index],
      [key]: +value
    };
    items[+index] = item;
    setTempLayerStack(items);
  };
  const onHandleLayerUpdate = e => {
    updateLayer(tempLayerStack);
  };
  const onHandleLayerEnter = e => {
    if (e.key === "Enter") {
      updateLayer(tempLayerStack);
    }
  };
  useEffect(() => {
    setTempLayerStack([...operationStack.layerStack]);
  }, [operationStack.layerStack]);
  useEffect(() => {
    let tempLayer = tempLayerStack.map((element, key) => {
      let image = canvasToImage(element.depthBitmap);
      return (
        <div key={key} className="p-2 my-2 layer-mode-body-content">
          <div className="layer-mode-body-content-img">
            <img src={image} />
          </div>
          <div
            onClick={e => {
              e.stopPropagation();
              removeLayer(key);
            }}
            className="remove-layer"
          >
            <MdCancel />
          </div>
          <FormGroup className="w-100">
            <Label for={`depth-${key}`}>Depth</Label>
            <div className="layer-mode-input d-flex justify-content-between w-100">
              <Input
                onChange={onHandleLayerChange}
                onMouseUp={onHandleLayerUpdate}
                className="layer-mode-input-slider"
                id={`depth-${key}`}
                name={`depth-${key}`}
                min="-100"
                max="100"
                type="range"
                value={tempLayerStack[key]["depth"]}
              />
              <Input
                onChange={onHandleLayerChange}
                onMouseLeave={onHandleLayerUpdate}
                onKeyDown={onHandleLayerEnter}
                size="sm"
                className="layer-mode-input-number"
                id={`depth-${key}`}
                name={`depth-${key}`}
                type="number"
                value={tempLayerStack[key]["depth"]}
              />
            </div>
          </FormGroup>
          <FormGroup className="w-100">
            <Label for={`detail-${key}`}>Detail</Label>
            <div className="mt-2 layer-mode-input d-flex justify-content-between w-100">
              <Input
                onChange={onHandleLayerChange}
                onMouseUp={onHandleLayerUpdate}
                className="layer-mode-input-slider"
                id={`detail-${key}`}
                name={`detail-${key}`}
                min="0"
                max="1"
                step={0.01}
                type="range"
                value={tempLayerStack[key]["detail"]}
              />
              <Input
                onChange={onHandleLayerChange}
                onMouseLeave={onHandleLayerUpdate}
                onKeyDown={onHandleLayerEnter}
                size="sm"
                className="layer-mode-input-number"
                id={`detail-${key}`}
                name={`detail-${key}`}
                type="number"
                value={tempLayerStack[key]["detail"]}
              />
            </div>
          </FormGroup>
        </div>
      );
    });
    setLayers(tempLayer);
  }, [tempLayerStack]);
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
              <Button onClick={() => {}} size="sm" color="outline">
                <MdOutlinePanTool />
              </Button>
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
              <p>Layer Mode</p>
              <Switch
                onChange={toggleLayerMode}
                checked={layerMode}
                onColor="#86d3ff"
                onHandleColor="#2693e6"
                handleDiameter={20}
                uncheckedIcon={false}
                checkedIcon={false}
                boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                height={10}
                width={38}
              />
            </div>
            <div className="layer-mode-header-content">
              <Button className="mx-2" size="sm" color="secondary" onClick={addLayer}>
                Add
              </Button>
              <Button className="mx-2" size="sm" color="secondary" onClick={removeAllLayers}>
                Remove all
              </Button>
            </div>
          </div>
          <div className="layer-mode-body">{layers || null}</div>
          <div className="layer-mode-footer text-center">
            <Button
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
            </Button>
          </div>
        </div>
      </footer>
    </ImageEditorStyle>
  );
}

const mapStateToProps = state => ({
  memoryDepthCanvas: imageSelectors.memoryDepthCanvas(state),
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
  updateLayer: imageActions.updateLayer,
  removeLayer: imageActions.removeLayer,
  removeAllLayers: imageActions.removeAllLayers
};

export default connect(mapStateToProps, mapDispatchToProps)(ImageEditor);
