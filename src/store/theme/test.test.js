import { themeReducer } from "./reducers";
import { types } from "./constants";

describe("test reducer", () => {
  it("should return initial state", () => {
    expect(themeReducer(undefined, {})).toEqual({
      darkMode: false
    });
  });

  it("should set darkmode to true when initially false", () => {
    expect(
      themeReducer(
        {
          darkMode: false
        },
        {
          type: types.TOGGLE_DARK_MODE
        }
      )
    ).toEqual({
      darkMode: true
    });
  });

  it("should set darkmode to false when initially true", () => {
    expect(
      themeReducer(
        {
          darkMode: true
        },
        {
          type: types.TOGGLE_DARK_MODE
        }
      )
    ).toEqual({
      darkMode: false
    });
  });
});
