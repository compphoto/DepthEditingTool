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
    input {
      display: none;
    }
    .nav-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .nav-intro {
        display: flex;
        h4 {
          margin: 0;
        }
        .nav-intro-tabs {
          margin: 0 2rem;
          display: flex;
          align-items: end;
          .dropdown {
            .btn-secondary {
              color: #7e838e;
              background: none;
              border: none;
              box-shadow: none;
              &:hover {
                color: #fff;
              }
              &:focus {
                color: #fff;
              }
            }
            .dropdown-menu {
              .dropdown-item {
                padding: 0.75rem 1rem;
                p {
                  margin: 0;
                }
              }
            }
          }
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
      width: 250px;
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
      width: 250px;
      bottom: 0;
      right: 0;
      position: fixed;
      background: #2b2c2f;
      color: #7e838e;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      .layer-mode-header {
        height: 50px;
        background-color: #26272b;
        padding: 0.5rem 0.75rem;
        font-size: 0.9rem;
        .layer-mode-header-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          p {
            margin: 0;
          }
          button {
            color: #7e838e;
          }
        }
        .layer-mode-header-content {
        }
      }
      .layer-mode-body {
        padding: 0.5rem 0.75rem;
        height: calc(100% - 110px);
        overflow-x: hidden;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 0.9rem;
        .layer-mode-body-content {
          position: relative;
          width: 100%;
          .layer-mode-body-content-image-card {
            background: #1e1f22;
            width: 100%;
            .layer-mode-body-content-image {
              display: flex;
              justify-content: center;
              align-items: center;
              overflow: hidden;
              width: 100%;
              height: 120px;
              padding: 0;
              img {
                max-width: 100%;
                max-height: 100%;
              }
            }
          }
          .remove-layer {
            display: none;
            color: #7e838e;
            position: absolute;
            top: 0%;
            left: 90%;
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
        }
        .layer-mode-body-content:hover {
          border: 2px solid rgb(126, 131, 142);
        }
        .layer-mode-body-content-active {
          border: 2px solid rgb(126, 131, 142);
        }
        .layer-mode-body-add {
          width: 100%;
          display: flex;
          justify-content: center;
          .layer-mode-body-add-card {
            cursor: pointer;
            background: #232426;
            width: 70%;
            height: 50px;
            display: flex;
            justify-content: center;
            align-items: center;
            svg {
              width: 1.2rem;
              height: 1.2rem;
            }
          }
          .layer-mode-body-add-card:hover {
            background: #1b1b1d;
          }
        }
        .layer-mode-body-add[disabled] {
          pointer-events: none;
          opacity: 0.7;
        }
      }
      .layer-mode-footer {
        background-color: #26272b;
        height: 60px;
        padding: 0.1rem 0;
        display: flex;
        justify-content: space-around;
        align-items: center;
        .layer-mode-apply-button {
          width: 40%;
          button {
            width: 100%;
          }
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
