import { combineReducers } from "redux";
import { djangoReducer } from "./django";
import { toolExtReducer } from "./toolext";
import { imageReducer } from "./image";

const appReducer = combineReducers({
  django: djangoReducer,
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
