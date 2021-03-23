import React from "react";
import { Route, Redirect } from "react-router";

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest}>{props => (localStorage.getItem("token") ? <Component {...props} /> : <Redirect to="/" />)}</Route>
);

export default PrivateRoute;
