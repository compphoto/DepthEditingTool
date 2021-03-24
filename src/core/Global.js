import { createGlobalStyle } from "styled-components";
import { normalize } from "polished";
import { primaryFont, typeScale } from "theme";

const GlobalStyles = createGlobalStyle`
    ${normalize()}
    html {
        box-sizing: border-box;
        font-size: 62.5%;
        @media only screen and (min-width: 600px) {
            font-size: 25%;
        }
        @media only screen and (min-width: 768px) {
            font-size: 37.5%;
        }
        @media only screen and (min-width: 992px) {
            font-size: 50%;
        }
        @media only screen and (min-width: 1200px) {
            font-size: 62.5%;
        }
    }
    *, *:before, *:after {
        box-sizing: border-box;
        /* -webkit-transition: all 0.30s ease-in-out;
        -moz-transition: all 0.30s ease-in-out;
        -ms-transition: all 0.30s ease-in-out;
        -o-transition: all 0.30s ease-in-out; */
    }
    body {
        background: ${({ theme }) => theme.backgroundColor};
        color: ${({ theme }) => theme.textColor};
        transition: all 0.05s linear;
        width: 100%;
        height: 100vh;
        line-height: 2.1rem;
        font-family: ${primaryFont};
        font-style: normal;
        font-weight: 400;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }
    p {
        font-size: ${typeScale.bodyText1};
        color: ${({ theme }) => theme.textHeader};
    }
    h1, h2, h3, h4, h5 {
        font-family: ${primaryFont};
        font-weight: 400;
        color: ${({ theme }) => theme.textHeader};
    }
    h1 {
        margin-bottom: 4.0rem;
        line-height: 4.3rem;
        font-size: ${typeScale.header1};
    }
    h2 {
        margin-bottom: 2.0rem;
        line-height: 2.8rem;
        font-size: ${typeScale.header2};
    }
    h3 {font-size: ${typeScale.header3};}
    h4 {font-size: ${typeScale.header4};}
    h5 {font-size: ${typeScale.header5};}
`;

export default GlobalStyles;
