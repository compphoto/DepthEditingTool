import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { toolExtActions } from "store/toolext";
import { imageActions } from "store/image";
import { selectors as toolExtSelectors } from "store/toolext";
import { selectors as imageSelectors } from "store/image";
import { Button, UncontrolledCollapse, CardBody, Card, FormGroup, Label, Input } from "reactstrap";
import SidePaneStyle from "./style";
import Tools from "config/tools";
import { MdCropDin, MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { RiCheckboxMultipleBlankLine } from "react-icons/ri";
import { BiIntersect } from "react-icons/bi";
import { BsSubtract } from "react-icons/bs";
import {
  addScaleShift,
  cloneCanvas,
  editBrightness,
  editContrast,
  editHighlightPixelArea,
  getImageFromCanvas,
  getRgbBitmap,
  modifyBitmap,
  scaleSelection,
  getBoundingArea
} from "utils/canvasUtils";
import PointCurve from "components/PointCurve";

export function SidePane({
  toolExtOpen,
  toolExtActions,
  memoryDepthCanvas,
  displayRgbCanvas,
  depthBitmapCanvas,
  tools,
  toolsParameters,
  parameters,
  selectTool,
  initImage,
  storeToolParameters,
  storeParameters,
  addEffect
}) {
  const [activeTool, setActiveTool] = useState(0);
  const [bitmapImage, setBitmapImage] = useState(null);

  const [tempToolsParams, setTempToolsParams] = useState({
    depthRangeIntensity: 0,
    depthScale: 1,
    brightness: 0,
    contrast: 0,
    sharpness: 0,
    aConstant: 0,
    bConstant: 0
  });

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

  const onModifyBitmap = () => {
    if (memoryDepthCanvas) {
      const { croppedCanvasImage, croppedArea, histogramParams } = parameters;
      let newArea = null;
      let newCroppedCanvasImage = null;
      if (croppedArea) {
        newArea = croppedArea;
        newCroppedCanvasImage = croppedCanvasImage;
      } else {
        newArea = getBoundingArea(memoryDepthCanvas);
        newCroppedCanvasImage = cloneCanvas(memoryDepthCanvas);
      }
      modifyBitmap(depthBitmapCanvas, newCroppedCanvasImage, newArea, tools.currentTool, histogramParams.pixelRange);
      setBitmapImage(getImageFromCanvas(depthBitmapCanvas));
      initImage({ rgbBitmapCanvas: getRgbBitmap(cloneCanvas(depthBitmapCanvas), cloneCanvas(displayRgbCanvas)) });
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
    }
  };
  useEffect(() => {
    if (depthBitmapCanvas) {
      setBitmapImage(getImageFromCanvas(depthBitmapCanvas));
    } else {
      setBitmapImage(null);
    }
  }, [depthBitmapCanvas]);

  useEffect(() => {
    if (parameters.histogramParams.pixelRange && depthBitmapCanvas) {
      addEffect({
        name: "depthStack",
        value: {
          func: editHighlightPixelArea,
          params: [cloneCanvas(depthBitmapCanvas), toolsParameters.depthRangeIntensity]
        }
      });
    }
  }, [toolsParameters.depthRangeIntensity]);
  useEffect(() => {
    if (parameters.histogramParams.pixelRange && depthBitmapCanvas) {
      addEffect({
        name: "depthStack",
        value: {
          func: scaleSelection,
          params: [cloneCanvas(depthBitmapCanvas), toolsParameters.depthScale]
        }
      });
    }
  }, [toolsParameters.depthScale]);
  useEffect(() => {
    if (memoryDepthCanvas) {
      const { croppedArea } = parameters;
      let newArea = null;
      if (croppedArea) {
        newArea = croppedArea;
      } else {
        newArea = getBoundingArea(memoryDepthCanvas);
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
    if (memoryDepthCanvas) {
      const { croppedArea } = parameters;
      let newArea = null;
      if (croppedArea) {
        newArea = croppedArea;
      } else {
        newArea = getBoundingArea(memoryDepthCanvas);
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
    if (memoryDepthCanvas) {
      const { croppedArea } = parameters;
      let newArea = null;
      if (croppedArea) {
        newArea = croppedArea;
      } else {
        newArea = getBoundingArea(memoryDepthCanvas);
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
  const toolBox = () => {
    return (
      <>
        <div className="tool-ext mt-4 w-100">
          <div className="tool-ext-selection">
            <img src={bitmapImage} />
            <div className="tool-ext-selection-icons">
              <div
                onClick={() => {
                  if (memoryDepthCanvas) {
                    selectTool("singleSelection");
                  }
                }}
                className={
                  tools.singleSelection && memoryDepthCanvas ? "selection-tool selection-tool-active" : "selection-tool"
                }
              >
                <MdCropDin />
              </div>
              <div
                onClick={() => {
                  if (memoryDepthCanvas) {
                    selectTool("addSelection");
                  }
                }}
                className={
                  tools.addSelection && memoryDepthCanvas ? "selection-tool selection-tool-active" : "selection-tool"
                }
              >
                <RiCheckboxMultipleBlankLine />
              </div>
              <div
                onClick={() => {
                  if (memoryDepthCanvas) {
                    selectTool("subtractSelection");
                  }
                }}
                className={
                  tools.subtractSelection && memoryDepthCanvas
                    ? "selection-tool selection-tool-active"
                    : "selection-tool"
                }
              >
                <BsSubtract />
              </div>
              <div
                onClick={() => {
                  if (memoryDepthCanvas) {
                    selectTool("intersectSelection");
                  }
                }}
                className={
                  tools.intersectSelection && memoryDepthCanvas
                    ? "selection-tool selection-tool-active"
                    : "selection-tool"
                }
              >
                <BiIntersect />
              </div>
            </div>
            <div className="d-flex">
              <Button
                disabled={!tools.currentTool}
                size="sm"
                className="mx-2"
                color="secondary"
                onClick={onModifyBitmap}
              >
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
                size="sm"
                className="mx-2"
                color="secondary"
                onClick={() => {
                  const bitmapContext = depthBitmapCanvas.getContext("2d");
                  bitmapContext.clearRect(0, 0, depthBitmapCanvas.width, depthBitmapCanvas.height);
                  setBitmapImage(getImageFromCanvas(depthBitmapCanvas));
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  };
  const adjust = () => {
    return (
      <>
        <div className="tool-ext w-100">
          <div className="w-100 mt-3 tool-ext-section">
            <p className="mb-1 text-white">Depth Selection</p>
            <Button className="mt-4 mb-2 dropdown-button" size="sm" color="secondary" id="depth-adjust-toggler">
              Adjust Selection
            </Button>
            <UncontrolledCollapse style={{ width: "100%" }} toggler="#depth-adjust-toggler">
              <Card className="tool-ext-card">
                <CardBody className="tool-ext-card-body">
                  <FormGroup className="w-100">
                    <Label for="depthRangeIntensity">Depth Intensity</Label>
                    <div className="tool-ext-input d-flex justify-content-between w-100">
                      <Input
                        disabled={!memoryDepthCanvas || !parameters.histogramParams.pixelRange}
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
                        disabled={!memoryDepthCanvas || !parameters.histogramParams.pixelRange}
                        onChange={onHandleChange}
                        onMouseLeave={onHandleUpdate}
                        onKeyDown={onHandleEnter}
                        size="sm"
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
                        disabled={!memoryDepthCanvas || !parameters.histogramParams.pixelRange}
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
                        disabled={!memoryDepthCanvas || !parameters.histogramParams.pixelRange}
                        onChange={onHandleChange}
                        onMouseLeave={onHandleUpdate}
                        onKeyDown={onHandleEnter}
                        size="sm"
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
            <Button className="mt-4 mb-2 dropdown-button" size="sm" color="secondary" id="basic-adjust-toggler">
              Basic Adjust
            </Button>
            <UncontrolledCollapse style={{ width: "100%" }} toggler="#basic-adjust-toggler">
              <Card className="tool-ext-card">
                <CardBody className="tool-ext-card-body">
                  <FormGroup className="w-100">
                    <Label for="brightness">Brightness</Label>
                    <div className="tool-ext-input d-flex justify-content-between w-100">
                      <Input
                        disabled={!memoryDepthCanvas}
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
                        disabled={!memoryDepthCanvas || !parameters.histogramParams.pixelRange}
                        onChange={onHandleChange}
                        onMouseLeave={onHandleUpdate}
                        onKeyDown={onHandleEnter}
                        size="sm"
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
                        disabled={!memoryDepthCanvas}
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
                        disabled={!memoryDepthCanvas || !parameters.histogramParams.pixelRange}
                        onChange={onHandleChange}
                        onMouseLeave={onHandleUpdate}
                        onKeyDown={onHandleEnter}
                        size="sm"
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
                        disabled={!memoryDepthCanvas}
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
                        disabled={!memoryDepthCanvas || !parameters.histogramParams.pixelRange}
                        onChange={onHandleChange}
                        onMouseLeave={onHandleUpdate}
                        onKeyDown={onHandleEnter}
                        size="sm"
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
            <p className="mb-1 text-white">Non-linearity</p>
            <Button className="mt-3 mb-3 dropdown-button" size="sm" color="secondary" id="depth-rotate-toggler">
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
                        disabled={!memoryDepthCanvas}
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
                        disabled={!memoryDepthCanvas || !parameters.histogramParams.pixelRange}
                        onChange={onHandleChange}
                        onMouseLeave={onHandleUpdate}
                        onKeyDown={onHandleEnter}
                        size="sm"
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
                        disabled={!memoryDepthCanvas}
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
                        disabled={!memoryDepthCanvas || !parameters.histogramParams.pixelRange}
                        onChange={onHandleChange}
                        onMouseLeave={onHandleUpdate}
                        onKeyDown={onHandleEnter}
                        size="sm"
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
        </div>
      </>
    );
  };
  const effect = () => {
    return (
      <>
        <div className="tool-ext mt-4 w-100">
          <div className="w-100 mt-3 tool-ext-section"></div>
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
          {activeTool === 0 ? toolBox() : activeTool === 1 ? adjust() : activeTool === 2 ? effect() : null}
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
  displayRgbCanvas: imageSelectors.displayRgbCanvas(state),
  memoryDepthCanvas: imageSelectors.memoryDepthCanvas(state),
  rgbBitmapCanvas: imageSelectors.rgbBitmapCanvas(state),
  depthBitmapCanvas: imageSelectors.depthBitmapCanvas(state),
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
