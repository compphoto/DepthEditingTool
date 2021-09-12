import styled from "styled-components";
// #2b2c2f

const SidePaneStyle = styled.div`
  display: flex;
  position: relative;
  .tools {
    width: 72px;
    height: 100%;
    background: #1e1f22;
    display: flex;
    flex-direction: column;
    z-index: 10;
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
    position: absolute;
    height: 100%;
    width: 360px;
    background: #2b2c2f;
    color: #7e838e;
    .tools-ext-elements {
      height: 100%;
      padding: 16px 24px;
      overflow-x: hidden;
      overflow-y: auto;
      ::-webkit-scrollbar {
        width: 15px;
      }
      ::-webkit-scrollbar-track {
        background: transparent;
      }
      ::-webkit-scrollbar-thumb {
        border-right: 4px solid rgba(0, 0, 0, 0);
        border-left: 4px solid rgba(0, 0, 0, 0);
        background: #404144;
        border-radius: 5px;
        background-clip: padding-box;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: #555;
      }
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
  }
  .tool-ext-active {
    animation: slide-in 0.5s forwards;
    -webkit-animation: slide-in 0.5s forwards;
  }
  .tool-ext-inactive {
    animation: slide-out 0.5s forwards;
    -webkit-animation: slide-out 0.5s forwards;
  }

  @keyframes slide-in {
    from {
      left: -398%;
    }
    to {
      left: 100%;
    }
  }

  @-webkit-keyframes slide-in {
    from {
      left: -398%;
    }
    to {
      left: 100%;
    }
  }

  @keyframes slide-out {
    from {
      left: 100%;
    }
    to {
      left: -398%;
    }
  }

  @-webkit-keyframes slide-out {
    from {
      left: 100%;
    }
    to {
      left: -398%;
    }
  }
`;

export default SidePaneStyle;
