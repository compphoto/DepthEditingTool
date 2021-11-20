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
import { editBoundingArea } from "utils/canvasUtils";

export function SidePane({
  toolExtOpen,
  toolExtActions,
  mainDepthCanvas,
  tempDepthCanvas,
  tools,
  parameters,
  initImage,
  selectTool
}) {
  const [activeTool, setActiveTool] = useState(0);
  const [toolRange, setToolRange] = useState({
    depthIntensityRange: 0
  });
  const toggleTool = index => {
    setActiveTool(index);
  };
  const onHandleChange = e => {
    let { name, value } = e.target;
    setToolRange({ ...toolRange, [name]: value });
  };
  useEffect(() => {
    if (tempDepthCanvas) {
      let tempDepthContext = tempDepthCanvas.getContext("2d");
      editBoundingArea(parameters.croppedeArea, tempDepthContext, toolRange.depthIntensityRange);
      initImage({ depthCanvaUpdate: toolRange.depthIntensityRange });
    }
  }, [toolRange.depthIntensityRange]);
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
                      if (mainDepthCanvas) {
                        selectTool("depth");
                      }
                    }}
                    className={tools.depth && mainDepthCanvas ? "card-tool card-tool-active" : "card-tool"}
                  >
                    <MdCrop />
                    Draw
                  </div>
                </div>
                <FormGroup className="w-100 my-3">
                  <Label for="depthIntensityRange">Intensity</Label>
                  <Input
                    onMouseUp={onHandleChange}
                    className="w-100"
                    id="depthIntensityRange"
                    name="depthIntensityRange"
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
  depthCanvaUpdate: imageSelectors.depthCanvaUpdate(state),
  tools: imageSelectors.tools(state),
  parameters: imageSelectors.parameters(state)
});

const mapDispatchToProps = {
  toolExtActions: toolExtActions.toggleToolExt,
  initImage: imageActions.initImage,
  selectTool: imageActions.selectTool
};

export default connect(mapStateToProps, mapDispatchToProps)(SidePane);
