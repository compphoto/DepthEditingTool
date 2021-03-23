export const emailValidation = email => {
  if (/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)) {
    return { status: true, message: "" };
  }
  if (email.trim() === "") {
    return { status: false, message: "Email cannot be empty" };
  }
  return { status: false, message: "Invalid Email" };
};

export const passwordValidation = pass => {
  if (pass.trim() === "") {
    return { status: false, message: "Password cannot be empty" };
  }
  return { status: true, message: "" };
};
