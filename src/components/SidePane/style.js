import styled from "styled-components";
// #2b2c2f

const SidePaneStyle = styled.div`
  display: flex;
  position: relative;
  width: 60px;
  .tools {
    height: 100%;
    background: #1e1f22;
    display: flex;
    flex-direction: column;
    z-index: 10;
    .tool {
      flex-shrink: 0;
      width: 60px;
      height: 60px;
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
    .active {
      background: #2b2c2f;
      color: #fff;
    }
  }
  .tools-ext {
    position: absolute;
    height: 100%;
    width: 250px;
    background: #2b2c2f;
    color: #7e838e;
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
            .tool-ext-card-body {
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
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
              background: #2b2c2f;
              color: #fff;
            }
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
        background: #2b2c2f;
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
  .tool-ext-active {
    left: 100%;
    transition: all 0.5s;
    -webkit-transition: all 0.5s;
  }
  .tool-ext-inactive {
    left: -320%;
    transition: all 0.5s;
    -webkit-transition: all 0.5s;
  }
`;

export default SidePaneStyle;
