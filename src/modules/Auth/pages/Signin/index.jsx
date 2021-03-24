import React from "react";
import { Helmet } from "react-helmet";
import SigninStyle from "./style";

export function Signin() {
  return (
    <SigninStyle>
      <Helmet>
        <title>Sign in</title>
      </Helmet>
      <h1>Sign In</h1>
    </SigninStyle>
  );
}

export default Signin;
