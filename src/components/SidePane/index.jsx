import React, { useEffect, useState, Fragment } from "react";
import { connect } from "react-redux";
import { toolExtActions } from "store/toolext";
import { imageActions } from "store/image";
import { selectors as toolExtSelectors } from "store/toolext";
import { selectors as imageSelectors } from "store/image";
import { Button, CardBody, Card, FormGroup, Label, Input, UncontrolledTooltip } from "reactstrap";
import SidePaneStyle from "./style";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight, MdDownload, MdDelete, MdContentCopy } from "react-icons/md";
import { AiOutlinePlus } from "react-icons/ai";
import { RiArrowUpDownLine } from "react-icons/ri";

import {
  addScaleShift,
  cloneCanvas,
  editHighlightPixelArea,
  scaleSelection,
  getBoundingArea,
  canvasToImage,
  invertBitmap,
  downloadCanvas
} from "utils/canvasUtils";
import PointCurve from "components/PointCurve";
import { SelectionBox } from "config/toolBox";

export function SidePane({
  toolExtOpen,
  toolExtActions,
  mainDepthCanvas,
  memoryDepthCanvas,
  mainRgbCanvas,
  activeDepthTool,
  toolsParameters,
  parameters,
  operationStack,
  selectTool,
  storeToolParameters,
  addEffect,
  addLayer,
  updateLayerIndex,
  updateLayer,
  duplicateLayer,
  removeLayer,
  removeAllLayers,
  toggleLayerSelect,
  mergeLayerSelect,
  removeLayerSelect,
  clear
}) {
  const [layers, setLayers] = useState(null);
  const [tempToolsParams, setTempToolsParams] = useState({
    disparity: 0,
    scale: 1,
    aConstant: 1,
    bConstant: 0
  });

  const onHandleChange = e => {
    let { name, value } = e.target;
    setTempToolsParams({ ...tempToolsParams, [name]: +value });
  };
  const onHandleUpdate = e => {
    let { name } = e.target;
    const { activeIndex } = operationStack;
    updateLayer({
      index: activeIndex,
      value: {
        toolsParameters: tempToolsParams
      }
    });
    storeToolParameters({ [name]: tempToolsParams[name] });
  };
  const onHandleEnter = e => {
    let { name } = e.target;
    const { activeIndex } = operationStack;
    if (e.key === "Enter") {
      updateLayer({
        index: activeIndex,
        value: {
          toolsParameters: tempToolsParams
        }
      });
      storeToolParameters({ [name]: tempToolsParams[name] });
    }
  };

  const onModifyBitmap = () => {
    if (memoryDepthCanvas) {
      if (!activeDepthTool || SelectionBox[activeDepthTool].type === "boundingBox") {
        const { croppedCanvasImage, croppedArea, histogramParams } = parameters;
        const { activeIndex, layerStack } = operationStack;
        if (activeIndex > 0) {
          let newArea = null;
          let newCroppedCanvasImage = null;
          if (croppedArea) {
            newArea = croppedArea;
            newCroppedCanvasImage = croppedCanvasImage;
          } else {
            newArea = getBoundingArea(memoryDepthCanvas);
            newCroppedCanvasImage = cloneCanvas(memoryDepthCanvas);
          }
          const newBitmapCanvas = SelectionBox[activeDepthTool || "singleSelection"].func(
            cloneCanvas(layerStack[activeIndex].bitmap),
            newCroppedCanvasImage,
            newArea,
            histogramParams.pixelRange
          );
          updateLayer({
            index: activeIndex,
            value: {
              bitmap: newBitmapCanvas,
              toolsParameters: {
                disparity: 0,
                scale: 1,
                aConstant: 1,
                bConstant: 0
              }
            }
          });
          clear();
        }
      }
    }
  };
  useEffect(() => {
    const { activeIndex, layerStack } = operationStack;
    if (layerStack[activeIndex]) {
      setTempToolsParams({ ...layerStack[activeIndex].toolsParameters });
    }
  }, [operationStack.activeIndex]);
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
              (!operationStack.isSelectActive && operationStack.activeIndex === key) ||
              (operationStack.isSelectActive && operationStack.selectedLayers.has(key))
                ? "my-2 layer-mode-body-content layer-mode-body-content-active"
                : "my-2 layer-mode-body-content"
            }
          >
            <Card className="layer-mode-body-content-image-card">
              <CardBody className="layer-mode-body-content-image">
                <img src={image} />
              </CardBody>
            </Card>
            {key !== 0 && !operationStack.isSelectActive ? (
              <div className="top-right-options">
                <div
                  onClick={e => {
                    e.stopPropagation();
                    let newBitmapCanvas = invertBitmap(
                      cloneCanvas(memoryDepthCanvas),
                      cloneCanvas(operationStack.layerStack[key].bitmap)
                    );
                    updateLayer({
                      index: key,
                      value: {
                        bitmap: newBitmapCanvas,
                        toolsParameters: {
                          disparity: 0,
                          scale: 1,
                          aConstant: 1,
                          bConstant: 0
                        }
                      }
                    });
                  }}
                  className="top-right-option"
                >
                  <RiArrowUpDownLine />
                </div>
                <div
                  onClick={e => {
                    e.stopPropagation();
                    duplicateLayer(key);
                  }}
                  className="top-right-option"
                >
                  <MdContentCopy />
                </div>
                <div
                  onClick={e => {
                    e.stopPropagation();
                    downloadCanvas(operationStack.layerStack[key].bitmap, "bitmap.png");
                  }}
                  className="top-right-option"
                >
                  <MdDownload />
                </div>
                <div
                  onClick={e => {
                    e.stopPropagation();
                    removeLayer(key);
                  }}
                  className="top-right-option"
                >
                  <MdDelete />
                </div>
              </div>
            ) : null}
          </div>
          {key === 0 ? <hr style={{ borderTop: "1px solid #97c2f0", width: "100%", marginBottom: "20px" }} /> : null}
        </Fragment>
      );
    });
    setLayers(tempLayer);
  }, [operationStack.layerStack, operationStack.isSelectActive]);
  useEffect(() => {
    const { activeIndex, layerStack } = operationStack;
    if (parameters.histogramParams.pixelRange && activeIndex > -1 && layerStack.length) {
      addEffect({
        name: "depthStack",
        value: {
          func: editHighlightPixelArea,
          params: [cloneCanvas(layerStack[activeIndex].bitmap), toolsParameters.disparity]
        }
      });
    }
  }, [toolsParameters.disparity]);
  useEffect(() => {
    const { activeIndex, layerStack } = operationStack;
    if (parameters.histogramParams.pixelRange && activeIndex > -1 && layerStack.length) {
      addEffect({
        name: "depthStack",
        value: {
          func: scaleSelection,
          params: [cloneCanvas(layerStack[activeIndex].bitmap), toolsParameters.scale]
        }
      });
    }
  }, [toolsParameters.scale]);
  useEffect(() => {
    const { activeIndex, layerStack } = operationStack;
    if (parameters.histogramParams.pixelRange && activeIndex > -1 && layerStack.length) {
      addEffect({
        name: "depthStack",
        value: {
          func: addScaleShift,
          params: [cloneCanvas(layerStack[activeIndex].bitmap), toolsParameters.aConstant, toolsParameters.bConstant]
        }
      });
    }
  }, [toolsParameters.aConstant, toolsParameters.bConstant]);
  const toolBox = () => {
    return (
      <>
        <div className="tool-ext w-100">
          <div className="w-100 mt-3 tool-ext-selection">
            <p className="mb-1">Select</p>
            <div disabled={operationStack.activeIndex <= 0} className="mt-4 tool-ext-selection-icons">
              {Object.keys(SelectionBox).map((key, index) => (
                <div
                  key={index}
                  onClick={() => {
                    if (memoryDepthCanvas) {
                      selectTool(key);
                    }
                  }}
                  id={`tool-tooltip-${index}`}
                  className={
                    activeDepthTool === key && memoryDepthCanvas
                      ? "selection-tool selection-tool-active"
                      : "selection-tool"
                  }
                >
                  {SelectionBox[key].icon}
                  <UncontrolledTooltip placement="bottom" target={`tool-tooltip-${index}`}>
                    {SelectionBox[key].tooltip}
                  </UncontrolledTooltip>
                </div>
              ))}
            </div>
            {activeDepthTool ? (
              <div className="d-flex my-2">
                <Button
                  className="custom-primary-button"
                  disabled={
                    !memoryDepthCanvas ||
                    !activeDepthTool ||
                    (activeDepthTool && SelectionBox[activeDepthTool].type !== "boundingBox")
                  }
                  size="sm"
                  onClick={() => {
                    onModifyBitmap();
                  }}
                >
                  {SelectionBox[activeDepthTool].text}
                </Button>
              </div>
            ) : null}
          </div>
          <div className="w-100 mt-4 tool-ext-section">
            <p className="mb-1">Local Adjustment</p>
            <Card className="tool-ext-card">
              <CardBody className="tool-ext-card-body">
                <FormGroup className="w-100">
                  <Label for="disparity">Depth Intensity</Label>
                  <div className="tool-ext-input d-flex justify-content-between w-100">
                    <Input
                      disabled={!memoryDepthCanvas || !parameters.histogramParams.pixelRange}
                      onChange={onHandleChange}
                      onMouseUp={onHandleUpdate}
                      className="tool-ext-input-slider"
                      id="disparity"
                      name="disparity"
                      min="-1"
                      max="1"
                      step={0.01}
                      type="range"
                      value={tempToolsParams.disparity}
                    />
                    <Input
                      disabled={!memoryDepthCanvas || !parameters.histogramParams.pixelRange}
                      onChange={onHandleChange}
                      onMouseLeave={onHandleUpdate}
                      onKeyDown={onHandleEnter}
                      bsSize="sm"
                      className="tool-ext-input-number"
                      id="disparity"
                      name="disparity"
                      type="number"
                      min="-1"
                      max="1"
                      step={0.01}
                      value={tempToolsParams.disparity}
                    />
                  </div>
                </FormGroup>
                <FormGroup className="w-100">
                  <Label for="scale">Depth Detail</Label>
                  <div className="tool-ext-input d-flex justify-content-between w-100">
                    <Input
                      disabled={!memoryDepthCanvas || !parameters.histogramParams.pixelRange}
                      onChange={onHandleChange}
                      onMouseUp={onHandleUpdate}
                      className="tool-ext-input-slider"
                      id="scale"
                      name="scale"
                      min="0"
                      max="1"
                      step={0.01}
                      type="range"
                      value={tempToolsParams.scale}
                    />
                    <Input
                      disabled={!memoryDepthCanvas || !parameters.histogramParams.pixelRange}
                      onChange={onHandleChange}
                      onMouseLeave={onHandleUpdate}
                      onKeyDown={onHandleEnter}
                      bsSize="sm"
                      className="tool-ext-input-number"
                      id="scale"
                      name="scale"
                      type="number"
                      min="0"
                      max="1"
                      step={0.01}
                      value={tempToolsParams.scale}
                    />
                  </div>
                </FormGroup>
              </CardBody>
            </Card>
          </div>
          <div className="w-100 mt-4 tool-ext-section">
            <p className="mb-1">Global Adjustment</p>
            <Card className="tool-ext-card">
              <CardBody className="tool-ext-card-body">
                <PointCurve
                  pointCurveProps={{
                    disabled: !memoryDepthCanvas || !parameters.histogramParams.pixelRange
                  }}
                />
                <FormGroup className="w-100">
                  <Label for="aConstant">A</Label>
                  <div className="tool-ext-input d-flex justify-content-between w-100">
                    <Input
                      disabled={!memoryDepthCanvas || !parameters.histogramParams.pixelRange}
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
                      bsSize="sm"
                      className="tool-ext-input-number"
                      id="aConstant"
                      name="aConstant"
                      type="number"
                      min="0"
                      max="2"
                      step={0.01}
                      value={tempToolsParams.aConstant}
                    />
                  </div>
                </FormGroup>
                <FormGroup className="w-100">
                  <Label for="bConstant">B</Label>
                  <div className="tool-ext-input d-flex justify-content-between w-100">
                    <Input
                      disabled={!memoryDepthCanvas || !parameters.histogramParams.pixelRange}
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
                      bsSize="sm"
                      className="tool-ext-input-number"
                      id="bConstant"
                      name="bConstant"
                      type="number"
                      min="0"
                      max="2"
                      step={0.01}
                      value={tempToolsParams.bConstant}
                    />
                  </div>
                </FormGroup>
              </CardBody>
            </Card>
          </div>
        </div>
      </>
    );
  };
  return (
    <SidePaneStyle>
      <div className="layer-mode-pane">
        <div className="layer-mode-header">
          <div className="layer-mode-header-title">
            <p>Selection Pane</p>
          </div>
        </div>
        <div className="layer-mode-body">
          {layers || null}
          {/* if later stack is empty, disable this */}
          <div
            disabled={mainDepthCanvas === null || mainRgbCanvas === null || operationStack.isSelectActive}
            className="my-2 layer-mode-body-add"
          >
            <Card className="layer-mode-body-add-card" onClick={addLayer}>
              <AiOutlinePlus />
            </Card>
          </div>
        </div>
        <div disabled={mainDepthCanvas === null || operationStack.layerStack.length <= 1} className="layer-mode-footer">
          <div className="layer-mode-footer-row text-center">
            <div className="layer-mode-apply-button mx-2">
              <Button className="custom-primary-button" size="sm" onClick={toggleLayerSelect}>
                {operationStack.isSelectActive ? `Cancel (${operationStack.selectedLayers.size})` : "Select"}
              </Button>
            </div>
            <div className="layer-mode-apply-button mx-2">
              <Button className="custom-secondary-button" size="sm" onClick={removeAllLayers}>
                Remove all
              </Button>
            </div>
          </div>
          <div className="layer-mode-footer-row text-center">
            <div className="layer-mode-apply-button mx-2">
              <Button
                className="custom-primary-button"
                size="sm"
                disabled={
                  memoryDepthCanvas === null || !operationStack.isSelectActive || operationStack.selectedLayers.size < 2
                }
                onClick={() => {
                  mergeLayerSelect();
                }}
              >
                Merge
              </Button>
            </div>
            <div className="layer-mode-apply-button mx-2">
              <Button
                className="custom-secondary-button"
                size="sm"
                disabled={
                  memoryDepthCanvas === null ||
                  !operationStack.isSelectActive ||
                  operationStack.selectedLayers.size === 0
                }
                onClick={() => {
                  removeLayerSelect();
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div
        disabled={operationStack.isSelectActive}
        className={toolExtOpen ? "tools-ext tool-ext-active" : "tools-ext tool-ext-inactive"}
      >
        <div className="tools-ext-body">
          <div className="tools-ext-elements">
            {toolBox()}
            <Button onClick={toolExtActions} className="toggle-button">
              {toolExtOpen ? <MdKeyboardArrowLeft /> : <MdKeyboardArrowRight />}
            </Button>
          </div>
        </div>
      </div>
    </SidePaneStyle>
  );
}

const mapStateToProps = state => ({
  toolExtOpen: toolExtSelectors.toolExtOpen(state),
  mainDepthCanvas: imageSelectors.mainDepthCanvas(state),
  mainRgbCanvas: imageSelectors.mainRgbCanvas(state),
  memoryDepthCanvas: imageSelectors.memoryDepthCanvas(state),
  activeDepthTool: imageSelectors.activeDepthTool(state),
  toolsParameters: imageSelectors.toolsParameters(state),
  parameters: imageSelectors.parameters(state),
  operationStack: imageSelectors.operationStack(state)
});

const mapDispatchToProps = {
  toolExtActions: toolExtActions.toggleToolExt,
  selectTool: imageActions.selectTool,
  addEffect: imageActions.addEffect,
  storeScribbleParams: imageActions.storeScribbleParams,
  addLayer: imageActions.addLayer,
  updateLayerIndex: imageActions.updateLayerIndex,
  updateLayer: imageActions.updateLayer,
  duplicateLayer: imageActions.duplicateLayer,
  removeLayer: imageActions.removeLayer,
  removeAllLayers: imageActions.removeAllLayers,
  toggleLayerSelect: imageActions.toggleLayerSelect,
  mergeLayerSelect: imageActions.mergeLayerSelect,
  removeLayerSelect: imageActions.removeLayerSelect,
  storeToolParameters: imageActions.storeToolParameters,
  clear: imageActions.clear
};

export default connect(mapStateToProps, mapDispatchToProps)(SidePane);
