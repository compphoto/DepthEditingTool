import { createGlobalStyle } from "styled-components";
import { normalize } from "polished";

const GlobalStyles = createGlobalStyle`
    ${normalize()}
    html {
        box-sizing: border-box;
    }
    *, *:before, *:after {
        box-sizing: border-box;
    }
`;

export default GlobalStyles;
