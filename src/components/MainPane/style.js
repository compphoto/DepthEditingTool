import styled from "styled-components";
// #2b2c2f

const MainPaneStyle = styled.div`
  flex: 1;
  background: #f0f1f2;
  overflow: hidden;
  .main-expand {
    animation: expand 0.5s forwards;
    -webkit-animation: expand 0.5s forwards;
  }
  .main-shrink {
    animation: shrink 0.5s forwards;
    -webkit-animation: shrink 0.5s forwards;
  }

  @keyframes expand {
    from {
      margin-left: 360px;
    }
    to {
      margin-left: 0;
    }
  }

  @-webkit-keyframes expand {
    from {
      margin-left: 360px;
    }
    to {
      margin-left: 0;
    }
  }

  @keyframes shrink {
    from {
      margin-left: 0;
    }
    to {
      margin-left: 360px;
    }
  }

  @-webkit-keyframes shrink {
    from {
      margin-left: 0;
    }
    to {
      margin-left: 360px;
    }
  }
`;

export default MainPaneStyle;
