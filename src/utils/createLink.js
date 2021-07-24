const createLink = ({ url, params }) => {
  if (!url) {
    return "";
  }
  if (typeof params === "object") {
    let newUrl = url;
    for (let key in params) {
      const subStr = newUrl.includes(`:${key}?`) ? `:${key}?` : `:${key}`;

      newUrl = newUrl.replace(subStr, params[key]);
    }
    return newUrl;
  }
  return "";
};

export default createLink;
