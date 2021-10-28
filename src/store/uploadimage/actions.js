import { types } from "./constants";

export const uploadImageActions = {
  handleChange: e => ({ type: types.HANDLE_CHANGE, payload: e.target }),
  removeItem: name => ({ type: types.REMOVE_ITEM, payload: name }),
  removeAllItem: () => ({ type: types.REMOVE_ALL_ITEM })
};
