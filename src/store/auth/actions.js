import { types } from "./constants";

export const authActions = {
  login: payload => ({ type: types.LOGIN, ...payload }),
  logout: () => ({ type: types.LOGOUT }),
  getUser: payload => ({ type: types.GET_USER, ...payload })
};
