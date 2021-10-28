import { types } from "./constants";

const initialState = {
  rgbImage: null,
  depthImage: null
};

export const uploadImageReducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case types.HANDLE_CHANGE:
      return {
        ...state,
        [payload.name]: payload.files[0]
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
