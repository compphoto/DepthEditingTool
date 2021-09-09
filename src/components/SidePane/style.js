import styled from "styled-components";
// #2b2c2f

const SidePaneStyle = styled.div`
  display: flex;
  .tools {
    width: 72px;
    height: 100%;
    background: #1e1f22;
    display: flex;
    flex-direction: column;
    .tool {
      flex-shrink: 0;
      width: 72px;
      height: 72px;
      color: #7e838e;
      font-size: 12px;
      line-height: 1rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      padding: 2px;
      svg {
        margin-bottom: 0.25rem;
        width: 1.5rem;
        height: 1.5rem;
      }
      &:hover {
        color: #fff;
      }
    }
    .active {
      background: #2b2c2f;
      color: #fff;
    }
  }
  .tools-ext {
    position: relative;
    width: 360px;
    height: 100%;
    z-index: 10px;
    background: #2b2c2f;
    color: #7e838e;
    padding: 16px 24px;
    .tool-ext {
      display: flex;
      flex-direction: column;
      align-items: center;
      .dropdown-button {
        width: 100%;
      }
    }
    .toggle-button {
      width: 14px;
      height: 80px;
      cursor: pointer;
      position: absolute;
      bottom: 50%;
      left: 100%;
      background: #2b2c2f;
      color: #fff;
      border: none;
      border-radius: 0 20px 20px 0;
      svg {
        margin-left: -10px;
      }
      &:hover {
        color: #7e838e;
      }
      &:focus {
        outline: none;
        box-shadow: none;
      }
    }
  }
`;

export default SidePaneStyle;
