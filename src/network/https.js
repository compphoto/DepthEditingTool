import axios from "axios";
import get from "lodash/get";
import * as lsService from "utils/localStorage";

export const BASE_URL = process.env.REACT_APP_API_URL;

axios.defaults.baseURL = BASE_URL;
const tokenExpMsg = "token_not_valid";

const publicInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  }
});

const privateInstance = axios.create({
  headers: {
    Authorization: `Bearer *token*`,
    Accept: "application/json",
    "Content-Type": "application/json"
  }
});

privateInstance.interceptors.request.use(
  config => {
    const token = lsService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

privateInstance.interceptors.response.use(
  response => {
    return response;
  },
  async function (error) {
    const status = get(error, "response.status", 0);
    const errorMessage = get(error, "response.data.code", "");
    const config = get(error, "config", {});
    if (status === 401 && config.url === `${BASE_URL}/user/token/`) {
      const store = require("store/store");
      store.default.dispatch(actions.logout());
      return Promise.reject(error);
    } else if (status === 401 && errorMessage === tokenExpMsg) {
      const refreshToken = lsService.getRefreshToken();
      return axios
        .post(`${BASE_URL}/user/token/refresh/`, {
          refresh: refreshToken
        })
        .then(res => {
          if (res.data) {
            const newToken = res.data.access;
            lsService.setAccessToken({ token: newToken });
            config.headers["Authorization"] = `Bearer ${newToken}`;
          }
          return axios(config);
        })
        .catch(({ message }) => {
          if (message.includes("401")) {
            const store = require("store/store");
            store.default.dispatch(actions.logout());
          } else {
            throw Error(message);
          }
        });
    }
    return Promise.reject(error);
  }
);

export const privateRequest = ({ method = "get", route, payload, responseType = "json" }) => {
  privateInstance.defaults.responseType = responseType;
  const requestMethod = method.toLowerCase();
  return privateInstance[requestMethod](route, payload).catch(error => Promise.reject(error));
};

export const publicRequest = ({ method = "get", route, payload, responseType = "json" }) => {
  publicInstance.defaults.responseType = responseType;
  const requestMethod = method.toLowerCase();
  return publicInstance[requestMethod](route, payload).catch(error => {
    return Promise.reject(
      error.response.data
        ? { ...error.response.data, status: error.response.status }
        : { ...error.message, status: error.status }
    );
  });
};

export default privateRequest;
