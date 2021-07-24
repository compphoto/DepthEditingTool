import React from "react";
import Loader from "react-loaders";

export default function Loading() {
  return (
    <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Loader type="ball-pulse" />
    </div>
  );
}
