import { createRoot } from "react-dom/client";
import { App } from "./App";
import { ApiAdapter } from "../storage/ApiAdapter";

const root = document.getElementById("root");
if (!root) throw new Error("No #root element found");

createRoot(root).render(<App storage={new ApiAdapter()} />);
