import { combineReducers } from "redux";
import { testReducer } from "./test";

const appReducer = combineReducers({
  test: testReducer
});

const rootReducer = (state, action) => {
  if (action.type === "AUTH_FAIL") {
    return (state = undefined);
  }
  return appReducer(state, action);
};

export default rootReducer;
