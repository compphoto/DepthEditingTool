import React from "react";
import { connect } from "react-redux";
import { imageActions } from "store/image";
import { selectors as imageSelectors } from "store/image";
import { Helmet } from "react-helmet";
import { Container, Button } from "reactstrap";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { MdOutlinePanTool, MdDoubleArrow } from "react-icons/md";
import { ImUndo2 } from "react-icons/im";
import ImageEditorStyle from "./style";
import SidePane from "components/SidePane";
import MainPane from "components/MainPane";
import UploadPane from "components/UploadPane";
import { canvasToImage } from "utils/canvasUtils";
import {} from "utils/stackOperations";

export function ImageEditor({ memoryDepthCanvas, zoomIn, zoomOut, undo, clear, reset }) {
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
            <div className="nav-button">
              <Button onClick={() => {}} size="sm" color="outline">
                <MdOutlinePanTool />
              </Button>
              <Button
                onClick={() => {
                  zoomOut();
                }}
                size="sm"
                color="outline"
              >
                <AiOutlineMinus />
              </Button>
              <Button
                onClick={() => {
                  zoomIn();
                }}
                size="sm"
                color="outline"
              >
                <AiOutlinePlus />
              </Button>
              <Button
                onClick={() => {
                  undo();
                }}
                size="sm"
                color="outline"
              >
                <ImUndo2 />
              </Button>
              <Button
                onClick={() => {
                  clear();
                }}
                size="sm"
                color="secondary"
              >
                Clear
              </Button>
              <Button
                onClick={() => {
                  reset();
                }}
                size="sm"
                color="secondary"
                className="mx-3"
              >
                Reset
              </Button>
              <Button
                onClick={() => {
                  let image = canvasToImage(memoryDepthCanvas);
                  window.location.href = image;
                }}
                disabled={memoryDepthCanvas === null}
                size="sm"
                color="primary"
              >
                Download
              </Button>
            </div>
          </div>
        </Container>
      </header>
      <section>
        <SidePane />
        <MainPane />
        <UploadPane />
      </section>
      <footer>
        <div>Computational Photography Labs SFU</div>
        <div className="btn btn-default">
          <MdDoubleArrow className="mb-1" /> Import
        </div>
      </footer>
    </ImageEditorStyle>
  );
}

const mapStateToProps = state => ({
  memoryDepthCanvas: imageSelectors.memoryDepthCanvas(state)
});

const mapDispatchToProps = {
  zoomIn: imageActions.zoomIn,
  zoomOut: imageActions.zoomOut,
  undo: imageActions.undo,
  clear: imageActions.clear,
  reset: imageActions.reset
};

export default connect(mapStateToProps, mapDispatchToProps)(ImageEditor);
