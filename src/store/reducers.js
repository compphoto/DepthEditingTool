import { combineReducers } from "redux";
import { toolExtReducer } from "./toolext";
import { imageReducer } from "./image";

const appReducer = combineReducers({
  toolExt: toolExtReducer,
  image: imageReducer
});

const rootReducer = (state, action) => {
  return appReducer(state, action);
};

export default rootReducer;
