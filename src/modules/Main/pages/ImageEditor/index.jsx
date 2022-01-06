import React from "react";
import { connect } from "react-redux";
import { imageActions } from "store/image";
import { selectors as imageSelectors } from "store/image";
import { Helmet } from "react-helmet";
import { Container, Button } from "reactstrap";
import { RiDownloadLine } from "react-icons/ri";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { ImUndo2 } from "react-icons/im";
import ImageEditorStyle from "./style";
import SidePane from "components/SidePane";
import MainPane from "components/MainPane";
import { cloneCanvas, canvasToImage, getRatio, drawScaledCanvasImage } from "utils/canvasUtils";

export function ImageEditor({
  mainDepthCanvas,
  tempDepthCanvas,
  parameters,
  initImage,
  storeParameters,
  addOperation,
  undo,
  clear,
  reset
}) {
  const { scale, scaleMultiplier, translatePos } = parameters.canvasParams;
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
              <Button
                onClick={() => {
                  let { ratio, centerShift_x, centerShift_y } = getRatio(mainDepthCanvas, tempDepthCanvas);
                  addOperation({
                    name: "moveStack",
                    value: {
                      func: drawScaledCanvasImage,
                      params: [
                        tempDepthCanvas,
                        ratio,
                        centerShift_x,
                        centerShift_y,
                        scale * scaleMultiplier,
                        translatePos
                      ]
                    }
                  });
                  storeParameters({
                    canvasParams: {
                      ...parameters.canvasParams,
                      scale: scale * scaleMultiplier
                    }
                  });
                }}
                size="sm"
                color="outline"
              >
                <AiOutlineMinus />
              </Button>
              <Button
                onClick={() => {
                  let { ratio, centerShift_x, centerShift_y } = getRatio(mainDepthCanvas, tempDepthCanvas);
                  addOperation({
                    name: "moveStack",
                    value: {
                      func: drawScaledCanvasImage,
                      params: [
                        tempDepthCanvas,
                        ratio,
                        centerShift_x,
                        centerShift_y,
                        scale / scaleMultiplier,
                        translatePos
                      ]
                    }
                  });
                  storeParameters({
                    canvasParams: {
                      ...parameters.canvasParams,
                      scale: scale / scaleMultiplier
                    }
                  });
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
                className="mx-3"
              >
                Clear
              </Button>
              <Button
                onClick={() => {
                  reset();
                }}
                size="sm"
                color="secondary"
              >
                Reset
              </Button>
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
                  let image = canvasToImage(tempDepthCanvas);
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
  tempDepthCanvas: imageSelectors.tempDepthCanvas(state),
  parameters: imageSelectors.parameters(state)
});

const mapDispatchToProps = {
  initImage: imageActions.initImage,
  storeParameters: imageActions.storeParameters,
  addOperation: imageActions.addOperation,
  undo: imageActions.undo,
  clear: imageActions.clear,
  reset: imageActions.reset
};

export default connect(mapStateToProps, mapDispatchToProps)(ImageEditor);
