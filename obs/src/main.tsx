import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App.tsx";

document.body.innerHTML = "<div id='root'></div>";

const rootElement = document.getElementById("root");
if (rootElement === null) {
	throw new Error("Root element not found");
}
const root = createRoot(rootElement);
root.render(<App />);
