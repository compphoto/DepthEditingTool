import React, { Component, Suspense } from "react";
import { Router, Switch, Redirect } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { connect } from "react-redux";
import { lightTheme, darkTheme } from "theme";
import { selectors as themeSelectors } from "store/theme";
import history from "routes/history";
import { authRoutes } from "routes/routes-list";
import PublicRoute from "routes/publicroute";
import Error from "components/Error";
import Loading from "components/Loading";
import Authorization from "modules/Auth";
import Main from "modules/Main";
import GlobalStyles from "./Global";

class App extends Component {
  state = {
    noInternetConnection: false
  };
  componentDidMount() {
    this.handleInternetConnectionChange();
    window.addEventListener("online", this.handleInternetConnectionChange);
    window.addEventListener("offline", this.handleInternetConnectionChange);
  }
  handleInternetConnectionChange = () => {
    navigator.onLine ? this.setState({ noInternetConnection: false }) : this.setState({ noInternetConnection: true });
  };
  render() {
    const { noInternetConnection } = this.state;
    const { darkMode } = this.props;
    if (noInternetConnection) {
      return <Error text="No Internet Connnection" />;
    }
    return (
      <ThemeProvider theme={darkMode === false ? lightTheme : darkTheme}>
        <GlobalStyles />
        <Suspense fallback={<Loading />}>
          <Router history={history}>
            <Switch>
              <PublicRoute restricted path={[authRoutes.signIn]} exact component={Authorization} />
              <PublicRoute restricted path="/" component={Main} />
              <Redirect to={authRoutes.signIn} />
            </Switch>
          </Router>
        </Suspense>
      </ThemeProvider>
    );
  }
}

const mapStateToProps = state => ({
  darkMode: themeSelectors.theme(state)
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(App);
