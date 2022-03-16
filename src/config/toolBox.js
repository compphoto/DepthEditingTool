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
    name: "Single Selection",
    icon: <MdCropDin />,
    tooltip: "single",
    type: "boundingBox",
    func: modifySingleSelection
  },
  addSelection: {
    name: "Multiple Selection",
    icon: <RiCheckboxMultipleBlankLine />,
    tooltip: "multiple",
    type: "boundingBox",
    func: modifyAddSelection
  },
  subtractSelection: {
    name: "Subtract Selection",
    icon: <BsSubtract />,
    tooltip: "subtract",
    type: "boundingBox",
    func: modifySubtractSelection
  },
  intersectSelection: {
    name: "Intersection Selection",
    icon: <BiIntersect />,
    tooltip: "intersection",
    type: "boundingBox",
    func: modifyIntersectSelection
  },
  panTool: {
    name: "Pan",
    icon: <MdOutlinePanTool />,
    tooltip: "pan",
    type: "pan",
    func: null
  },
  scribbleTool: {
    name: "Scribble",
    icon: <ImPencil />,
    tooltip: "scribble",
    type: "scribble",
    func: null
  }
};
