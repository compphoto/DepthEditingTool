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
  canvasToImage,
  cloneCanvas,
  cropCanvas,
  dimensionToBox,
  drawBox,
  editBrightness,
  editContrast,
  editHighlightPixelArea,
  highlightPixelArea,
  modifyBitmap
} from "utils/canvasUtils";
import PointCurve from "components/PointCurve";

export function SidePane({
  toolExtOpen,
  toolExtActions,
  mainDepthCanvas,
  tempDepthCanvas,
  depthCanvasDimension,
  bitmapCanvas,
  tools,
  toolsParameters,
  parameters,
  selectTool,
  storeToolParameters,
  storeParameters,
  addEffect,
  removeOperation
}) {
  const [activeTool, setActiveTool] = useState(0);
  const toggleTool = index => {
    setActiveTool(index);
  };
  const onHandleChange = e => {
    let { name, value } = e.target;
    storeToolParameters({ [name]: value });
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
    removeOperation({
      name: "depthStack",
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
  const adjust = () => {
    return (
      <>
        <div className="tool-ext w-100">
          <div className="w-100 mt-3 tool-ext-section">
            <p className="mb-3 text-white">Depth Selection</p>
            <div className="tool-ext-selection">
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
                    <Input
                      disabled={!tempDepthCanvas || !parameters.histogramParams.pixelRange}
                      onMouseUp={onHandleChange}
                      className="w-100"
                      id="depthRangeIntensity"
                      name="depthRangeIntensity"
                      min="-100"
                      max="100"
                      type="range"
                    />
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
                    <Input
                      disabled={!tempDepthCanvas}
                      onMouseUp={onHandleChange}
                      className="w-100"
                      id="brightness"
                      name="brightness"
                      min="-100"
                      max="100"
                      type="range"
                    />
                  </FormGroup>
                  <FormGroup className="w-100">
                    <Label for="contrast">Contrast</Label>
                    <Input
                      disabled={!tempDepthCanvas}
                      onMouseUp={onHandleChange}
                      className="w-100"
                      id="contrast"
                      name="contrast"
                      min="0"
                      max="100"
                      type="range"
                    />
                  </FormGroup>
                  <FormGroup className="w-100">
                    <Label for="saturation">Saturation</Label>
                    <Input
                      disabled={!tempDepthCanvas}
                      onMouseUp={onHandleChange}
                      className="w-100"
                      id="saturation"
                      name="saturation"
                      min="-100"
                      max="100"
                      type="range"
                    />
                  </FormGroup>
                  <FormGroup className="w-100">
                    <Label for="sharpness">Sharpness</Label>
                    <Input
                      disabled={!tempDepthCanvas}
                      onMouseUp={onHandleChange}
                      className="w-100"
                      id="sharpness"
                      name="sharpness"
                      min="-100"
                      max="100"
                      type="range"
                    />
                  </FormGroup>
                </CardBody>
              </Card>
            </UncontrolledCollapse>
            <Button className="mt-4 mb-2 dropdown-button" color="secondary" id="fine-tune-toggler">
              Fine Tune
            </Button>
            <UncontrolledCollapse style={{ width: "100%" }} toggler="#fine-tune-toggler">
              <Card className="tool-ext-card">
                <CardBody className="tool-ext-card-body">
                  <FormGroup className="w-100">
                    <Label for="depthRangeIntensity">Depth Intensity</Label>
                    <Input
                      disabled={!tempDepthCanvas || !parameters.histogramParams.pixelRange}
                      onMouseUp={onHandleChange}
                      className="w-100"
                      id="depthRangeIntensity"
                      name="depthRangeIntensity"
                      min="-100"
                      max="100"
                      type="range"
                    />
                  </FormGroup>
                </CardBody>
              </Card>
            </UncontrolledCollapse>
            <Button className="mt-4 mb-2 dropdown-button" color="secondary" id="color-adjust-toggler">
              Color
            </Button>
            <UncontrolledCollapse style={{ width: "100%" }} toggler="#color-adjust-toggler">
              <Card className="tool-ext-card">
                <CardBody className="tool-ext-card-body">
                  <FormGroup className="w-100">
                    <Label for="depthRangeIntensity">Depth Intensity</Label>
                    <Input
                      disabled={!tempDepthCanvas || !parameters.histogramParams.pixelRange}
                      onMouseUp={onHandleChange}
                      className="w-100"
                      id="depthRangeIntensity"
                      name="depthRangeIntensity"
                      min="-100"
                      max="100"
                      type="range"
                    />
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
  tempDepthCanvas: imageSelectors.tempDepthCanvas(state),
  depthCanvasDimension: imageSelectors.depthCanvasDimension(state),
  bitmapCanvas: imageSelectors.bitmapCanvas(state),
  tools: imageSelectors.tools(state),
  toolsParameters: imageSelectors.toolsParameters(state),
  parameters: imageSelectors.parameters(state)
});

const mapDispatchToProps = {
  toolExtActions: toolExtActions.toggleToolExt,
  selectTool: imageActions.selectTool,
  addEffect: imageActions.addEffect,
  removeOperation: imageActions.removeOperation,
  storeParameters: imageActions.storeParameters,
  storeToolParameters: imageActions.storeToolParameters
};

export default connect(mapStateToProps, mapDispatchToProps)(SidePane);
