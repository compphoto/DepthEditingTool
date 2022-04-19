import styled from "styled-components";
import Grid from "assets/images/png/mask-grid.png";
// #2e2f34

const SidePaneStyle = styled.div`
  display: flex;
  position: relative;
  width: 250px;
  .layer-mode-pane {
    width: 100%;
    background: #1e1f22;
    color: #7e838e;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 10;
    .layer-mode-header {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 50px;
      background-color: #2e2f34;
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
          background: #2e2f34;
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
              background-image: url(${Grid});
              background-repeat: no-repeat;
              background-attachment: fixed;
              background-size: contain;
              max-width: 100%;
              max-height: 100%;
            }
          }
        }
        .top-right-options {
          position: absolute;
          top: 0%;
          left: 92%;
          display: none;
          flex-direction: column;
          .top-right-option {
            margin-bottom: 0.5rem;
            color: #6d727d;
            svg {
              height: 1.2rem;
              width: 1.2rem;
            }
            &:hover {
              color: #999da6;
            }
          }
        }
        &:hover .top-right-options {
          display: flex;
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
          background: #2e2f34;
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
          background: #26272b;
        }
      }
      .layer-mode-body-add[disabled] {
        pointer-events: none;
        opacity: 0.7;
      }
    }
    .layer-mode-footer {
      background-color: #2e2f34;
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
  .tools-ext {
    position: absolute;
    height: 100%;
    width: 250px;
    background: #3e4046;
    color: #7e838e;
    .tools-ext-header {
      height: 50px;
      background: #2e2f34;
      display: flex;
      align-items: center;
      justify-content: space-evenly;
      .tool {
        flex: 1;
        height: 100%;
        color: #7e838e;
        line-height: 1rem;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        padding: 2px;
        svg {
          margin-bottom: 0.25rem;
          width: 1.2rem;
          height: 1.2rem;
        }
        span {
          font-size: 0.7rem;
        }
        &:hover {
          color: #fff;
        }
      }
      .tool[disabled] {
        pointer-events: none;
        opacity: 0.7;
      }
      .active {
        background: #3e4046;
        color: #fff;
      }
    }
    .tools-ext-body {
      height: calc(100% - 50px);
      .tools-ext-elements {
        height: 100%;
        padding: 16px 24px;
        overflow-x: hidden;
        overflow-y: auto;
        .tool-ext {
          .tool-ext-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            .dropdown-button {
              width: 100%;
            }
            .tool-ext-card {
              background: transparent;
              border: none;
              .tool-ext-card-body {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                padding: 1rem 0;
              }
              .tool-ext-input {
                .tool-ext-input-slider {
                  width: 70%;
                }
                .tool-ext-input-number {
                  width: 25%;
                  padding: 0.2em;
                }
              }
            }
          }
          .tool-ext-selection {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            .tool-ext-selection-title {
              margin: 1.5rem 0 0.5rem 0;
            }
            .tool-ext-selection-image-card {
              background: #1e1f22;
              width: 100%;
              .tool-ext-selection-image {
                display: flex;
                justify-content: center;
                align-items: center;
                overflow: hidden;
                width: 100%;
                height: 100px;
                padding: 0;
                img {
                  max-width: 100%;
                  max-height: 100%;
                }
              }
            }
            .tool-ext-selection-icons {
              width: 100%;
              display: flex;
              flex-wrap: wrap;
              .selection-tool {
                flex-shrink: 0;
                width: 50px;
                height: 50px;
                color: #7e838e;
                font-size: 12px;
                line-height: 1rem;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                cursor: pointer;
                padding: 2px;
                svg {
                  margin-bottom: 0.25rem;
                  width: 1.5rem;
                  height: 1.5rem;
                }
                &:hover {
                  color: #fff;
                }
              }
              .selection-tool-active {
                background: #2e2f34;
                color: #fff;
              }
            }
            .tool-ext-selection-icons[disabled] {
              pointer-events: none;
              opacity: 0.7;
            }
          }
        }
        .toggle-button {
          z-index: 1000;
          width: 14px;
          height: 80px;
          cursor: pointer;
          position: absolute;
          bottom: 50%;
          left: 100%;
          background: #2e2f34;
          color: #fff;
          border: none;
          border-radius: 0 20px 20px 0;
          svg {
            margin-left: -10px;
          }
          &:hover {
            color: #7e838e;
          }
          &:focus {
            outline: none;
            box-shadow: none;
          }
        }
      }
    }
  }
  .tool-ext-active {
    left: 100%;
    transition: all 0.5s;
    -webkit-transition: all 0.5s;
  }
  .tool-ext-inactive {
    left: 0%;
    transition: all 0.5s;
    -webkit-transition: all 0.5s;
  }
`;

export default SidePaneStyle;
