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
    tempRgbStack: [],
    tempDepthStack: []
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
      const { name, value } = payload;
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
          [name]: [...state.operationStack[name], value]
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
        mainRgbCanvas: null, // use canvas to image to convert to image
        mainDepthCanvas: null, // use canvas to image to convert to image
        tempRgbCanvas: null, // global reference to depth canvas
        tempDepthCanvas: null, // global reference to depth canvas
        prevRgbSize: { width: null, height: null },
        prevDepthSize: { width: null, height: null },
        rgbCanvasDimension: null,
        depthCanvasDimension: null,
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
          tempRgbStack: [],
          tempDepthStack: []
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
