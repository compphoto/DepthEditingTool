import { useState, useEffect } from "react";

export const emailValidation = email => {
  if (/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)) {
    return null;
  }
  if (email.trim() === "") {
    return "Email is required";
  }
  return "Please enter a valid email";
};

export const passwordValidation = pass => {
  if (pass.trim() === "") {
    return "Password is required";
  }
  return null;
};

export const passwordChecklistValidation = ({ newPassword = "", confirmPassword = "" }) => {
  const [validLength, setValidLength] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [specialChar, setSpecialChar] = useState(false);
  const [match, setMatch] = useState(false);

  useEffect(() => {
    setValidLength(newPassword.length >= 9 ? true : false);
    setHasNumber(/\d/.test(newPassword));
    setSpecialChar(/[ `!@#$%^&*()_+\-=\]{};':"\\|,.<>?~]/.test(newPassword));
    setMatch(newPassword && newPassword === confirmPassword);
  }, [newPassword, confirmPassword]);

  return [validLength, hasNumber, match, specialChar];
};
