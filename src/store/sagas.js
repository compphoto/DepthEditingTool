import { all } from "redux-saga/effects";
import { djangoSagas } from "./django";

export default function* sagas() {
  yield all([...djangoSagas]);
}
