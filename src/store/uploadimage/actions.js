import { types } from "./constants";

export const uploadImageActions = {
  handleChange: e => ({ type: types.HANDLE_CHANGE, payload: e.target.files }),
  removeItem: key => ({ type: types.REMOVE_ITEM, payload: key }),
  removeAllItem: () => ({ type: types.REMOVE_ALL_ITEM }),
  selectActiveImage: key => ({ type: types.SELECT_ACTIVE_IMAGE, payload: key })
};
