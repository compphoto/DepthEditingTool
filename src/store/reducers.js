import { combineReducers } from "redux";
import { testReducer } from "./test";
import { toolExtReducer } from "./toolext";

const appReducer = combineReducers({
  test: testReducer,
  toolExt: toolExtReducer
});

const rootReducer = (state, action) => {
  if (action.type === "AUTH_FAIL") {
    return (state = undefined);
  }
  return appReducer(state, action);
};

export default rootReducer;
