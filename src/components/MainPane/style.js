import styled from "styled-components";
// #2b2c2f

const MainPaneStyle = styled.div`
  background: #f0f1f2;
  overflow: hidden;
  width: 100%;
  .main {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
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
