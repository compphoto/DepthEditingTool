import { authReducer } from "./reducer";

import { types } from "./constants";

describe("auth reducer", () => {
  it("should return initial state", () => {
    expect(authReducer(undefined, {})).toEqual({
      isAuthorized: false,
      user: null
    });
  });
  it("should store user after login", () => {
    expect(
      authReducer(
        {
          isAuthorized: false
        },
        {
          type: types.AUTH_SUCCESS,
          payload: {
            isAuthorized: true
          }
        }
      )
    ).toEqual({
      isAuthorized: true
    });
  });
});
