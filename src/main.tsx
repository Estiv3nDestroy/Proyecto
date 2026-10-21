import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

/**
 * Registro del Service Worker (PWA).
 * Permite instalar NotaMínima como app en el celular y seguir usándola
 * sin conexión. Se registra solo en producción y bajo HTTPS/localhost;
 * si el navegador no lo soporta, la app funciona igual.
 */
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // Sin service worker la app sigue funcionando con normalidad.
    });
  });
}
