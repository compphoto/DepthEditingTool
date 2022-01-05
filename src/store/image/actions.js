import { types } from "./constants";

export const imageActions = {
  handleChange: e => ({ type: types.HANDLE_CHANGE, payload: e.target }),
  initImage: payload => ({ type: types.INIT_IMAGE, payload: payload }),
  selectTool: payload => ({ type: types.SELECT_TOOL, payload: payload }),
  storeToolParameters: payload => ({ type: types.STORE_TOOL_PARAMETERS, payload: payload }),
  storeParameters: payload => ({ type: types.STORE_PARAMETERS, payload: payload }),
  addLayer: () => ({ type: types.ADD_LAYER }),
  addOperation: payload => ({ type: types.ADD_OPERATION, payload: payload }),
  removeOperation: payload => ({ type: types.REMOVE_OPERATION, payload: payload }),
  addEffect: payload => ({ type: types.ADD_EFFECT, payload: payload }),
  undo: () => ({ type: types.UNDO }),
  clear: () => ({ type: types.CLEAR }),
  reset: () => ({ type: types.RESET }),
  removeItem: name => ({ type: types.REMOVE_ITEM, payload: name }),
  removeAllItem: () => ({ type: types.REMOVE_ALL_ITEM })
};
