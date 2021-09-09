import React, { Suspense } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { routes } from "routes/routes-list";
import Loading from "components/Loading";

const ImageEditor = React.lazy(() => import("./pages/ImageEditor"));

const Main = () => (
  <Suspense fallback={<Loading />}>
    <Switch>
      <Route path={routes.imageEditor} exact render={props => <ImageEditor {...props} />} />
      <Redirect to={routes.imageEditor} />
    </Switch>
  </Suspense>
);

export default Main;
