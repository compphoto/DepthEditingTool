import { types } from "./constants";

export const imageActions = {
  handleChange: e => ({ type: types.HANDLE_CHANGE, payload: e.target }),
  initImage: payload => ({ type: types.INIT_IMAGE, payload: payload }),
  initRgb: payload => ({ type: types.INIT_RGB, payload: payload }),
  initDepth: payload => ({ type: types.INIT_DEPTH, payload: payload }),
  selectTool: payload => ({ type: types.SELECT_TOOL, payload: payload }),
  storeScaleParams: payload => ({ type: types.STORE_SCALE_PARAMS, payload: payload }),
  storeToolParameters: payload => ({ type: types.STORE_TOOL_PARAMETERS, payload: payload }),
  storeParameters: payload => ({ type: types.STORE_PARAMETERS, payload: payload }),
  toggleLayerMode: () => ({ type: types.TOGGLE_LAYER_MODE }),
  addLayer: () => ({ type: types.ADD_LAYER }),
  updateLayer: layer => ({ type: types.UPDATE_LAYER, payload: layer }),
  removeLayer: key => ({ type: types.REMOVE_LAYER, payload: key }),
  removeAllLayers: () => ({ type: types.REMOVE_ALL_LAYER }),
  addOperation: payload => ({ type: types.ADD_OPERATION, payload: payload }),
  removeOperation: payload => ({ type: types.REMOVE_OPERATION, payload: payload }),
  addEffect: payload => ({ type: types.ADD_EFFECT, payload: payload }),
  zoomIn: () => ({ type: types.ZOOM_IN }),
  zoomOut: () => ({ type: types.ZOOM_OUT }),
  undo: () => ({ type: types.UNDO }),
  clear: () => ({ type: types.CLEAR }),
  reset: () => ({ type: types.RESET }),
  removeItem: name => ({ type: types.REMOVE_ITEM, payload: name }),
  removeAllItem: () => ({ type: types.REMOVE_ALL_ITEM })
};
