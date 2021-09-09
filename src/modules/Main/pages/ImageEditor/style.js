import styled from "styled-components";
// #2b2c2f

const ImageEditorStyle = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  header {
    background-color: #1e1f22;
    color: #fff;
    padding: 10px 15px;
    .nav-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .nav-intro {
        display: flex;
        h4 {
          margin: 0;
        }
        button {
          color: #fff;
        }
      }
    }
  }
  section {
    flex: 1;
    display: flex;
  }
  footer {
    background-color: #333334;
    color: #fff;
    padding: 15px 15px;
    text-align: center;
  }
`;

export default ImageEditorStyle;
