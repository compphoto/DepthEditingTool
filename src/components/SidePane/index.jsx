import React, { useState } from "react";
import { Button, UncontrolledCollapse, CardBody, Card } from "reactstrap";
import SidePaneStyle from "./style";
import Tools from "config/tools";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

export default function SidePane() {
  const [activeTool, setActiveTool] = useState(0);
  const toggleTool = index => {
    setActiveTool(index);
  };
  const adjust = () => {
    return (
      <>
        <div className="tool-ext mt-4 w-100">
          <p className="mb-3 text-white">Size</p>
          <Button className="mt-3 mb-3 dropdown-button" color="secondary" id="adjust-crop-toggler">
            Crop
          </Button>
          <UncontrolledCollapse toggler="#adjust-crop-toggler">
            <Card>
              <CardBody>
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
            <Card>
              <CardBody>
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
            <Card>
              <CardBody>
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
  const effect = () => {
    return (
      <>
        <div className="tool-ext mt-4 w-100">
          <p className="mb-3 text-white">Size</p>
          <Button className="mt-3 mb-3 dropdown-button" color="secondary" id="adjust-crop-toggler">
            Crop
          </Button>
          <UncontrolledCollapse toggler="#adjust-crop-toggler">
            <Card>
              <CardBody>
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
            <Card>
              <CardBody>
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
            <Card>
              <CardBody>
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
            <Card>
              <CardBody>
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
            <Card>
              <CardBody>
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
            <Card>
              <CardBody>
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
      {activeTool === -1 ? null : (
        <div style={{ position: "relative" }}>
          <div className="tools-ext">
            {activeTool === 0 ? adjust() : activeTool === 1 ? effect() : activeTool === 2 ? text() : null}
            <Button
              onClick={() => {
                toggleTool(-1);
              }}
              className="toggle-button"
            >
              {activeTool === -1 ? <MdKeyboardArrowRight /> : <MdKeyboardArrowLeft />}
            </Button>
          </div>
        </div>
      )}
    </SidePaneStyle>
  );
}
