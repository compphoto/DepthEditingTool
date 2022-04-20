import styled from "styled-components";

const ThreeDViewerStyle = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  .v-slider {
    width: 10%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    input[type="range"][orient="vertical"] {
      writing-mode: bt-lr; /* IE */
      -webkit-appearance: slider-vertical; /* WebKit */
    }
  }
  .x-div {
    width: 80%;
    height: 100%;
    display: flex;
    flex-direction: column;
    .x-slider {
      height: 10%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
`;

export default ThreeDViewerStyle;
