import React from "react";
import { Route, Redirect } from "react-router";
import { getAccessToken } from "utils/localStorage";

const PublicRoute = ({ component: Component, restricted, ...rest }) => (
  <Route {...rest}>
    {props => (getAccessToken() && restricted ? <Redirect to={props.location} /> : <Component {...props} />)}
  </Route>
);

export default PublicRoute;
