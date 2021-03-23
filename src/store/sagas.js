import { all } from "redux-saga/effects";
import { authSagas } from "./auth";
import { testSagas } from "./test";

export default function* sagas() {
  yield all([...authSagas]);
  yield all([...testSagas]);
}
