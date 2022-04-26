import { takeLatest, fork, call, put } from "redux-saga/effects";
import { types } from "./constants";
import api from "./api";

function* djangoSaga({ payload }) {
  yield put({ type: types.GET_GROUND_LOADING });
  try {
    const result = yield call(api.getGround, payload);
    yield put({ type: types.GET_GROUND_SUCCESS, payload: result.data });
  } catch (e) {
    yield put({ type: types.GET_GROUND_FAILED });
  }
}

function* watchDjango() {
  yield takeLatest(types.GET_GROUND, djangoSaga);
}

export const djangoSagas = [fork(watchDjango)];
