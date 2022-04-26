import { types } from "./constants";

const initialState = {
  groundImage: null,
  rectangle: null,
  isLoading: false
};

export const djangoReducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case types.SET_RECTANGLE:
      return { ...state, rectangle: payload };
    case types.GET_GROUND_SUCCESS:
      return { ...state, groundImage: payload, isLoading: false };
    case types.GET_GROUND_FAILED:
      return { ...state, groundImage: null, isLoading: false };
    case types.GET_GROUND_LOADING:
      return { ...state, isLoading: true };
    default: {
      return state;
    }
  }
};
