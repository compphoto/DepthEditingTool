import React from "react";
import { Route, Redirect } from "react-router";

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest}>
    {props =>
      localStorage.getItem("token") ? (
        <Component {...props} />
      ) : (
        <Redirect
          to={{
            pathname: "/sign-in",
            state: { from: props.location }
          }}
        />
      )
    }
  </Route>
);

export default PrivateRoute;
