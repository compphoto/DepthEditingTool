import { types } from "./constants";

const initialState = {
  rgbImageUrl: null,
  depthImageUrl: null,
  loadedRgbImage: null,
  loadedDepthImage: null,
  mainRgbCanvas: null, // use canvas to image to convert to image
  mainDepthCanvas: null, // use canvas to image to convert to image
  tempDepthCanvas: null, // global reference to depth canvas
  depthCanvaUpdate: null,
  rgbImageDimension: null,
  depthImageDimension: null,
  prevRgbSize: { width: null, height: null },
  prevDepthSize: { width: null, height: null },
  tools: {
    currentTool: null,
    depth: false
  },
  parameters: {
    croppedCanvasImage: null,
    croppedeArea: null,
    pixelRangeArray: null
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
        mainRgbCanvas: null, // use canvas to image to convert to image
        mainDepthCanvas: null, // use canvas to image to convert to image
        tempDepthCanvas: null,
        depthCanvaUpdate: null,
        rgbImageDimension: null,
        depthImageDimension: null,
        parameters: {
          croppedCanvasImage: null,
          croppedeArea: null,
          pixelRangeArray: null
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
