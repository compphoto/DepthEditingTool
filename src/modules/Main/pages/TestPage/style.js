import styled from "styled-components";
import { typeScale } from "theme";

const TestPageStyle = styled.div`
  header {
    padding: 2rem;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    button {
      padding: 1rem;
      font-size: ${typeScale.bodyText3};
    }
  }
  section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    button {
      padding: 1rem;
      font-size: ${typeScale.bodyText1};
    }
  }
`;

export default TestPageStyle;
