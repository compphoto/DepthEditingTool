import { types } from "./constants";

export const imageActions = {
  handleChange: e => ({ type: types.HANDLE_CHANGE, payload: e.target }),
  initImage: payload => ({ type: types.INIT_IMAGE, payload: payload }),
  selectTool: payload => ({ type: types.SELECT_TOOL, payload: payload }),
  storeToolParameters: payload => ({ type: types.STORE_TOOL_PARAMETERS, payload: payload }),
  storeParameters: payload => ({ type: types.STORE_PARAMETERS, payload: payload }),
  addOperation: payload => ({ type: types.ADD_OPERATION, payload: payload }),
  removeItem: name => ({ type: types.REMOVE_ITEM, payload: name }),
  removeAllItem: () => ({ type: types.REMOVE_ALL_ITEM })
};
