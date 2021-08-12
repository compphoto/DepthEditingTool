import React, { Suspense } from "react";
import { Switch, Route } from "react-router-dom";
import Loading from "components/Loading";
import { authRoutes } from "routes/routes-list";
const Signin = React.lazy(() => import("./pages/Signin"));

const Auth = () => (
  <Suspense fallback={<Loading />}>
    <Switch>
      <Route path={authRoutes.signIn} render={props => <Signin {...props} />} />
    </Switch>
  </Suspense>
);

export default Auth;
