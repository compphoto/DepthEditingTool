import { types } from "./constants";

const initialState = {
  darkMode: false
};

export const themeReducer = (state = initialState, { type }) => {
  switch (type) {
    case types.TOGGLE_DARK_MODE:
      return { ...state, darkMode: !state.darkMode };
    default: {
      return state;
    }
  }
};
