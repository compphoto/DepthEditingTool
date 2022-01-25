import styled from "styled-components";
// #2b2c2f

const ImageEditorStyle = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  header {
    height: 56px;
    background-color: #1e1f22;
    color: #fff;
    padding: 10px 15px;
    display: flex;
    align-items: center;
    .nav-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .nav-intro {
        display: flex;
        h4 {
          margin: 0;
        }
      }
      .nav-button {
        svg {
          color: #7e838e;
          &:hover {
            color: #fff;
          }
        }
      }
    }
  }
  section {
    height: calc(100vh - 90px);
    display: flex;
  }
  footer {
    height: 34px;
    background-color: #333334;
    color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .layer-mode-toggle {
      z-index: 10;
      height: 100%;
      width: 200px;
      color: #7e838e;
      background-color: #333334;
      font-size: 0.8rem;
      margin: 0;
      svg {
        height: 1rem;
        width: 1rem;
      }
      .toggle-up {
        transform: rotate(-90deg);
      }
      .toggle-down {
        transform: rotate(90deg);
      }
      &:hover {
        background-color: #222223;
        color: #fff;
      }
    }
    .layer-mode-pane {
      padding-bottom: 34px;
      width: 200px;
      bottom: 0;
      right: 0;
      position: fixed;
      background: #2b2c2f;
      color: #7e838e;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      .layer-mode-header {
        height: 100px;
        background-color: #26272b;
        padding: 0.5rem 0.75rem;
        font-size: 0.9rem;
        .layer-mode-header-title {
          display: flex;
          justify-content: space-between;
        }
        .layer-mode-header-content {
          display: flex;
          justify-content: space-around;
        }
      }
      .layer-mode-body {
        padding: 0.5rem 0.75rem;
        height: calc(100% - 140px);
        overflow-x: hidden;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 0.9rem;
        .layer-mode-body-content {
          position: relative;
          border: 2px solid #ddd;
          border-radius: 4px;
          width: 100%;
          img {
            width: 100%;
          }
          .remove-layer {
            display: none;
            color: #7e838e;
            position: absolute;
            top: 0%;
            left: 85%;
            svg {
              height: 1rem;
              width: 1rem;
            }
            &:hover {
              color: #fff;
            }
          }
          &:hover .remove-layer {
            display: block;
          }
          .layer-mode-input {
            .layer-mode-input-slider {
              width: 65%;
            }
            .layer-mode-input-number {
              width: 30%;
              padding: 0.2em;
            }
          }
        }
        .layer-mode-body-content:hover {
          border: 1px solid rgba(0, 140, 186, 0.5);
          box-shadow: 0 0 2px 1px rgba(0, 140, 186, 0.5);
        }
        .layer-mode-body-content-active {
          border: 1px solid rgba(0, 140, 186, 0.5);
          box-shadow: 0 0 2px 1px rgba(0, 140, 186, 0.5);
        }
      }
      .layer-mode-footer {
        height: 40px;
        padding: 0.1rem 0;
        .layer-mode-apply-button {
          width: 80%;
        }
      }
    }
    .layer-mode-pane-active {
      height: calc(100vh - 56px);
      transition: all 0.5s;
      -webkit-transition: all 0.5s;
    }
    .layer-mode-pane-inactive {
      height: 0;
      transition: all 0.5s;
      -webkit-transition: all 0.5s;
    }
  }
`;

export default ImageEditorStyle;
