import axios from "axios";
export const BASE_URL = process.env.REACT_APP_API_URL;

axios.defaults.baseURL = BASE_URL;

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
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // config.onUploadProgress = progressEvent => {
      //   const store = require("store/store");
      //   var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      //   console.log(percentCompleted);
      //   store.default.dispatch(getUploadPercentage(percentCompleted));
      // };
    }
    return config;
  },
  error => Promise.reject(error)
);

export const privateRequest = ({ method = "get", route, payload, responseType = "json" }) => {
  privateInstance.defaults.responseType = responseType;
  const requestMethod = method.toLowerCase();
  return privateInstance[requestMethod](route, payload).catch(error => Promise.reject(error));
};

export const publicRequest = ({ method = "get", route, payload, responseType = "json" }) => {
  publicInstance.defaults.responseType = responseType;
  const requestMethod = method.toLowerCase();
  return publicInstance[requestMethod](route, payload).catch(error =>
    Promise.reject(error.response ? error.response.data : error.message)
  );
};
