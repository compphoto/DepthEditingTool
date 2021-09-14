import React from "react";
import { Helmet } from "react-helmet";
import { Container, Button } from "reactstrap";
import { RiDownloadLine } from "react-icons/ri";
import ImageEditorStyle from "./style";
import SidePane from "components/SidePane";
import MainPane from "components/MainPane";

export function ImageEditor() {
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
              <Button size="sm" color="secondary" className="mx-3">
                GitHub
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

export default ImageEditor;
