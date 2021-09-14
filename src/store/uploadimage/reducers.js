import { types } from "./constants";

const initialState = {
  files: [],
  activeImage: null
};

export const uploadImageReducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case types.HANDLE_CHANGE:
      return {
        ...state,
        files: [...state.files].concat(Object.values(payload)),
        activeImage: [...state.files].concat(Object.values(payload)).length ? 0 : null
      };
    case types.REMOVE_ITEM:
      let newFiles = [...state.files.slice(0, payload), ...state.files.slice(payload + 1)];
      return {
        ...state,
        files: newFiles,
        activeImage: newFiles.length
          ? payload === state.activeImage
            ? state.activeImage - 1
            : state.activeImage
          : null
      };
    case types.SELECT_ACTIVE_IMAGE:
      return {
        ...state,
        activeImage: payload
      };
    case types.REMOVE_ALL_ITEM:
      return {
        ...state,
        files: [],
        activeImage: null
      };
    default: {
      return state;
    }
  }
};
