import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { toolExtActions } from "store/toolext";
import { imageActions } from "store/image";
import { selectors as toolExtSelectors } from "store/toolext";
import { selectors as imageSelectors } from "store/image";
import { Button, UncontrolledCollapse, CardBody, Card, FormGroup, Label, Input } from "reactstrap";
import SidePaneStyle from "./style";
import Tools from "config/tools";
import { MdCrop, MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { editBoundingArea, editHighlightPixelArea } from "utils/canvasUtils";

export function SidePane({
  toolExtOpen,
  toolExtActions,
  mainDepthCanvas,
  tempDepthCanvas,
  depthCanvasDimension,
  tools,
  toolsParameters,
  parameters,
  selectTool,
  storeToolParameters,
  addEffect
}) {
  const [activeTool, setActiveTool] = useState(0);
  const toggleTool = index => {
    setActiveTool(index);
  };
  const onHandleChange = e => {
    let { name, value } = e.target;
    storeToolParameters({ [name]: value });
  };
  useEffect(() => {
    if (parameters.croppedArea) {
      addEffect({
        name: "depthStack",
        value: { func: editBoundingArea, params: [parameters.croppedArea, toolsParameters.depthBoxIntensity] }
      });
    }
  }, [toolsParameters.depthBoxIntensity]);
  // useEffect(() => {
  //   if (tempDepthCanvas && parameters.pixelRange && (parameters.croppedArea || depthImageDimension)) {
  //     let tempDepthContext = tempDepthCanvas.getContext("2d");
  //     const { croppedArea, pixelRange } = parameters;
  //     let newArea = null;
  //     if (croppedArea) {
  //       newArea = croppedArea;
  //       editHighlightPixelArea(newArea, tempDepthContext, pixelRange, toolsParameters.depthRangeIntensity);
  //     } else {
  //       newArea = [
  //         depthImageDimension[0],
  //         depthImageDimension[1],
  //         depthImageDimension[2] - depthImageDimension[0],
  //         depthImageDimension[3] - depthImageDimension[1]
  //       ];
  //       editHighlightPixelArea(newArea, tempDepthContext, pixelRange, toolsParameters.depthRangeIntensity);
  //     }
  //   }
  // }, [toolsParameters.depthRangeIntensity]);
  const adjust = () => {
    return (
      <>
        <div className="tool-ext mt-4 w-100">
          <p className="mb-3 text-white">Depth</p>
          <Button className="mt-3 mb-3 dropdown-button" color="secondary" id="depth-area-toggler">
            Select Area
          </Button>
          <UncontrolledCollapse style={{ width: "100%" }} toggler="#depth-area-toggler">
            <Card className="tool-ext-card">
              <CardBody className="tool-ext-card-body">
                <div className="tool-ext-card-body-icons">
                  <div
                    onClick={() => {
                      if (tempDepthCanvas) {
                        selectTool("depth");
                      }
                    }}
                    className={tools.depth && tempDepthCanvas ? "card-tool card-tool-active" : "card-tool"}
                  >
                    <MdCrop />
                    Draw
                  </div>
                </div>
                <FormGroup className="w-100 my-3">
                  <Label for="depthBoxIntensity">Box Intensity</Label>
                  <Input
                    disabled={!tempDepthCanvas || !parameters.croppedArea}
                    onMouseUp={onHandleChange}
                    className="w-100"
                    id="depthBoxIntensity"
                    name="depthBoxIntensity"
                    min="-100"
                    max="100"
                    type="range"
                  />
                </FormGroup>
                <FormGroup className="w-100 my-3">
                  <Label for="depthRangeIntensity">Depth Intensity</Label>
                  <Input
                    disabled={!tempDepthCanvas || !parameters.pixelRange}
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
          <Button className="mt-3 mb-3 dropdown-button" color="secondary" id="depth-rotate-toggler">
            Rotate
          </Button>
          <UncontrolledCollapse toggler="#depth-rotate-toggler">
            <Card className="tool-ext-card">
              <CardBody className="tool-ext-card-body">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt magni, voluptas debitis similique
                porro a molestias consequuntur earum odio officiis natus, amet hic, iste sed dignissimos esse fuga!
                Minus, alias.
              </CardBody>
            </Card>
          </UncontrolledCollapse>
          <Button className="mt-3 mb-3 dropdown-button" color="secondary" id="depth-resize-toggler">
            Resize
          </Button>
          <UncontrolledCollapse toggler="#depth-resize-toggler">
            <Card className="tool-ext-card">
              <CardBody className="tool-ext-card-body">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt magni, voluptas debitis similique
                porro a molestias consequuntur earum odio officiis natus, amet hic, iste sed dignissimos esse fuga!
                Minus, alias.
              </CardBody>
            </Card>
          </UncontrolledCollapse>

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
  tools: imageSelectors.tools(state),
  toolsParameters: imageSelectors.toolsParameters(state),
  parameters: imageSelectors.parameters(state)
});

const mapDispatchToProps = {
  toolExtActions: toolExtActions.toggleToolExt,
  selectTool: imageActions.selectTool,
  addEffect: imageActions.addEffect,
  storeToolParameters: imageActions.storeToolParameters
};

export default connect(mapStateToProps, mapDispatchToProps)(SidePane);
