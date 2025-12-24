import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/mobile.css";
import "./styles/firefox-responsive.css";
import { logBrowserInfo, applyBrowserSpecificFixes } from "./utils/browser-compatibility";
import { runResponsiveTests } from "./utils/responsive-test";

// Initialize browser compatibility
logBrowserInfo();
applyBrowserSpecificFixes();

// Run responsive tests in development
if (import.meta.env.DEV) {
  // Wait for DOM to be ready
  setTimeout(() => {
    runResponsiveTests();
  }, 1000);
}

createRoot(document.getElementById("root")!).render(<App />);
