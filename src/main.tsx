import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import "./styles/global.css";

class AppErrorBoundary extends React.Component<React.PropsWithChildren, { error: string | null }> {
  state = { error: null as string | null };

  static getDerivedStateFromError(error: unknown) {
    return { error: error instanceof Error ? error.stack || error.message : String(error) };
  }

  render() {
    if (this.state.error) {
      return <main style={{ minHeight: "100vh", padding: "28px", background: "#101426", color: "#fff", fontFamily: "system-ui", overflow: "auto" }}>
        <h1 style={{ color: "#ffd6b0" }}>THE SCHOOL CHRONICLES</h1>
        <h2>App startup error</h2>
        <p>The page loaded, but the game interface could not render. Error details:</p>
        <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", padding: "16px", background: "#241c31", border: "1px solid #b98bd1", borderRadius: "10px" }}>{this.state.error}</pre>
        <button onClick={() => location.reload()} style={{ padding: "12px 20px", background: "#8055a5", color: "white", border: 0, borderRadius: "8px" }}>Reload</button>
      </main>;
    }
    return this.props.children;
  }
}

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element in index.html");

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <AppErrorBoundary><App /></AppErrorBoundary>
  </React.StrictMode>
);
