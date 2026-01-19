import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/asset360.css";

const el = document.getElementById("root");
if (!el) throw new Error("Root mount missing");

createRoot(el).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
