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
    .btn-default {
      width: 200px;
      color: #7e838e;
      font-size: 0.8rem;
      margin: 0;
      svg {
        height: 1rem;
        width: 1rem;
      }
      &:hover {
      }
    }
  }
`;

export default ImageEditorStyle;
