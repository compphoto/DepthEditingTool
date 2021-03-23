import React from "react";

export default function ErrorView({ text }) {
  return (
    <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <h1>{text}</h1>
    </div>
  );
}
