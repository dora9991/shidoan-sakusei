import React from "react";
import { createRoot } from "react-dom/client";
import LessonPlanApp from "./LessonPlanApp.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LessonPlanApp />
  </React.StrictMode>
);
