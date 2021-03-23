import { types } from "./constants";

const initialState = {
  isAuthorized: false,
  user: null
};

export const authReducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case types.AUTH_SUCCESS:
      return { ...state, isAuthorized: true };
    case types.AUTH_FAIL:
      return { ...state, isAuthorized: false };
    case types.SET_USER:
      return { ...state, user: { ...payload } };
    default: {
      return state;
    }
  }
};
