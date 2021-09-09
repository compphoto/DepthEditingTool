import React, { useState } from "react";
import { Button } from "reactstrap";
import SidePaneStyle from "./style";
import Tools from "config/tools";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

export default function SidePane() {
  const [activeTool, setActiveTool] = useState(0);
  const toggleTool = index => {
    setActiveTool(index);
  };
  const adjust = () => {
    return "Adjust";
  };
  const effect = () => {
    return "Effect";
  };
  const text = () => {
    return "Text";
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
      )}
    </SidePaneStyle>
  );
}
