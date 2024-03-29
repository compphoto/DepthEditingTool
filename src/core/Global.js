import { createGlobalStyle } from "styled-components";
import { normalize } from "polished";

const GlobalStyles = createGlobalStyle`
    ${normalize()}
    html {
        box-sizing: border-box;
    }
    *, *:before, *:after {
        box-sizing: border-box;
        font-size: 0.9rem;
    }
    *[disabled] {
      pointer-events: none;
      opacity: 0.7;
    }
    ::-webkit-scrollbar {
        width: 8px;
    }
    ::-webkit-scrollbar-track {
    background: transparent;
    }
    ::-webkit-scrollbar-thumb {
    background: #404144;
    background-clip: padding-box;
    }
    ::-webkit-scrollbar-thumb:hover {
    background: #555;
    }
`;

export default GlobalStyles;
