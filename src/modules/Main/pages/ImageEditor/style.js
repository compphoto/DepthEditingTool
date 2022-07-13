import styled from "styled-components";
// #2e2f34

const ImageEditorStyle = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  header {
    height: 56px;
    background-color: #fff;
    color: #000;
    padding: 10px 15px;
    display: flex;
    align-items: center;
    input {
      display: none;
    }
    .nav-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .nav-intro {
        display: flex;
        h4 {
          margin: 0;
          img {
            height: 100%;
          }
        }
        .nav-intro-tabs {
          margin: 0 2rem;
          display: flex;
          align-items: end;
          .dropdown {
            .btn-secondary {
              color: #3e8de3;
              background: none;
              border: none;
              box-shadow: none;
              &:hover {
                color: #114277;
              }
              &:focus {
                color: #114277;
              }
            }
            .dropdown-menu {
              z-index: 1200;
              .dropdown-item {
                color: #3e8de3;
                padding: 0.75rem 1rem;
                p {
                  margin: 0;
                }
              }
            }
          }
        }
      }
      .nav-button {
        svg {
          color: #3e8de3;
          &:hover {
            color: #114277;
          }
        }
      }
    }
  }
  section {
    height: calc(100vh - 90px);
    display: flex;
  }
  footer {
    height: 34px;
    background-color: #0b294a;
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

export default ImageEditorStyle;
