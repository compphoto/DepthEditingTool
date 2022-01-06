import { cloneCanvas } from "utils/canvasUtils";
import { types } from "./constants";

const initialState = {
  rgbImageUrl: null,
  depthImageUrl: null,
  mainRgbCanvas: null, // use canvas to image to convert to image
  mainDepthCanvas: null, // use canvas to image to convert to image
  tempRgbCanvas: null, // global reference to depth canvas
  tempDepthCanvas: null, // global reference to depth canvas
  prevRgbSize: { width: null, height: null },
  prevDepthSize: { width: null, height: null },
  rgbCanvasDimension: null,
  depthCanvasDimension: null,
  bitmapCanvas: document.createElement("canvas"),
  tools: {
    currentTool: null,
    singleSelection: false,
    addSelection: false,
    subtractSelection: false,
    intersectSelection: false
  },
  toolsParameters: {
    depthRangeIntensity: 0,
    depthScale: 0,
    brightness: 0,
    contrast: 0,
    sharpness: 0,
    aConstant: 0,
    bConstant: 0
  },
  parameters: {
    croppedCanvasImage: null,
    croppedArea: null,
    histogramParams: {
      pixelRange: [0, 255],
      domain: [0, 255],
      values: [0, 255],
      update: [0, 255]
    },
    canvasParams: {
      translatePos: {},
      scale: 1.0,
      scaleMultiplier: 0.8,
      startDragOffset: {},
      mouseDown: false
    }
  },
  operationStack: {
    rgbStack: [],
    depthStack: [],
    moveStack: [],
    layerStack: []
  }
};

