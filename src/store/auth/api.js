import { publicRequest, privateRequest } from "network/https";
import { urls } from "./constants";

const api = {
  login: payload => publicRequest({ route: urls.LOGIN, method: "post", payload }),
  getUser: () => privateRequest({ route: urls.USER_PROFILE })
};

export default api;
