import { defaultRoute } from "routes/routes-list";
import history from "routes/history";

export const manipulateStorageData = (data, rememberUser) => {
  if (data) {
    const { access, refresh } = data;
    // "storage" based on Login "Remember me" checkbox: true => localStorage, false => sessionStorage
    const typeMemo = rememberUser ? localStorage : sessionStorage;
    if (access && refresh) {
      setAccessToken({ token: access, storage: typeMemo });
      setRefreshToken({ token: refresh, storage: typeMemo });
    }
  } else {
    const userData = sessionStorage.getItem(key) || localStorage.getItem(key);
    try {
      return userData ? JSON.parse(userData) : null;
    } catch (e) {
      return null;
    }
  }
};
export const setAccessToken = ({ token, storage }) => {
  if (storage) {
    storage.setItem(`accessToken`, token);
    return;
  }
  // "currentStorage" based on current storage location
  const currentStorage = defineStorageLocation("localStorage") ? localStorage : sessionStorage;
  currentStorage.setItem(`accessToken`, token);
};
export const getAccessToken = () => sessionStorage.getItem(`accessToken`) || localStorage.getItem(`accessToken`) || "";
export const setRefreshToken = ({ token, storage }) => {
  storage.setItem(`refreshToken`, token);
};
export const getRefreshToken = () =>
  sessionStorage.getItem(`refreshToken`) || localStorage.getItem(`refreshToken`) || "";

export const defineStorageLocation = key => {
  const token = sessionStorage.accessToken;
  const storage = token ? "sessionStorage" : "localStorage";
  return storage === key;
};
export const clear = path => {
  localStorage.clear();
  sessionStorage.clear();
  if (!path) {
    path = defaultRoute;
  }
  history.push(`${path}`);
};
