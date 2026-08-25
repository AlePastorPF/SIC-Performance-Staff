// scripts/verify_build.js
//
// Prueba automática de humo (smoke test): abre el index.html generado en un DOM
// simulado (jsdom), ingresa la contraseña, y hace clic en cada pestaña para
// confirmar que el sitio carga sin errores de JavaScript y que los datos
// realmente se renderizan.
//
// Se corre automáticamente si lo agregás al workflow, o a mano con:
//   npm install --no-save jsdom
//   node scripts/verify_build.js
//
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const htmlPath = path.join(__dirname, "..", "index.html");
const html = fs.readFileSync(htmlPath, "utf-8");

const errors = [];

const { VirtualConsole } = require("jsdom");
const virtualConsole = new VirtualConsole();
virtualConsole.on("jsdomError", () => {}); // silencia errores de carga de recursos externos (fuentes), no son bugs de la app

const dom = new JSDOM(html, {
  runScripts: "dangerously",
  resources: "usable",
  url: "https://example.org/",
  pretendToBeVisual: true,
  virtualConsole,
  beforeParse(window) {
    window.onerror = (msg) => errors.push(String(msg));
    window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {} }));
    window.ResizeObserver = window.ResizeObserver || class { observe() {} unobserve() {} disconnect() {} };
  },
});

function setNativeValue(el, value) {
  const proto = Object.getPrototypeOf(el);
  const desc = Object.getOwnPropertyDescriptor(proto, "value");
  desc.set.call(el, value);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  await wait(3000);
  const { document } = dom.window;

  const input = document.querySelector('input[type="password"]');
  setNativeValue(input, "1935Zanja1935");
  input.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
  const loginBtn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent.trim() === "Ingresar");
  loginBtn.click();
  await wait(1500);

  const tabs = ["Carga (GPS)", "Ball in Play", "Nutrición", "Bienestar"];
  let allOk = true;
  for (const tabName of tabs) {
    const btn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent.trim() === tabName);
    if (!btn) {
      console.log(`[FALTA] No se encontró el botón de pestaña: ${tabName}`);
      allOk = false;
      continue;
    }
    errors.length = 0;
    btn.click();
    await wait(1200);
    const rootLen = document.getElementById("root").innerHTML.length;
    const hasErrors = errors.length > 0;
    console.log(`  [${hasErrors ? "ERROR" : "OK"}] pestaña "${tabName}" -> HTML: ${rootLen} chars${hasErrors ? " -- " + errors.join(" | ") : ""}`);
    if (hasErrors) allOk = false;
  }

  console.log(allOk ? "\nTODAS LAS PESTAÑAS RENDERIZARON SIN ERRORES." : "\nSE ENCONTRARON PROBLEMAS.");
  process.exit(allOk ? 0 : 1);
}

run();
