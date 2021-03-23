import { combineReducers } from "redux";
import { authReducer } from "./auth";
import { testReducer } from "./test";
import { themeReducer } from "./theme";

const appReducer = combineReducers({
  auth: authReducer,
  test: testReducer,
  theme: themeReducer
});

const rootReducer = (state, action) => {
  if (action.type === "AUTH_FAIL") {
    return (state = undefined);
  }
  return appReducer(state, action);
};

export default rootReducer;
