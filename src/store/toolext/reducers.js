import { types } from "./constants";

const initialState = {
  toolExtOpen: true
};

export const toolExtReducer = (state = initialState, { type }) => {
  switch (type) {
    case types.TOGGLE_TOOL_EXT:
      return { ...state, toolExtOpen: !state.toolExtOpen };
    default: {
      return state;
    }
  }
};
