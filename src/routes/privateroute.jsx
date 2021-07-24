import React from "react";
import { Route, Redirect } from "react-router";
import { authRoutes } from "routes/routes-list";
import { getAccessToken } from "utils/localStorage";

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest}>
    {props =>
      getAccessToken() ? (
        <Component {...props} />
      ) : (
        <Redirect
          to={{
            pathname: authRoutes.signIn,
            state: { from: props.location }
          }}
        />
      )
    }
  </Route>
);

export default PrivateRoute;
