import { types } from "./constants";

const initialState = {
  rgbImageUrl: null,
  depthImageUrl: null,
  loadedRgbImage: null,
  loadedDepthImage: null,
  mainRgbCanvas: null, // use canvas to image to convert to image
  mainDepthCanvas: null, // use canvas to image to convert to image
  tempRgbCanvas: null, // global reference to depth canvas
  tempDepthCanvas: null, // global reference to depth canvas
  rgbImageDimension: null,
  depthImageDimension: null,
  prevRgbSize: { width: null, height: null },
  prevDepthSize: { width: null, height: null },
  scaleParams: {
    ratio: null,
    shiftX: null,
    shiftY: null
  },
  tools: {
    currentTool: null,
    depth: false
  },
  toolsParameters: {
    depthBoxIntensity: 0,
    depthRangeIntensity: 0
  },
  parameters: {
    croppedCanvasImage: null,
    croppedeArea: null,
    pixelRange: null
  },
  operationStack: {
    rgbCanvasStack: [],
    depthCanvasStack: [],
    mainRgbStack: [],
    mainDepthStack: []
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
      let prevTool = state.tools.currentTool;
      if (prevTool === payload) {
        return {
          ...state,
          tools: {
            ...state.tools,
            currentTool: null,
            [payload]: false
          },
          toolsParameters: {
            depthBoxIntensity: 0,
            depthRangeIntensity: 0
          }
        };
      }
      let newTools = prevTool
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
        tools: newTools,
        toolsParameters: {
          depthBoxIntensity: 0,
          depthRangeIntensity: 0
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
    case types.ADD_OPERATION:
      return {
        ...state,
        operationStack: {
          ...state.operationStack,
          [payload.name]: [...state.operationStack, payload.value]
        }
      };
    case types.REMOVE_ITEM:
      return {
        ...state,
        ...payload
      };
    case types.REMOVE_ALL_ITEM:
      let newState = {
        rgbImageUrl: null,
        depthImageUrl: null,
        loadedRgbImage: null,
        loadedDepthImage: null,
        mainRgbCanvas: null,
        mainDepthCanvas: null,
        tempRgbCanvas: null,
        tempDepthCanvas: null,
        rgbImageDimension: null,
        depthImageDimension: null,
        scaleParams: {
          ratio: null,
          shiftX: null,
          shiftY: null
        },
        tools: {
          currentTool: null,
          depth: false
        },
        toolsParameters: {
          depthBoxIntensity: 0,
          depthRangeIntensity: 0
        },
        parameters: {
          croppedCanvasImage: null,
          croppedeArea: null,
          pixelRange: null
        },
        operationStack: {
          rgbCanvasStack: [],
          depthCanvasStack: [],
          mainRgbStack: [],
          mainDepthCanvasStack: []
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
