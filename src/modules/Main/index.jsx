import React, { Suspense } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { privateRoutes } from "routes/routes-list";
import Loading from "components/Loading";
const TestPage = React.lazy(() => import("./pages/TestPage"));

const Main = () => (
  <Suspense fallback={<Loading />}>
    <Switch>
      <Route path={privateRoutes.test} render={props => <TestPage {...props} />} />
      <Redirect to={privateRoutes.test} />
    </Switch>
  </Suspense>
);

export default Main;
