import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { toolExtActions } from "store/toolext";
import { imageActions } from "store/image";
import { selectors as toolExtSelectors } from "store/toolext";
import { selectors as imageSelectors } from "store/image";
import { Button, UncontrolledCollapse, CardBody, Card, FormGroup, Label, Input } from "reactstrap";
import SidePaneStyle from "./style";
import Tools from "config/tools";
import { MdCropDin, MdKeyboardArrowLeft, MdKeyboardArrowRight, MdCancel } from "react-icons/md";
import { RiCheckboxMultipleBlankLine } from "react-icons/ri";
import { BiIntersect } from "react-icons/bi";
import { BsSubtract } from "react-icons/bs";
import { IoIosArrowDown } from "react-icons/io";
import {
  addScaleShift,
  canvasToImage,
  cloneCanvas,
  cropCanvas,
  dimensionToBox,
  drawBox,
  drawCanvasImage,
  editBrightness,
  editContrast,
  editHighlightPixelArea,
  getImageFromCanvas,
  getRatio,
  getRgbBitmap,
  highlightPixelArea,
  modifyBitmap,
  scaleSelection
} from "utils/canvasUtils";
import PointCurve from "components/PointCurve";

export function SidePane({
  toolExtOpen,
  toolExtActions,
  mainDepthCanvas,
  tempRgbCanvas,
  tempDepthCanvas,
  depthCanvasDimension,
  bitmapCanvas,
  layerMode,
  tools,
  toolsParameters,
  parameters,
  operationStack,
  selectTool,
  initImage,
  storeToolParameters,
  storeParameters,
  toggleLayerMode,
  addLayer,
  updateLayer,
  removeLayer,
  removeAllLayers,
  addEffect,
  removeOperation
}) {
  const [activeTool, setActiveTool] = useState(0);
  const [bitmapImage, setBitmapImage] = useState(null);
  const [layers, setLayers] = useState(null);
  const [tempToolsParams, setTempToolsParams] = useState({
    depthRangeIntensity: 0,
    depthScale: 0,
    brightness: 0,
    contrast: 0,
    sharpness: 0,
    aConstant: 0,
    bConstant: 0
  });
  const [tempLayerStack, setTempLayerStack] = useState([]);
  const toggleTool = index => {
    setActiveTool(index);
  };
  const onHandleChange = e => {
    let { name, value } = e.target;
    setTempToolsParams({ ...tempToolsParams, [name]: +value });
  };
  const onHandleUpdate = e => {
    let { name } = e.target;
    storeToolParameters({ [name]: tempToolsParams[name] });
  };
  const onHandleEnter = e => {
    let { name } = e.target;
    if (e.key === "Enter") {
      storeToolParameters({ [name]: tempToolsParams[name] });
    }
  };
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
  const onModifyBitmap = () => {
    const { croppedCanvasImage, croppedArea, histogramParams } = parameters;
    let newArea = null;
    let newCroppedCanvasImage = null;
    if (croppedArea) {
      newArea = croppedArea;
      newCroppedCanvasImage = croppedCanvasImage;
    } else {
      newArea = dimensionToBox(depthCanvasDimension);
      newCroppedCanvasImage = cropCanvas(tempDepthCanvas, newArea);
    }
    modifyBitmap(bitmapCanvas, newCroppedCanvasImage, newArea, tools.currentTool, histogramParams.pixelRange);
    setBitmapImage(getImageFromCanvas(bitmapCanvas));
    initImage({ rgbBitmapCanvas: getRgbBitmap(cloneCanvas(bitmapCanvas), cloneCanvas(tempRgbCanvas)) });
    removeOperation({
      name: "depthStack",
      value: drawBox
    });
    removeOperation({
      name: "rgbStack",
      value: drawBox
    });
    storeParameters({
      croppedCanvasImage: null,
      croppedArea: null,
      histogramParams: {
        pixelRange: [0, 255],
        domain: [0, 255],
        values: [0, 255],
        update: [0, 255]
      }
    });
  };
  useEffect(() => {
    if (bitmapCanvas) {
      setBitmapImage(getImageFromCanvas(bitmapCanvas));
    }
  }, [bitmapCanvas]);
  useEffect(() => {
    setTempLayerStack([...operationStack.layerStack]);
  }, [operationStack.layerStack]);
  useEffect(() => {
    if (activeTool === 1) {
      let tempLayer = tempLayerStack.map((element, key) => {
        let image = getImageFromCanvas(element.bitmap);
        return (
          <div key={key} className="p-2 my-2 tool-ext-layer">
            <img src={image} />
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
              <div className="tool-ext-input d-flex justify-content-between w-100">
                <Input
                  onChange={onHandleLayerChange}
                  onMouseUp={onHandleLayerUpdate}
                  className="tool-ext-input-slider"
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
                  className="tool-ext-input-number"
                  id={`depth-${key}`}
                  name={`depth-${key}`}
                  type="number"
                  value={tempLayerStack[key]["depth"]}
                />
              </div>
            </FormGroup>
            <FormGroup className="w-100">
              <Label for={`detail-${key}`}>Detail</Label>
              <div className="mt-2 tool-ext-input d-flex justify-content-between w-100">
                <Input
                  onChange={onHandleLayerChange}
                  onMouseUp={onHandleLayerUpdate}
                  className="tool-ext-input-slider"
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
                  className="tool-ext-input-number"
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
    }
  }, [tempLayerStack, activeTool]);
  useEffect(() => {
    if (parameters.histogramParams.pixelRange && (parameters.croppedArea || depthCanvasDimension)) {
      addEffect({
        name: "depthStack",
        value: {
          func: editHighlightPixelArea,
          params: [cloneCanvas(bitmapCanvas), toolsParameters.depthRangeIntensity]
        }
      });
    }
  }, [toolsParameters.depthRangeIntensity]);
  useEffect(() => {
    if (parameters.histogramParams.pixelRange && (parameters.croppedArea || depthCanvasDimension)) {
      addEffect({
        name: "depthStack",
        value: {
          func: scaleSelection,
          params: [cloneCanvas(bitmapCanvas), toolsParameters.depthScale]
        }
      });
    }
  }, [toolsParameters.depthScale]);
  useEffect(() => {
    const { croppedArea } = parameters;
    if (croppedArea || depthCanvasDimension) {
      let newArea = null;
      if (croppedArea) {
        newArea = croppedArea;
      } else {
        newArea = dimensionToBox(depthCanvasDimension);
      }
      addEffect({
        name: "depthStack",
        value: {
          func: editBrightness,
          params: [newArea, toolsParameters.brightness]
        }
      });
    }
  }, [toolsParameters.brightness]);
  useEffect(() => {
    const { croppedArea } = parameters;
    if (croppedArea || depthCanvasDimension) {
      let newArea = null;
      if (croppedArea) {
        newArea = croppedArea;
      } else {
        newArea = dimensionToBox(depthCanvasDimension);
      }
      addEffect({
        name: "depthStack",
        value: {
          func: editContrast,
          params: [newArea, toolsParameters.contrast]
        }
      });
    }
  }, [toolsParameters.contrast]);
  useEffect(() => {
    const { croppedArea } = parameters;
    if (croppedArea || depthCanvasDimension) {
      let newArea = null;
      if (croppedArea) {
        newArea = croppedArea;
      } else {
        newArea = dimensionToBox(depthCanvasDimension);
      }
      addEffect({
        name: "depthStack",
        value: {
          func: addScaleShift,
          params: [newArea, toolsParameters.aConstant, toolsParameters.bConstant]
        }
      });
    }
  }, [toolsParameters.aConstant, toolsParameters.bConstant]);
  const adjust = () => {
    return (
      <>
        <div className="tool-ext w-100">
          <div className="w-100 mt-3 tool-ext-section">
            <p className="mb-3 text-white">Depth Selection</p>
            <div className="tool-ext-selection">
              <img src={bitmapImage} />
              <div className="tool-ext-selection-icons">
                <div
                  onClick={() => {
                    if (tempDepthCanvas) {
                      selectTool("singleSelection");
                    }
                  }}
                  className={
                    tools.singleSelection && tempDepthCanvas ? "selection-tool selection-tool-active" : "selection-tool"
                  }
                >
                  <MdCropDin />
                </div>
                <div
                  onClick={() => {
                    if (tempDepthCanvas) {
                      selectTool("addSelection");
                    }
                  }}
                  className={
                    tools.addSelection && tempDepthCanvas ? "selection-tool selection-tool-active" : "selection-tool"
                  }
                >
                  <RiCheckboxMultipleBlankLine />
                </div>
                <div
                  onClick={() => {
                    if (tempDepthCanvas) {
                      selectTool("subtractSelection");
                    }
                  }}
                  className={
                    tools.subtractSelection && tempDepthCanvas
                      ? "selection-tool selection-tool-active"
                      : "selection-tool"
                  }
                >
                  <BsSubtract />
                </div>
                <div
                  onClick={() => {
                    if (tempDepthCanvas) {
                      selectTool("intersectSelection");
                    }
                  }}
                  className={
                    tools.intersectSelection && tempDepthCanvas
                      ? "selection-tool selection-tool-active"
                      : "selection-tool"
                  }
                >
                  <BiIntersect />
                </div>
              </div>
              <div className="d-flex">
                <Button disabled={!tools.currentTool} className="mx-2" color="secondary" onClick={onModifyBitmap}>
                  {tools.singleSelection || tools.addSelection
                    ? "Add"
                    : tools.subtractSelection
                    ? "Subtract"
                    : tools.intersectSelection
                    ? "Intersect"
                    : "Select"}
                </Button>
                <Button
                  disabled={!tools.currentTool}
                  className="mx-2"
                  color="secondary"
                  onClick={() => {
                    const bitmapContext = bitmapCanvas.getContext("2d");
                    bitmapContext.clearRect(0, 0, bitmapCanvas.width, bitmapCanvas.height);
                    setBitmapImage(getImageFromCanvas(bitmapCanvas));
                  }}
                >
                  Clear
                </Button>
              </div>
            </div>
            <Button className="mt-4 mb-2 dropdown-button" color="secondary" id="depth-adjust-toggler">
              Adjust Selection
            </Button>
            <UncontrolledCollapse style={{ width: "100%" }} toggler="#depth-adjust-toggler">
              <Card className="tool-ext-card">
                <CardBody className="tool-ext-card-body">
                  <FormGroup className="w-100">
                    <Label for="depthRangeIntensity">Depth Intensity</Label>
                    <div className="tool-ext-input d-flex justify-content-between w-100">
                      <Input
                        disabled={!tempDepthCanvas || !parameters.histogramParams.pixelRange}
                        onChange={onHandleChange}
                        onMouseUp={onHandleUpdate}
                        className="tool-ext-input-slider"
                        id="depthRangeIntensity"
                        name="depthRangeIntensity"
                        min="-100"
                        max="100"
                        type="range"
                        value={tempToolsParams.depthRangeIntensity}
                      />
                      <Input
                        disabled={!tempDepthCanvas || !parameters.histogramParams.pixelRange}
                        onChange={onHandleChange}
                        onMouseLeave={onHandleUpdate}
                        onKeyDown={onHandleEnter}
                        className="tool-ext-input-number"
                        id="depthRangeIntensity"
                        name="depthRangeIntensity"
                        type="number"
                        value={tempToolsParams.depthRangeIntensity}
                      />
                    </div>
                  </FormGroup>
                  <FormGroup className="w-100">
                    <Label for="depthScale">Depth Detail</Label>
                    <div className="tool-ext-input d-flex justify-content-between w-100">
                      <Input
                        disabled={!tempDepthCanvas || !parameters.histogramParams.pixelRange}
                        onChange={onHandleChange}
                        onMouseUp={onHandleUpdate}
                        className="tool-ext-input-slider"
                        id="depthScale"
                        name="depthScale"
                        min="0"
                        max="1"
                        step={0.01}
                        type="range"
                        value={tempToolsParams.depthScale}
                      />
                      <Input
                        disabled={!tempDepthCanvas || !parameters.histogramParams.pixelRange}
                        onChange={onHandleChange}
                        onMouseLeave={onHandleUpdate}
                        onKeyDown={onHandleEnter}
                        className="tool-ext-input-number"
                        id="depthScale"
                        name="depthScale"
                        type="number"
                        value={tempToolsParams.depthScale}
                      />
                    </div>
                  </FormGroup>
                </CardBody>
              </Card>
            </UncontrolledCollapse>
          </div>
          <div className="w-100 mt-3 tool-ext-section">
            <p className="mb-1 text-white">Brightness &#38; Color</p>
            <Button className="mt-4 mb-2 dropdown-button" color="secondary" id="basic-adjust-toggler">
              Basic Adjust
            </Button>
            <UncontrolledCollapse style={{ width: "100%" }} toggler="#basic-adjust-toggler">
              <Card className="tool-ext-card">
                <CardBody className="tool-ext-card-body">
                  <FormGroup className="w-100">
                    <Label for="brightness">Brightness</Label>
                    <div className="tool-ext-input d-flex justify-content-between w-100">
                      <Input
                        disabled={!tempDepthCanvas}
                        onChange={onHandleChange}
                        onMouseUp={onHandleUpdate}
                        className="tool-ext-input-slider"
                        id="brightness"
                        name="brightness"
                        min="-100"
                        max="100"
                        type="range"
                        value={tempToolsParams.brightness}
                      />
                      <Input
                        disabled={!tempDepthCanvas || !parameters.histogramParams.pixelRange}
                        onChange={onHandleChange}
                        onMouseLeave={onHandleUpdate}
                        onKeyDown={onHandleEnter}
                        className="tool-ext-input-number"
                        id="brightness"
                        name="brightness"
                        type="number"
                        value={tempToolsParams.brightness}
                      />
                    </div>
                  </FormGroup>
                  <FormGroup className="w-100">
                    <Label for="contrast">Contrast</Label>
                    <div className="tool-ext-input d-flex justify-content-between w-100">
                      <Input
                        disabled={!tempDepthCanvas}
                        onChange={onHandleChange}
                        onMouseUp={onHandleUpdate}
                        className="tool-ext-input-slider"
                        id="contrast"
                        name="contrast"
                        min="0"
                        max="100"
                        type="range"
                        value={tempToolsParams.contrast}
                      />
                      <Input
                        disabled={!tempDepthCanvas || !parameters.histogramParams.pixelRange}
                        onChange={onHandleChange}
                        onMouseLeave={onHandleUpdate}
                        onKeyDown={onHandleEnter}
                        className="tool-ext-input-number"
                        id="contrast"
                        name="contrast"
                        type="number"
                        value={tempToolsParams.contrast}
                      />
                    </div>
                  </FormGroup>
                  <FormGroup className="w-100">
                    <Label for="sharpness">Sharpness</Label>
                    <div className="tool-ext-input d-flex justify-content-between w-100">
                      <Input
                        disabled={!tempDepthCanvas}
                        onChange={onHandleChange}
                        onMouseUp={onHandleUpdate}
                        className="tool-ext-input-slider"
                        id="sharpness"
                        name="sharpness"
                        min="-100"
                        max="100"
                        type="range"
                        value={tempToolsParams.sharpness}
                      />
                      <Input
                        disabled={!tempDepthCanvas || !parameters.histogramParams.pixelRange}
                        onChange={onHandleChange}
                        onMouseLeave={onHandleUpdate}
                        onKeyDown={onHandleEnter}
                        className="tool-ext-input-number"
                        id="sharpness"
                        name="sharpness"
                        type="number"
                        value={tempToolsParams.sharpness}
                      />
                    </div>
                  </FormGroup>
                </CardBody>
              </Card>
            </UncontrolledCollapse>
          </div>
          <div className="w-100 mt-3 tool-ext-section">
            <Button className="mt-3 mb-3 dropdown-button" color="secondary" id="depth-rotate-toggler">
              Point Curve
            </Button>
            <UncontrolledCollapse toggler="#depth-rotate-toggler">
              <Card className="tool-ext-card">
                <CardBody className="tool-ext-card-body">
                  <PointCurve />
                  <FormGroup className="w-100">
                    <Label for="aConstant">A</Label>
                    <div className="tool-ext-input d-flex justify-content-between w-100">
                      <Input
                        disabled={!tempDepthCanvas}
                        onChange={onHandleChange}
                        onMouseUp={onHandleUpdate}
                        className="tool-ext-input-slider"
                        id="aConstant"
                        name="aConstant"
                        min="0"
                        max="2"
                        step={0.01}
                        type="range"
                        value={tempToolsParams.aConstant}
                      />
                      <Input
                        disabled={!tempDepthCanvas || !parameters.histogramParams.pixelRange}
                        onChange={onHandleChange}
                        onMouseLeave={onHandleUpdate}
                        onKeyDown={onHandleEnter}
                        className="tool-ext-input-number"
                        id="aConstant"
                        name="aConstant"
                        type="number"
                        value={tempToolsParams.aConstant}
                      />
                    </div>
                  </FormGroup>
                  <FormGroup className="w-100">
                    <Label for="bConstant">B</Label>
                    <div className="tool-ext-input d-flex justify-content-between w-100">
                      <Input
                        disabled={!tempDepthCanvas}
                        onChange={onHandleChange}
                        onMouseUp={onHandleUpdate}
                        className="tool-ext-input-slider"
                        id="bConstant"
                        name="bConstant"
                        min="0"
                        max="2"
                        step={0.01}
                        type="range"
                        value={tempToolsParams.bConstant}
                      />
                      <Input
                        disabled={!tempDepthCanvas || !parameters.histogramParams.pixelRange}
                        onChange={onHandleChange}
                        onMouseLeave={onHandleUpdate}
                        onKeyDown={onHandleEnter}
                        className="tool-ext-input-number"
                        id="bConstant"
                        name="bConstant"
                        type="number"
                        value={tempToolsParams.bConstant}
                      />
                    </div>
                  </FormGroup>
                </CardBody>
              </Card>
            </UncontrolledCollapse>
          </div>

          {/* <p className="my-3 text-white">Size</p>
          <Button className="mt-3 mb-3 dropdown-button" color="secondary" id="adjust-crop-toggler">
            Crop
          </Button>
          <UncontrolledCollapse toggler="#adjust-crop-toggler">
            <Card className="tool-ext-card">
              <CardBody className="tool-ext-card-body">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt magni, voluptas debitis similique
                porro a molestias consequuntur earum odio officiis natus, amet hic, iste sed dignissimos esse fuga!
                Minus, alias.
              </CardBody>
            </Card>
          </UncontrolledCollapse>
          <Button className="mt-3 mb-3 dropdown-button" color="secondary" id="adjust-rotate-toggler">
            Rotate
          </Button>
          <UncontrolledCollapse toggler="#adjust-rotate-toggler">
            <Card className="tool-ext-card">
              <CardBody className="tool-ext-card-body">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt magni, voluptas debitis similique
                porro a molestias consequuntur earum odio officiis natus, amet hic, iste sed dignissimos esse fuga!
                Minus, alias.
              </CardBody>
            </Card>
          </UncontrolledCollapse>
          <Button className="mt-3 mb-3 dropdown-button" color="secondary" id="adjust-resize-toggler">
            Resize
          </Button>
          <UncontrolledCollapse toggler="#adjust-resize-toggler">
            <Card className="tool-ext-card">
              <CardBody className="tool-ext-card-body">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt magni, voluptas debitis similique
                porro a molestias consequuntur earum odio officiis natus, amet hic, iste sed dignissimos esse fuga!
                Minus, alias.
              </CardBody>
            </Card>
          </UncontrolledCollapse> */}
        </div>
      </>
    );
  };
  const effect = () => {
    return (
      <>
        <div className="tool-ext mt-4 w-100">
          <div className="w-100 mt-3 tool-ext-section">
            <Button className="mb-2 dropdown-button" color="secondary" id="depth-adjust-toggler">
              Layers <IoIosArrowDown />
            </Button>
            <UncontrolledCollapse style={{ width: "100%" }} toggler="#depth-adjust-toggler">
              <Card className="tool-ext-card">
                <CardBody className="tool-ext-card-body">
                  <Button className="mb-4" size="sm" color="secondary" onClick={toggleLayerMode}>
                    Layer Mode ({layerMode ? "ON" : "OFF"})
                  </Button>
                  <div className="d-flex">
                    <Button className="mx-2" size="sm" color="secondary" onClick={addLayer}>
                      Add
                    </Button>

                    <Button className="mx-2" size="sm" color="secondary" onClick={removeAllLayers}>
                      Remove all
                    </Button>
                  </div>
                  <div id="tool-ext-layers" className="my-3 tool-ext-layers">
                    {layers || null}
                  </div>
                </CardBody>
              </Card>
            </UncontrolledCollapse>
          </div>
        </div>
      </>
    );
  };
  const text = () => {
    return (
      <>
        <div className="tool-ext mt-4 w-100">
          <p className="mb-3 text-white">Size</p>
          <Button className="mt-3 mb-3 dropdown-button" color="secondary" id="adjust-crop-toggler">
            Crop
          </Button>
          <UncontrolledCollapse toggler="#adjust-crop-toggler">
            <Card className="tool-ext-card">
              <CardBody className="tool-ext-card-body">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt magni, voluptas debitis similique
                porro a molestias consequuntur earum odio officiis natus, amet hic, iste sed dignissimos esse fuga!
                Minus, alias.
              </CardBody>
            </Card>
          </UncontrolledCollapse>
          <Button className="mt-3 mb-3 dropdown-button" color="secondary" id="adjust-rotate-toggler">
            Rotate
          </Button>
          <UncontrolledCollapse toggler="#adjust-rotate-toggler">
            <Card className="tool-ext-card">
              <CardBody className="tool-ext-card-body">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt magni, voluptas debitis similique
                porro a molestias consequuntur earum odio officiis natus, amet hic, iste sed dignissimos esse fuga!
                Minus, alias.
              </CardBody>
            </Card>
          </UncontrolledCollapse>
          <Button className="mt-3 mb-3 dropdown-button" color="secondary" id="adjust-resize-toggler">
            Resize
          </Button>
          <UncontrolledCollapse toggler="#adjust-resize-toggler">
            <Card className="tool-ext-card">
              <CardBody className="tool-ext-card-body">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt magni, voluptas debitis similique
                porro a molestias consequuntur earum odio officiis natus, amet hic, iste sed dignissimos esse fuga!
                Minus, alias.
              </CardBody>
            </Card>
          </UncontrolledCollapse>
        </div>
      </>
    );
  };
  return (
    <SidePaneStyle>
      <div className="tools">
        {Tools.map((tool, key) => (
          <div
            key={key}
            onClick={() => {
              toggleTool(key);
            }}
            className={key === activeTool ? "active tool" : "tool"}
          >
            {tool.icon}
            <span>{tool.name}</span>
          </div>
        ))}
      </div>
      <div className={toolExtOpen ? "tools-ext tool-ext-active" : "tools-ext tool-ext-inactive"}>
        <div className="tools-ext-elements">
          {activeTool === 0 ? adjust() : activeTool === 1 ? effect() : activeTool === 2 ? text() : null}
          <Button onClick={toolExtActions} className="toggle-button">
            {toolExtOpen ? <MdKeyboardArrowLeft /> : <MdKeyboardArrowRight />}
          </Button>
        </div>
      </div>
    </SidePaneStyle>
  );
}

const mapStateToProps = state => ({
  toolExtOpen: toolExtSelectors.toolExtOpen(state),
  mainDepthCanvas: imageSelectors.mainDepthCanvas(state),
  tempRgbCanvas: imageSelectors.tempRgbCanvas(state),
  tempDepthCanvas: imageSelectors.tempDepthCanvas(state),
  depthCanvasDimension: imageSelectors.depthCanvasDimension(state),
  bitmapCanvas: imageSelectors.bitmapCanvas(state),
  layerMode: imageSelectors.layerMode(state),
  tools: imageSelectors.tools(state),
  toolsParameters: imageSelectors.toolsParameters(state),
  parameters: imageSelectors.parameters(state),
  operationStack: imageSelectors.operationStack(state)
});

const mapDispatchToProps = {
  toolExtActions: toolExtActions.toggleToolExt,
  initImage: imageActions.initImage,
  selectTool: imageActions.selectTool,
  addEffect: imageActions.addEffect,
  removeOperation: imageActions.removeOperation,
  storeParameters: imageActions.storeParameters,
  toggleLayerMode: imageActions.toggleLayerMode,
  addLayer: imageActions.addLayer,
  updateLayer: imageActions.updateLayer,
  removeLayer: imageActions.removeLayer,
  removeAllLayers: imageActions.removeAllLayers,
  storeToolParameters: imageActions.storeToolParameters
};

export default connect(mapStateToProps, mapDispatchToProps)(SidePane);