export const imageReducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case types.HANDLE_CHANGE:
      return {
        ...state,
        [payload.name]: payload.files[0]
      };
    case types.INIT_IMAGE:
      return {
        ...state,
        ...payload
      };
    case types.SELECT_TOOL:
      var prevTool = state.tools.currentTool;
      if (prevTool === payload) {
        return {
          ...state,
          tools: {
            ...state.tools,
            currentTool: null,
            [payload]: false
          }
        };
      }
      var newTools = prevTool
        ? {
            ...state.tools,
            currentTool: payload,
            [payload]: true,
            [prevTool]: false
          }
        : {
            ...state.tools,
            currentTool: payload,
            [payload]: true
          };
      return {
        ...state,
        tools: newTools
      };
    case types.STORE_TOOL_PARAMETERS:
      return {
        ...state,
        toolsParameters: {
          ...state.toolsParameters,
          ...payload
        }
      };
    case types.STORE_PARAMETERS:
      return {
        ...state,
        parameters: {
          ...state.parameters,
          ...payload
        }
      };
    case types.ADD_LAYER:
      return {
        ...state,
        operationStack: {
          ...state.operationStack,
          layerStack: [...state.operationStack.layerStack, { depth: 0, bitmap: cloneCanvas(state.bitmapCanvas) }]
        }
      };
    case types.REMOVE_LAYER:
      var newLayerStack = [...state.operationStack.layerStack];
      if (payload !== -1) {
        newLayerStack.splice(payload, 1);
      }
      return {
        ...state,
        operationStack: {
          ...state.operationStack,
          layerStack: newLayerStack
        }
      };
    case types.REMOVE_ALL_LAYER:
      return {
        ...state,
        operationStack: {
          ...state.operationStack,
          layerStack: []
        }
      };
    case types.ADD_OPERATION:
      var { name, value } = payload;
      var array = state.operationStack[name];
      var newArray = array.filter(x => {
        if (x.func.toString() !== value.func.toString()) {
          if (x.func.toString().includes("scale, translatePos")) {
            return;
          }
          return x;
        }
      });
      return {
        ...state,
        operationStack: {
          ...state.operationStack,
          [name]: [...newArray, { ...value, type: "operation" }]
        }
      };
    case types.REMOVE_OPERATION:
      var { name, value } = payload;
      var array = state.operationStack[name];
      var newArray = array.filter(x => {
        if (x.func.toString() !== value.toString()) {
          return x;
        }
      });
      return {
        ...state,
        operationStack: {
          ...state.operationStack,
          [name]: [...newArray]
        }
      };
    case types.ADD_EFFECT:
      var { name, value } = payload;
      if (
        state.operationStack[name].length !== 0 &&
        (state.operationStack[name][state.operationStack[name].length - 1].func.toString() === value.func.toString() ||
          state.operationStack[name][state.operationStack[name].length - 1].func
            .toString()
            .includes("scale, translatePos"))
      ) {
        state.operationStack[name].pop();
      }
      return {
        ...state,
        operationStack: {
          ...state.operationStack,
          [name]: [...state.operationStack[name], { ...value, type: "effect" }]
        }
      };
    case types.UNDO:
      var depthStack = state.operationStack.depthStack;
      var lastEffect = -1;
      depthStack.forEach((element, index) => {
        if (element.type === "effect" && index !== 0) {
          lastEffect = index;
        }
      });
      var newDepthStack = depthStack.filter((x, index) => {
        if (index !== lastEffect) {
          return x;
        }
      });
      return {
        ...state,
        operationStack: {
          ...state.operationStack,
          depthStack: [...newDepthStack]
        }
      };
    case types.CLEAR:
      var rgbStack = [state.operationStack.rgbStack[0]];
      var depthStack = state.operationStack.depthStack.filter(x => {
        if (x.type === "effect") {
          return x;
        }
      });
      return {
        ...state,
        parameters: {
          ...state.parameters,
          croppedCanvasImage: null,
          croppedArea: null,
          histogramParams: {
            pixelRange: [0, 255],
            domain: [0, 255],
            values: [0, 255],
            update: [0, 255]
          },
          canvasParams: {
            ...state.parameters.canvasParams,
            translatePos: {
              x: 0,
              y: 0
            },
            scale: 1.0,
            scaleMultiplier: 0.8,
            startDragOffset: {},
            mouseDown: false
          }
        },
        operationStack: {
          ...state.operationStack,
          rgbStack: [...rgbStack],
          depthStack: [...depthStack]
        }
      };
    case types.RESET:
      var rgbStack = [state.operationStack.rgbStack[0]];
      var depthStack = [state.operationStack.depthStack[0]];
      return {
        ...state,
        parameters: {
          ...state.parameters,
          croppedCanvasImage: null,
          croppedArea: null,
          histogramParams: {
            pixelRange: [0, 255],
            domain: [0, 255],
            values: [0, 255],
            update: [0, 255]
          },
          canvasParams: {
            ...state.parameters.canvasParams,
            translatePos: {
              x: 0,
              y: 0
            },
            scale: 1.0,
            scaleMultiplier: 0.8,
            startDragOffset: {},
            mouseDown: false
          }
        },
        operationStack: {
          ...state.operationStack,
          rgbStack: [...rgbStack],
          depthStack: [...depthStack]
        }
      };
    case types.REMOVE_ITEM:
      return {
        ...state,
        ...payload
      };
    case types.REMOVE_ALL_ITEM:
      var newState = {
        rgbImageUrl: null,
        depthImageUrl: null,
        mainRgbCanvas: null, // use canvas to image to convert to image
        mainDepthCanvas: null, // use canvas to image to convert to image
        tempRgbCanvas: null, // global reference to depth canvas
        tempDepthCanvas: null, // global reference to depth canvas
        prevRgbSize: { width: null, height: null },
        prevDepthSize: { width: null, height: null },
        rgbCanvasDimension: null,
        depthCanvasDimension: null,
        bitmapCanvas: document.createElement("canvas"),
        tools: {
          currentTool: null,
          singleSelection: false,
          addSelection: false,
          subtractSelection: false,
          intersectSelection: false
        },
        toolsParameters: {
          depthRangeIntensity: 0,
          depthScale: 0,
          brightness: 0,
          contrast: 0,
          sharpness: 0,
          aConstant: 0,
          bConstant: 0
        },
        parameters: {
          croppedCanvasImage: null,
          croppedArea: null,
          histogramParams: {
            pixelRange: [0, 255],
            domain: [0, 255],
            values: [0, 255],
            update: [0, 255]
          },
          canvasParams: {
            translatePos: {},
            scale: 1.0,
            scaleMultiplier: 0.8,
            startDragOffset: {},
            mouseDown: false
          }
        },
        operationStack: {
          rgbStack: [],
          depthStack: [],
          moveStack: [],
          layerStack: []
        }
      };
      return {
        ...state,
        ...newState
      };
    default: {
      return state;
    }
  }
};
