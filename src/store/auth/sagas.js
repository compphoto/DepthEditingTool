import api from "./api";
import { types } from "./constants";
import { call, put, takeLatest, fork } from "redux-saga/effects";
import history from "routes/history";
import { privateRoutes } from "routes/routes-list";

function* login({ email, password }) {
  try {
    const { data } = yield call(api.login, { email, password });
    yield put({ type: types.AUTH_SUCCESS });
    yield history.push(privateRoutes.test);
  } catch (error) {
    yield put({ type: types.AUTH_FAIL });
  }
}

function* logout() {
  try {
    yield put({ type: types.AUTH_FAIL });
  } catch (error) {
    console.error(error);
  }
}

function* getUser() {
  try {
    const { data } = yield call(api.getUser);
    yield put({ type: types.SET_USER, payload: data });
  } catch (error) {
    console.error(error);
  }
}

function* watchAuth() {
  yield takeLatest(types.LOGIN, login);
  yield takeLatest(types.LOGOUT, logout);
  yield takeLatest(types.GET_USER, getUser);
}

export const authSagas = [fork(watchAuth)];
