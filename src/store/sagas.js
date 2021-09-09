import { all } from "redux-saga/effects";
import { testSagas } from "./test";

export default function* sagas() {
  yield all([...testSagas]);
}
