import { testReducer } from "./reducers";
import { types } from "./constants";

describe("test reducer", () => {
  const initialState = {
    test: 0,
    users: []
  };

  it("should return initial state", () => {
    expect(testReducer(undefined, {})).toEqual({
      test: 0,
      users: []
    });
  });

  it("should set test to success", () => {
    expect(
      testReducer(initialState, {
        type: types.TEST_SUCCESS,
        payload: ["test"]
      })
    ).toEqual({
      test: 1,
      users: ["test"]
    });
  });

  it("should set test to failed", () => {
    expect(
      testReducer(initialState, {
        type: types.TEST_FAILED,
        payload: ["test"]
      })
    ).toEqual({
      ...initialState,
      test: -1
    });
  });
});
