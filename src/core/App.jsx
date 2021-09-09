import React, { Component, Suspense } from "react";
import { Route, Router as BrowserRouter, Switch, Redirect } from "react-router-dom";
import history from "routes/history";
import { defaultRoute } from "routes/routes-list";
import Error from "components/Error";
import Loading from "components/Loading";
import Main from "modules/Main";
import GlobalStyles from "./Global";

class App extends Component {
  state = {
    noInternetConnection: false,
    windowWidth: window.innerWidth
  };
  componentDidMount() {
    this.handleResize();
    this.handleInternetConnectionChange();
    window.addEventListener("online", this.handleInternetConnectionChange);
    window.addEventListener("offline", this.handleInternetConnectionChange);
    window.addEventListener("resize", this.handleResize);
  }
  componentWillUnmount() {
    window.removeEventListener("online", this.handleInternetConnectionChange);
    window.removeEventListener("offline", this.handleInternetConnectionChange);
    window.removeEventListener("resize", this.handleResize);
  }
  handleInternetConnectionChange = () => {
    navigator.onLine ? this.setState({ noInternetConnection: false }) : this.setState({ noInternetConnection: true });
  };
  handleResize = () => {
    this.setState({ ...this.state, windowWidth: window.innerWidth });
  };
  render() {
    const { noInternetConnection, windowWidth } = this.state;
    if (noInternetConnection) {
      return <Error text="No Internet Connnection" />;
    }
    if (windowWidth < 880) {
      return (
        <div className="ren-no-mobile-wrapper">
          <div className="ren-no-mobile-content">
            <h4>This screen size is not supported</h4>
            <p>Please switch to your laptop or desktop to use the image editor</p>
          </div>
        </div>
      );
    }
    return (
      <>
        <GlobalStyles />
        <Suspense fallback={<Loading />}>
          <BrowserRouter history={history}>
            <Switch>
              <Route path={[defaultRoute]} component={Main} />
              <Redirect to={defaultRoute} />
            </Switch>
          </BrowserRouter>
        </Suspense>
      </>
    );
  }
}

export default App;
