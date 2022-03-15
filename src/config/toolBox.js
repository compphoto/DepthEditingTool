import React from "react";
import { MdOutlinePanTool, MdCropDin } from "react-icons/md";
import { RiCheckboxMultipleBlankLine } from "react-icons/ri";
import { BiIntersect } from "react-icons/bi";
import { BsSubtract } from "react-icons/bs";
import { ImPencil } from "react-icons/im";
import {
  modifyAddSelection,
  modifyIntersectSelection,
  modifySingleSelection,
  modifySubtractSelection
} from "utils/toolBoxUtils";

export const SelectionBox = {
  singleSelection: {
    name: "ToolBox",
    icon: <MdCropDin />,
    tooltip: "test",
    type: "boundingBox",
    func: modifySingleSelection
  },
  addSelection: {
    name: "Adjust",
    icon: <RiCheckboxMultipleBlankLine />,
    tooltip: "test",
    type: "boundingBox",
    func: modifyAddSelection
  },
  subtractSelection: {
    name: "Effects",
    icon: <BsSubtract />,
    tooltip: "test",
    type: "boundingBox",
    func: modifySubtractSelection
  },
  intersectSelection: {
    name: "Effects",
    icon: <BiIntersect />,
    tooltip: "test",
    type: "boundingBox",
    func: modifyIntersectSelection
  },
  panTool: {
    name: "Effects",
    icon: <MdOutlinePanTool />,
    tooltip: "test",
    type: "pan",
    func: null
  },
  scribbleTool: {
    name: "Effects",
    icon: <ImPencil />,
    tooltip: "test",
    type: "scribble",
    func: null
  }
};
