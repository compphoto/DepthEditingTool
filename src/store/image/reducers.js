import { canvasLike, cloneCanvas, mergeBitmap } from "utils/canvasUtils";
import { types } from "./constants";

const initialState = {
  rgbImageUrl: null,
  depthImageUrl: null,
  selectionImageUrl: null,
  maskImageUrl: null,
  mainRgbCanvas: null,
  mainDepthCanvas: null,
  displayRgbCanvas: null,
  memoryDepthCanvas: null,
  displayDepthCanvas: null,
  cacheDepthCanvas: null,
  isEffectNew: true,
  prevRgbSize: { width: null, height: null },
  prevDepthSize: { width: null, height: null },
  rgbBitmapCanvas: null,
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
  isPanActive: false,
  activeDepthTool: null,
  activeGroundTool: null,
  groundParams: {
    rectangle: null,
    path: null
  },
  toolsParameters: {
    disparity: 0,
    scale: 1,
    aConstant: 1,
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
    activeIndex: -1,
    isSelectActive: false,
    selectedLayers: new Set()
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
        scribbleParams: {
          pos: { x: 0, y: 0 },
          offset: {},
          path: []
        },
        depthScaleParams: depthScaleParams,
        activeDepthTool: null,
        activeGroundTool: null,
        groundParams: {
          rectangle: null,
          path: null
        },
        toolsParameters: {
          disparity: 0,
          scale: 1,
          aConstant: 1,
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
    case types.TOGGLE_PAN:
      return {
        ...state,
        isPanActive: !state.isPanActive
      };
    case types.SELECT_TOOL:
      var prevTool = state.activeDepthTool;
      return {
        ...state,
        activeDepthTool: prevTool === payload ? null : payload,
        activeGroundTool: null
      };
    case types.SELECT_GROUND_TOOL:
      var prevTool = state.activeGroundTool;
      return {
        ...state,
        activeGroundTool: prevTool === payload ? null : payload,
        activeDepthTool: null
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
    case types.STORE_GROUND_PARAMS:
      return {
        ...state,
        groundParams: {
          ...state.groundParams,
          ...payload
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
                aConstant: 1,
                bConstant: 0
              }
            }
          ],
          activeIndex: 0,
          isSelectActive: false,
          selectedLayers: new Set()
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
            aConstant: 1,
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
      var operationStack = state.operationStack;
      var update;
      if (operationStack.isSelectActive) {
        update = {
          selectedLayers:
            payload === 0
              ? operationStack.selectedLayers
              : operationStack.selectedLayers.has(payload)
              ? new Set([...operationStack.selectedLayers].filter(x => x !== payload))
              : new Set([...operationStack.selectedLayers, payload])
        };
      } else {
        update = { activeIndex: payload };
      }
      return {
        ...state,
        operationStack: {
          ...state.operationStack,
          layerStack: [...state.operationStack.layerStack],
          ...update
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
    case types.DUPLICATE_LAYER:
      var layerStack = [...state.operationStack.layerStack];
      var index = payload;
      var layer = {
        ...layerStack[index]
      };
      layerStack.splice(index + 1, 0, layer);
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
          activeIndex: 0,
          isSelectActive: false,
          selectedLayers: new Set()
        }
      };
    case types.TOGGLE_LAYER_SELECT:
      return {
        ...state,
        operationStack: {
          ...state.operationStack,
          isSelectActive: !state.operationStack.isSelectActive,
          selectedLayers: new Set()
        }
      };
    case types.MERGE_LAYER_SELECT:
      var layerStack = [...state.operationStack.layerStack];
      var selectedLayers = state.operationStack.selectedLayers;
      var bitmap = canvasLike(state.mainDepthCanvas);
      selectedLayers.forEach(index => {
        bitmap = mergeBitmap(bitmap, layerStack[index].bitmap);
        // layerStack.splice(index, 1);
      });
      return {
        ...state,
        operationStack: {
          ...state.operationStack,
          layerStack: [
            ...layerStack,
            {
              bitmap: bitmap,
              toolsParameters: {
                disparity: 0,
                scale: 1,
                aConstant: 1,
                bConstant: 0
              }
            }
          ],
          activeIndex: layerStack.length, // no need for -1 since a new layer is added
          isSelectActive: false,
          selectedLayers: new Set()
        }
      };
    case types.REMOVE_LAYER_SELECT:
      var layerStack = [...state.operationStack.layerStack];
      var selectedLayers = state.operationStack.selectedLayers;
      selectedLayers.forEach(index => {
        layerStack.splice(index, 1);
      });
      return {
        ...state,
        operationStack: {
          ...state.operationStack,
          layerStack: layerStack,
          activeIndex: layerStack.length - 1,
          isSelectActive: false,
          selectedLayers: new Set()
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
      var params = value.params;
      var cacheDepthCanvas = state.cacheDepthCanvas;
      var isEffectNew = false;
      var currentId = state.operationStack.activeIndex;
      if (
        state.operationStack[name].length !== 0 &&
        state.operationStack[name][state.operationStack[name].length - 1].func.name.toString() ===
          value.func.name.toString() &&
        state.operationStack[name][state.operationStack[name].length - 1].id === currentId
      ) {
        state.operationStack[name].pop();
      } else {
        isEffectNew = true;
        cacheDepthCanvas = cloneCanvas(state.memoryDepthCanvas);
      }
      if (Array.isArray(params) && params.length) {
        params.push(cacheDepthCanvas);
      }
      return {
        ...state,
        cacheDepthCanvas,
        isEffectNew,
        operationStack: {
          ...state.operationStack,
          [name]: [...state.operationStack[name], { ...value, params: params, type: "effect", id: currentId }]
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
          layerStack: [...layerStack],
          activeIndex: 0,
          isSelectActive: false,
          selectedLayers: new Set()
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
