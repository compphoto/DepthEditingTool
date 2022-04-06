import { types } from "./constants";

export const djangoActions = {
  getGround: payload => ({ type: types.GET_GROUND, payload: payload })
};
