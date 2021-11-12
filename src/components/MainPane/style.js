import styled from "styled-components";

const MainPaneStyle = styled.div`
  background: #f0f1f2;
  width: calc(100% - 72px);
  display: flex;
  .main {
    width: calc(100% - 200px);
    overflow: hidden;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 10px;
    .main-row {
      height: 100%;
      width: 100%;
      display: flex;
      justify-content: space-between;
      .main-column {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin: 10px;
        .box {
          background-color: #d9dadd;
          margin: 10px;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow-y: hidden;
          overflow-x: hidden;
        }
        .rgb-box {
          height: 50%;
          width: 100%;
        }
        .depth-box {
          height: 50%;
          width: 100%;
        }
        .threeD-box {
          height: 50%;
          width: 100%;
        }
        .histogram-box {
          height: 50%;
          width: 100%;
        }
      }
      .main-column-2d {
        width: 50%;
      }
      .main-column-3d {
        width: 50%;
      }
    }
  }
  .main-expand {
    margin-left: 0;
    transition: all 0.5s;
    -webkit-transition: all 0.5s;
  }
  .main-shrink {
    margin-left: 300px;
    transition: all 0.5s;
    -webkit-transition: all 0.5s;
  }
  .main-side-bar {
    width: 200px;
    background: #fff;
    -webkit-box-shadow: -1px 0 0 0 rgb(4 0 0 / 5%);
    box-shadow: -1px 0 0 0 rgb(4 0 0 / 5%);
    padding: 0.5rem 0.75rem;
    display: flex;
    flex-direction: column;
    .main-side-bar-body {
      height: calc(100% - 50px);
      display: flex;
      flex-direction: column;
      .main-side-bar-divider {
        height: 0;
        margin: 0.5rem 0;
        overflow: hidden;
        border-top: 1px solid #e9ecef;
      }
      .main-side-bar-container {
        height: 50%;
        .main-side-bar-container-text {
          text-align: center;
          font-size: 0.9rem;
          color: #7e838e;
        }
        .main-side-bar-header {
          font-size: 13px;
          background: #f4f5f6;
          text-align: center;
          margin-bottom: 0.5rem;
          input {
            display: none;
          }
          label {
            width: 100%;
            .btn-default {
              color: #7e838e;
              width: 100%;
              font-size: 0.8rem;
              margin: 0;
              svg {
                height: 1rem;
                width: 1rem;
              }
            }
          }
          &:hover {
            background: #d8dcdf;
          }
        }
        .main-side-bar-img {
          position: relative;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 5px;
          width: 100%;
          margin-bottom: 0.5rem;
          .side-bar-img {
            width: 100%;
          }
          .remove-img {
            display: none;
            color: #7e838e;
            position: absolute;
            top: 5%;
            left: 80%;
            svg {
              height: 1rem;
              width: 1rem;
            }
            &:hover {
              color: #fff;
            }
          }
          &:hover .remove-img {
            display: block;
          }
        }
        .main-side-bar-img:hover {
          border: 1px solid rgba(0, 140, 186, 0.5);
          box-shadow: 0 0 2px 1px rgba(0, 140, 186, 0.5);
        }
        .main-side-bar-img-active {
          border: 1px solid rgba(0, 140, 186, 0.5);
          box-shadow: 0 0 2px 1px rgba(0, 140, 186, 0.5);
        }
      }
    }
    .main-side-bar-footer {
      height: 50px;
      display: flex;
      justify-content: center;
      align-items: center;
      p {
        font-size: 0.9rem;
        margin: 0;
        color: #7e838e;
      }
      button {
        color: #7e838e;
        &:hover {
          color: #46494f;
        }
      }
    }
  }
`;

export default MainPaneStyle;
