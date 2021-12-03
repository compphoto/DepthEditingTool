import { combineReducers } from "redux";
import { testReducer } from "./test";
import { toolExtReducer } from "./toolext";
import { imageReducer } from "./image";

const appReducer = combineReducers({
  test: testReducer,
  toolExt: toolExtReducer,
  image: imageReducer
});

const rootReducer = (state, action) => {
  if (action.type === "AUTH_FAIL") {
    return (state = undefined);
  }
  return appReducer(state, action);
};

export default rootReducer;
