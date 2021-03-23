import { publicRequest } from "../../network/https";
import { urls } from "./constants";

const api = {
  getTest: () => publicRequest({ route: urls.USER })
};

export default api;
