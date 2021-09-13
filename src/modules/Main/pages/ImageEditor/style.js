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
        input {
          display: none;
        }
        label {
          .btn-default {
            color: #fff;
          }
        }
      }
    }
  }
  section {
    height: calc(100vh - 110px);
    display: flex;
  }
  footer {
    height: 54px;
    background-color: #333334;
    color: #fff;
    padding: 15px 15px;
    text-align: center;
  }
`;

export default ImageEditorStyle;
