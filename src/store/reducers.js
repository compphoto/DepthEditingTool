import { combineReducers } from "redux";
import { testReducer } from "./test";
import { toolExtReducer } from "./toolext";
import { uploadImageReducer } from "./uploadimage";

const appReducer = combineReducers({
  test: testReducer,
  toolExt: toolExtReducer,
  uploadImage: uploadImageReducer
});

const rootReducer = (state, action) => {
  if (action.type === "AUTH_FAIL") {
    return (state = undefined);
  }
  return appReducer(state, action);
};

export default rootReducer;
