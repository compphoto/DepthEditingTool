import React from "react";
import { connect } from "react-redux";
import { selectors as toolExtSelectors } from "store/toolext";
import MainPaneStyle from "./style";

export function MainPane({ toolExtOpen }) {
  return (
    <MainPaneStyle>
      <div className={toolExtOpen ? "main-shrink" : "main-expand"}>
        <h1>TEST</h1>
      </div>
    </MainPaneStyle>
  );
}

const mapStateToProps = state => ({
  toolExtOpen: toolExtSelectors.toolExtOpen(state)
});

export default connect(mapStateToProps, null)(MainPane);
