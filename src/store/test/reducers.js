import { types } from "./constants";

const initialState = {
  test: 0,
  users: []
};

export const testReducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case types.TEST_SUCCESS:
      return { ...state, test: 1, users: payload };
    case types.TEST_FAILED:
      return { ...state, test: -1 };
    case types.TEST_LOADING:
      return { ...state, test: 0 };
    default: {
      return state;
    }
  }
};
