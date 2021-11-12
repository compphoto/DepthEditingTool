import React from "react";
import { connect } from "react-redux";
import { imageActions } from "store/image";
import { selectors as imageSelectors } from "store/image";
import { Helmet } from "react-helmet";
import { Container, Button } from "reactstrap";
import { RiDownloadLine } from "react-icons/ri";
import ImageEditorStyle from "./style";
import SidePane from "components/SidePane";
import MainPane from "components/MainPane";
import { cloneCanvas, canvasToImage } from "utils/canvasUtils";

export function ImageEditor({ mainDepthCanvas, tempDepthCanvas, initImage }) {
  return (
    <ImageEditorStyle>
      <Helmet>
        <title>Image Editor</title>
      </Helmet>
      <header>
        <Container fluid>
          <div className="nav-bar">
            <div className="nav-intro">
              <h4>Image Editor</h4>
            </div>
            <div>
              <Button
                onClick={() => {
                  initImage({ mainDepthCanvas: cloneCanvas(tempDepthCanvas) });
                }}
                size="sm"
                color="secondary"
                className="mx-3"
              >
                Save
              </Button>
              <Button
                onClick={() => {
                  let image = canvasToImage(mainDepthCanvas);
                  window.location.href = image;
                }}
                size="sm"
                color="primary"
              >
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
  mainDepthCanvas: imageSelectors.mainDepthCanvas(state),
  tempDepthCanvas: imageSelectors.tempDepthCanvas(state)
});

const mapDispatchToProps = {
  initImage: imageActions.initImage
};

export default connect(mapStateToProps, mapDispatchToProps)(ImageEditor);
