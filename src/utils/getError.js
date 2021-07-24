export const getFormsError = error => {
  if (error?.response?.data?.non_field_errors) {
    return error?.response?.data?.non_field_errors;
  } else if (error?.response?.data?.messages) {
    return error?.response?.data?.messages;
  } else {
    return error?.response?.data;
  }
};

const getError = (error, key) => {
  if (error?.messages) {
    return error.messages;
  } else if (error.response?.data?.messages) {
    return error.response.data.messages;
  } else if (error.detail) {
    return [error.detail];
  } else if (error[key]) {
    return [error[key]];
  } else {
    return [error.status];
  }
};

export default getError;
