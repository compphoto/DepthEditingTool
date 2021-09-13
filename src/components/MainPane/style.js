import styled from "styled-components";
// #2b2c2f

const MainPaneStyle = styled.div`
  background: #f0f1f2;
  width: calc(100% - 72px);
  .main {
    overflow: hidden;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    img {
      max-height: 95%;
      max-width: 95%;
      cursor: pointer;
    }
  }
  .main-expand {
    margin-left: 0;
    transition: all 0.5s;
    -webkit-transition: all 0.5s;
  }
  .main-shrink {
    margin-left: 360px;
    transition: all 0.5s;
    -webkit-transition: all 0.5s;
  }
`;

export default MainPaneStyle;
