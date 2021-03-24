import React from "react";
import { connect } from "react-redux";
import { testActions } from "store/test";
import { selectors as testSelectors } from "store/test";
import { themeActions } from "store/theme";
import { Helmet } from "react-helmet";
import TestPageStyle from "./style";

export function TestPage({ testActions, toggleDarkMode, test, users }) {
  return (
    <TestPageStyle>
      <Helmet>
        <title>RPL - Onboarding</title>
      </Helmet>
      <header>
        <button onClick={toggleDarkMode}>Toggle Mode</button>
      </header>
      <section>
        <h1>
          Welcome to <code>Main</code>.
        </h1>
        <h3 className="App-link" onClick={() => testActions}>
          Test API Connection
        </h3>
        <button onClick={testActions}>TEST</button>
        <p>{test === 1 ? "WORKED!" : test === -1 ? "FAILED" : ""}</p>
      </section>
    </TestPageStyle>
  );
}

const mapStateToProps = state => ({
  test: testSelectors.test(state),
  users: testSelectors.users(state)
});

const mapDispatchToProps = {
  testActions: testActions.test,
  toggleDarkMode: themeActions.toggleDarkMode
};

export default connect(mapStateToProps, mapDispatchToProps)(TestPage);
