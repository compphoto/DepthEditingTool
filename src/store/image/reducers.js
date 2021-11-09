import { types } from "./constants";

const initialState = {
  rgbImage: null,
  depthImage: null,
  threeDepthImage: null
};

export const imageReducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case types.HANDLE_CHANGE:
      return {
        ...state,
        [payload.name]: payload.files[0]
      };
    case types.SET_THREE_DEPTH_IMAGE:
      return {
        ...state,
        threeDepthImage: payload
      };
    case types.REMOVE_ITEM:
      return {
        ...state,
        [payload]: null
      };
    case types.REMOVE_ALL_ITEM:
      return {
        ...state,
        rgbImage: null,
        depthImage: null
      };
    default: {
      return state;
    }
  }
};
