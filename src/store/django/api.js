import { publicRequest } from "../../network/https";
import { urls } from "./constants";

const api = {
  getGround: payload =>
    publicRequest({ method: "post", route: urls.estimate, payload: payload, responseType: "arraybuffer" })
};

export default api;
