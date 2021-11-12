import { types } from "./constants";

const initialState = {
  rgbImageUrl: null,
  depthImageUrl: null,
  loadedRgbImage: null,
  loadedDepthImage: null,
  mainDepthCanvas: null, // use canvas to image to convert to image
  rgbImageDimension: [0, 0, 0, 0],
  depthImageDimension: [0, 0, 0, 0],
  prevRgbSize: { width: null, height: null },
  prevDepthSize: { width: null, height: null },
  tools: {
    currentTool: null,
    depth: false
  },
  parameters: {
    croppedCanvasImage: null,
    croppedeArea: [0, 0, 0, 0]
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
      let newTools = prevTool
        ? {
            ...state.tools,
            currentTool: payload,
            [payload]: true,
            [currentTool]: false
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
    case types.STORE_PARAMETERS:
      return {
        ...state,
        parameters: {
          ...state.parameters,
          ...payload
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
        mainDepthCanvas: null, // use canvas to image to convert to image
        rgbImageDimension: [0, 0, 0, 0],
        depthImageDimension: [0, 0, 0, 0],
        tools: {
          currentTool: null,
          depth: false
        },
        parameters: {
          croppedCanvasImage: null,
          croppedeArea: [0, 0, 0, 0]
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
