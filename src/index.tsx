import { createRoot } from "react-dom/client";
import { App } from "./game.tsx";
import "./style.css";

const root = document.createElement("div") as HTMLElement;
root.id = "root";
root.className = "page";
document.body.append(root);

createRoot(root).render(<App />);
