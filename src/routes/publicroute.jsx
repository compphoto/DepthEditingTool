import React from "react";
import { Route, Redirect } from "react-router";

const PublicRoute = ({ component: Component, restricted, ...rest }) => (
  <Route {...rest}>
    {props =>
      localStorage.getItem("token") && restricted ? <Redirect to={props.location} /> : <Component {...props} />
    }
  </Route>
);

export default PublicRoute;
