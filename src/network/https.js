import axios from "axios";
export const BASE_URL = process.env.REACT_APP_API_URL;

axios.defaults.baseURL = BASE_URL;

const publicInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "multipart/form-data"
  }
});

export const publicRequest = ({ method = "get", route, payload, responseType = "json" }) => {
  publicInstance.defaults.responseType = responseType;
  const requestMethod = method.toLowerCase();
  return publicInstance[requestMethod](route, payload).catch(error =>
    Promise.reject(error.response ? error.response.data : error.message)
  );
};
