import React from "react";
import classnames from "classnames";
import { connect } from "react-redux";
import { testActions } from "store/test";
import { selectors as testSelectors } from "store/test";
import { Helmet } from "react-helmet";
import { Container, Button } from "reactstrap";
import { RiDownloadLine } from "react-icons/ri";
import { AiOutlinePlus } from "react-icons/ai";
import ImageEditorStyle from "./style";
import SidePane from "components/SidePane";
import MainPane from "components/MainPane";

export function ImageEditor({ testActions, test }) {
  return (
    <ImageEditorStyle>
      <Helmet>
        <title>RPL - Onboarding</title>
      </Helmet>
      <header>
        <Container fluid>
          <div className="nav-bar">
            <div className="nav-intro">
              <h4>Image Editor</h4>
              <Button size="sm" color="default" className="mx-5">
                <AiOutlinePlus className="mb-1" /> Open Image
              </Button>
            </div>
            <div>
              <Button size="sm" color="secondary" className="mx-3">
                Free Trial
              </Button>
              <Button size="sm" color="primary">
                <RiDownloadLine className="mb-1" /> Download
              </Button>
            </div>
          </div>
        </Container>
      </header>
      <section>
        <SidePane />
        <MainPane />
      </section>
      <footer>Computational Photography Labs SFU</footer>
    </ImageEditorStyle>
  );
}

const mapStateToProps = state => ({
  test: testSelectors.test(state)
});

const mapDispatchToProps = {
  testActions: testActions.test
};

export default connect(mapStateToProps, mapDispatchToProps)(ImageEditor);
