import { takeEvery, fork, call, put } from "redux-saga/effects";
import { types } from "./constants";
import api from "./api";

function* testSaga() {
  yield put({ type: types.TEST_LOADING });
  try {
    const result = yield call(api.getTest);
    yield put({ type: types.TEST_SUCCESS, payload: result.data });
  } catch (e) {
    yield put({ type: types.TEST_FAILED });
  }
}

function* watchTest() {
  yield takeEvery(types.TEST, testSaga);
}

export const testSagas = [fork(watchTest)];
