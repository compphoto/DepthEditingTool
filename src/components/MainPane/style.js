import styled from "styled-components";
// #2b2c2f

const MainPaneStyle = styled.div`
  flex: 1;
  background: #f0f1f2;
  overflow: hidden;
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
