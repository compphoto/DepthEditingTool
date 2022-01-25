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
    ::-webkit-scrollbar {
        width: 8px;
    }
    ::-webkit-scrollbar-track {
    background: transparent;
    }
    ::-webkit-scrollbar-thumb {
    /* border-right: 4px solid rgba(0, 0, 0, 0);
    border-left: 4px solid rgba(0, 0, 0, 0); */
    background: #404144;
    /* border-radius: 5px; */
    background-clip: padding-box;
    }
    ::-webkit-scrollbar-thumb:hover {
    background: #555;
    }
`;

export default GlobalStyles;
