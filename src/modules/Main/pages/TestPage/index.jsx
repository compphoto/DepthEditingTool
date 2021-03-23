import React from "react";
import { testActions } from "store/test";
import { connect } from "react-redux";
import { selectors as testSelectors } from "store/test";
import { themeActions } from "store/theme";
import { Helmet } from "react-helmet";

export function TestPage({ testActions, toggleDarkMode, test }) {
  return (
    <div className="App">
      <Helmet>
        <title>RPL - Onboarding</title>
      </Helmet>
      <button onClick={toggleDarkMode}>Toggle Mode</button>
      <header>
        <p>
          Welcome to <code>Onboarding</code> edit and save to reload.
        </p>
        <p className="App-link" onClick={() => testActions}>
          Test API Connection
        </p>
        {test ? <p>WORKED!</p> : null}
      </header>
    </div>
  );
}

const mapStateToProps = state => ({
  test: testSelectors.test(state)
});

const mapDispatchToProps = {
  testActions: testActions.test,
  toggleDarkMode: themeActions.toggleDarkMode
};

export default connect(mapStateToProps, mapDispatchToProps)(TestPage);
