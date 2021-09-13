import React from "react";
import { connect } from "react-redux";
import { selectors as toolExtSelectors } from "store/toolext";
import MainPaneStyle from "./style";
import TestImage from "assets/images/jpg/logo.jpeg";

export function MainPane({ toolExtOpen }) {
  return (
    <MainPaneStyle>
      <div className={toolExtOpen ? "main main-shrink" : "main main-expand"}>
        <img src={TestImage} />
      </div>
    </MainPaneStyle>
  );
}

const mapStateToProps = state => ({
  toolExtOpen: toolExtSelectors.toolExtOpen(state)
});

export default connect(mapStateToProps, null)(MainPane);
