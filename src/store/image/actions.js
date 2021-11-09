import { types } from "./constants";

export const imageActions = {
  handleChange: e => ({ type: types.HANDLE_CHANGE, payload: e.target }),
  setThreeDepthImage: img => ({ type: types.SET_THREE_DEPTH_IMAGE, payload: img }),
  removeItem: name => ({ type: types.REMOVE_ITEM, payload: name }),
  removeAllItem: () => ({ type: types.REMOVE_ALL_ITEM })
};
