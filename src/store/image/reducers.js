import { canvasLike, cloneCanvas } from "utils/canvasUtils";
import { types } from "./constants";

const initialState = {
  rgbImageUrl: null,
  depthImageUrl: null,
  mainRgbCanvas: null,
  mainDepthCanvas: null,
  displayRgbCanvas: null,
  memoryDepthCanvas: null,
  displayDepthCanvas: null,
  cacheRgbCanvas: null,
  cacheDepthCanvas: null,
  prevRgbSize: { width: null, height: null },
  prevDepthSize: { width: null, height: null },
  rgbBitmapCanvas: null,
  depthBitmapCanvas: null,
  layerMode: false,
  scribbleParams: {
    pos: { x: 0, y: 0 },
    offset: {},
    path: []
  },
  rgbScaleParams: {
    ratio: 1,
    centerShift_x: 0,
    centerShift_y: 0,
    translatePos: {
      x: 0,
      y: 0
    },
    scale: 1.0,
    scaleMultiplier: 0.8,
    startDragOffset: {},
    mouseDown: false
  },
  depthScaleParams: {
    ratio: 1,
    centerShift_x: 0,
    centerShift_y: 0,
    translatePos: {
      x: 0,
      y: 0
    },
    scale: 1.0,
    scaleMultiplier: 0.8,
    startDragOffset: {},
    mouseDown: false
  },
  tools: {
    currentTool: null,
    singleSelection: false,
    addSelection: false,
    subtractSelection: false,
    intersectSelection: false,
    panTool: false,
    scribbleTool: false
  },
  toolsParameters: {
    disparity: 0,
    scale: 1,
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
    }
  },
  operationStack: {
    rgbStack: [],
    depthStack: [],
    layerStack: [],
    activeIndex: -1
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
    case types.INIT_RGB:
      var rgbScaleParams = state.depthImageUrl
        ? state.depthScaleParams
        : {
            ratio: 1,
            centerShift_x: 0,
            centerShift_y: 0,
            translatePos: {
              x: 0,
              y: 0
            },
            scale: 1.0,
            scaleMultiplier: 0.8,
            startDragOffset: {},
            mouseDown: false
          };
      return {
        ...state,
        mainRgbCanvas: payload,
        displayRgbCanvas: null,
        cacheRgbCanvas: null,
        prevRgbSize: { width: null, height: null },
        rgbBitmapCanvas: null,
        rgbScaleParams: rgbScaleParams,
        operationStack: {
          ...state.operationStack,
          rgbStack: []
        }
      };
    case types.INIT_DEPTH:
      var depthScaleParams = state.rgbImageUrl
        ? state.rgbScaleParams
        : {
            ratio: 1,
            centerShift_x: 0,
            centerShift_y: 0,
            translatePos: {
              x: 0,
              y: 0
            },
            scale: 1.0,
            scaleMultiplier: 0.8,
            startDragOffset: {},
            mouseDown: false
          };
      return {
        ...state,
        mainDepthCanvas: payload,
        memoryDepthCanvas: null,
        displayDepthCanvas: null,
        cacheDepthCanvas: null,
        prevDepthSize: { width: null, height: null },
        rgbBitmapCanvas: null,
        depthBitmapCanvas: null,
        layerMode: false,
        scribbleParams: {
          pos: { x: 0, y: 0 },
          offset: {},
          path: []
        },
        depthScaleParams: depthScaleParams,
        tools: {
          currentTool: null,
          singleSelection: false,
          addSelection: false,
          subtractSelection: false,
          intersectSelection: false,
          panTool: false,
          scribbleTool: false
        },
        toolsParameters: {
          disparity: 0,
          scale: 0,
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
          }
        },
        operationStack: {
          ...state.operationStack,
          depthStack: [],
          layerStack: []
        }
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
    case types.STORE_SCRIBBLE_PARAMS:
      return {
        ...state,
        scribbleParams: {
          ...state.scribbleParams,
          ...payload
        }
      };
    case types.STORE_SCALE_PARAMS:
      var { name, value } = payload;
      return {
        ...state,
        [name]: {
          ...state[name],
          ...value
        }
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
    case types.TOGGLE_LAYER_MODE:
      return {
        ...state,
        layerMode: !state.layerMode
      };
    case types.INIT_LAYER:
      return {
        ...state,
        operationStack: {
          ...state.operationStack,
          layerStack: [
            {
              bitmap: cloneCanvas(state.mainDepthCanvas),
              toolsParameters: {
                disparity: 0,
                scale: 1,
                brightness: 0,
                contrast: 0,
                sharpness: 0,
                aConstant: 0,
                bConstant: 0
              }
            }
          ],
          activeIndex: 0
        }
      };
    case types.ADD_LAYER:
      var newLayerStack = [
        ...state.operationStack.layerStack,
        {
          bitmap: canvasLike(state.mainDepthCanvas),
          toolsParameters: {
            disparity: 0,
            scale: 1,
            brightness: 0,
            contrast: 0,
            sharpness: 0,
            aConstant: 0,
            bConstant: 0
          }
        }
      ];
      return {
        ...state,
        operationStack: {
          ...state.operationStack,
          layerStack: newLayerStack,
          activeIndex: newLayerStack.length - 1
        }
      };
    case types.UPDATE_LAYER_INDEX:
      return {
        ...state,
        operationStack: {
          ...state.operationStack,
          layerStack: [...state.operationStack.layerStack],
          activeIndex: payload
        }
      };
    case types.UPDATE_LAYER:
      var { index, value } = payload;
      var layerStack = [...state.operationStack.layerStack];
      var layer = {
        ...layerStack[index],
        ...value
      };
      layerStack[index] = layer;
      return {
        ...state,
        operationStack: {
          ...state.operationStack,
          layerStack: layerStack
        }
      };
    case types.REMOVE_LAYER:
      var newLayerStack = [...state.operationStack.layerStack];
      if (payload !== -1) {
        newLayerStack.splice(payload, 1);
      }
      if (newLayerStack.length < 1) {
        return state;
      }
      return {
        ...state,
        operationStack: {
          ...state.operationStack,
          layerStack: newLayerStack,
          activeIndex: newLayerStack.length - 1
        }
      };
    case types.REMOVE_ALL_LAYER:
      var newLayerStack = [state.operationStack.layerStack[0]];
      return {
        ...state,
        operationStack: {
          ...state.operationStack,
          layerStack: newLayerStack,
          activeIndex: 0
        }
      };
    case types.ADD_OPERATION:
      var { name, value } = payload;
      var array = state.operationStack[name];
      var newArray = array.filter(x => {
        if (x.func.toString() !== value.func.toString()) {
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
        state.operationStack[name][state.operationStack[name].length - 1].func.toString() === value.func.toString()
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
    case types.ZOOM_IN:
      return {
        ...state,
        rgbScaleParams: {
          ...state.rgbScaleParams,
          scale: state.rgbScaleParams.scale / state.rgbScaleParams.scaleMultiplier
        },
        depthScaleParams: {
          ...state.depthScaleParams,
          scale: state.depthScaleParams.scale / state.depthScaleParams.scaleMultiplier
        }
      };
    case types.ZOOM_OUT:
      return {
        ...state,
        rgbScaleParams: {
          ...state.rgbScaleParams,
          scale: state.rgbScaleParams.scale * state.rgbScaleParams.scaleMultiplier
        },
        depthScaleParams: {
          ...state.depthScaleParams,
          scale: state.depthScaleParams.scale * state.depthScaleParams.scaleMultiplier
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
        scribbleParams: {
          pos: { x: 0, y: 0 },
          offset: {},
          path: []
        },
        parameters: {
          ...state.parameters,
          croppedCanvasImage: null,
          croppedArea: null,
          histogramParams: {
            pixelRange: [0, 255],
            domain: [0, 255],
            values: [0, 255],
            update: [0, 255]
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
      var layerStack = [state.operationStack.layerStack[0]];
      return {
        ...state,
        scribbleParams: {
          pos: { x: 0, y: 0 },
          offset: {},
          path: []
        },
        rgbScaleParams: {
          ...state.rgbScaleParams,
          translatePos: {
            x: 0,
            y: 0
          },
          scale: 1.0,
          scaleMultiplier: 0.8,
          startDragOffset: {},
          mouseDown: false
        },
        depthScaleParams: {
          ...state.depthScaleParams,
          translatePos: {
            x: 0,
            y: 0
          },
          scale: 1.0,
          scaleMultiplier: 0.8,
          startDragOffset: {},
          mouseDown: false
        },
        parameters: {
          ...state.parameters,
          croppedCanvasImage: null,
          croppedArea: null,
          histogramParams: {
            pixelRange: [0, 255],
            domain: [0, 255],
            values: [0, 255],
            update: [0, 255]
          }
        },
        operationStack: {
          ...state.operationStack,
          rgbStack: [...rgbStack],
          depthStack: [...depthStack],
          layerStack: [...layerStack]
        }
      };
    case types.REMOVE_ITEM:
      return {
        ...state,
        ...payload
      };
    case types.REMOVE_ALL_ITEM:
      return {
        ...state,
        ...initialState
      };
    default: {
      return state;
    }
  }
};
