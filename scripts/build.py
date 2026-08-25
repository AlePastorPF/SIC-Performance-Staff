#!/usr/bin/env python3
"""
scripts/build.py

Junta todo el proyecto y genera el sitio final (index.html):

  1. Lee los archivos crudos de data/ (Excel) y los convierte a JSON.
  2. Inyecta ese JSON (+ el logo de assets/, ya en base64) en la plantilla de React (template/dashboard.jsx).
  3. Empaqueta el JS (React + Recharts + lucide-react + el dashboard) en un solo archivo con esbuild.
  4. Combina todo en el index.html final, en la raíz del proyecto.

No requiere ninguna acción manual: quien actualice los archivos en data/ y haga
push (o lo suba directo en GitHub), dispara el workflow de .github/workflows/build.yml,
que corre este mismo script y deja el sitio actualizado solo.

Uso local:
    pip install -r scripts/requirements.txt
    npm install
    python3 scripts/build.py
"""
import base64
import json
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
ASSETS_DIR = ROOT / "assets"
TEMPLATE_DIR = ROOT / "template"
BUILD_DIR = ROOT / ".build"


def log(msg):
    print(f"[build] {msg}", flush=True)


def fail(msg):
    print(f"[build] ERROR: {msg}", file=sys.stderr, flush=True)
    sys.exit(1)


# ---------------------------------------------------------------------------
# Utilidades de parseo comunes
# ---------------------------------------------------------------------------

def clean_num(v):
    """Convierte un valor de celda a float redondeado a 1 decimal, o 0 si no es numérico."""
    try:
        f = float(v)
        if np.isnan(f) or np.isinf(f):
            return 0.0
        return round(f, 1)
    except (TypeError, ValueError):
        return 0.0


def fmt_fecha(v):
    """Formatea una fecha (Timestamp de pandas, string o NaT) como DD/MM/AAAA."""
    if pd.isna(v):
        return ""
    if isinstance(v, str):
        return v.strip()
    try:
        return pd.Timestamp(v).strftime("%d/%m/%Y")
    except Exception:
        return str(v)


def fmt_timestamp(v):
    if pd.isna(v):
        return ""
    if isinstance(v, str):
        return v.strip()
    try:
        return pd.Timestamp(v).strftime("%d/%m/%Y %H:%M:%S")
    except Exception:
        return str(v)


def df_to_records(df, cols):
    """Convierte un DataFrame ya con las columnas finales (en cols, en orden) a una
    lista de diccionarios {columna: valor}, lista para json.dumps (así el JS puede
    acceder a d.fecha, d.jugador, etc. como objeto, no como array posicional)."""
    return df[cols].to_dict(orient="records")


# ---------------------------------------------------------------------------
# 1) Carga (GPS)
# ---------------------------------------------------------------------------

CARGA_COLS = ["jugador", "periodo", "actividad", "fecha", "puesto", "distancia", "mtsMin",
              "maxAcel", "hsr", "maxVel", "duracionMin", "etiqueta", "temporada", "esfExp",
              "contactos", "playerLoad", "rhie", "big"]


def parse_carga(path):
    log(f"Leyendo Carga (GPS) desde {path.name} ...")
    xls = pd.ExcelFile(path)
    sheet = "GPS" if "GPS" in xls.sheet_names else xls.sheet_names[0]
    df = pd.read_excel(xls, sheet_name=sheet)
    df = df.dropna(subset=["Jugador", "Fecha"])

    out = pd.DataFrame()
    out["jugador"] = df["Jugador"].astype(str).str.strip()
    out["periodo"] = df["Periodo"].fillna("").astype(str).str.strip()
    out["actividad"] = df["Actividad"].fillna("").astype(str).str.strip()
    out["fecha"] = df["Fecha"].apply(fmt_fecha)
    out["puesto"] = df["Puesto"].fillna("").astype(str).str.strip()
    out["distancia"] = df["Distancia"].apply(clean_num)
    out["mtsMin"] = df["Mts/Min"].apply(clean_num)
    out["maxAcel"] = df["Max Acel"].apply(clean_num)
    out["hsr"] = df["HSR (>5 m/s)"].apply(clean_num)
    out["maxVel"] = df["Max Vel"].apply(clean_num)
    out["duracionMin"] = df["Duracion (min)"].apply(clean_num)
    out["etiqueta"] = df["Etiqueta de Actividad"].fillna("").astype(str).str.strip()
    out["temporada"] = df["Temporada"].fillna("").astype(str).str.replace(r"\.0$", "", regex=True)
    out["esfExp"] = df["Esf Expl"].apply(clean_num)
    out["contactos"] = df["Contactos"].apply(clean_num)
    out["playerLoad"] = df["# ACDC"].apply(clean_num)
    out["rhie"] = df["RHIE Total Bouts"].apply(clean_num)
    out["big"] = df[" # BiG "].apply(clean_num)

    log(f"  -> {len(out)} filas, temporadas: {sorted(out['temporada'].unique())}")
    return df_to_records(out, CARGA_COLS)


# ---------------------------------------------------------------------------
# 2) Ball in Play
# ---------------------------------------------------------------------------

BIP_COLS = ["jugador", "partido", "puesto", "secuencia", "duracion", "distancia",
            "acelsAlta", "hsr", "big", "contactos"]


def parse_bip(path):
    log(f"Leyendo Ball in Play desde {path.name} ...")
    xls = pd.ExcelFile(path)
    # Probamos todas las hojas y usamos la primera que tenga datos válidos de Jugador+Partido
    for sheet in xls.sheet_names:
        df = pd.read_excel(xls, sheet_name=sheet)
        if "Jugador" not in df.columns or "Partido" not in df.columns:
            continue
        df = df.dropna(subset=["Jugador", "Partido"])
        if df.empty:
            continue

        out = pd.DataFrame()
        out["jugador"] = df["Jugador"].astype(str).str.strip()
        out["partido"] = df["Partido"].astype(str).str.strip()
        out["puesto"] = df.get("Position Name", pd.Series(["Sin dato"] * len(df))).fillna("Sin dato").astype(str).str.strip()
        out["secuencia"] = df.get("Secuencia", pd.Series([""] * len(df))).fillna("").astype(str).str.strip()
        out["duracion"] = df["Total Duration"].apply(clean_num)
        out["distancia"] = df["Total Distance (m)"].apply(clean_num)
        out["acelsAlta"] = df["Acels Alta"].apply(clean_num)
        out["hsr"] = df["HSR (>5 m/s)"].apply(clean_num)
        out["big"] = df["BiG (s)"].apply(clean_num)
        out["contactos"] = df["# Contactos"].apply(clean_num)

        log(f"  -> hoja '{sheet}': {len(out)} filas, {out['partido'].nunique()} partidos")
        return df_to_records(out, BIP_COLS)

    fail(f"No se encontraron filas válidas de Ball in Play en ninguna hoja de {path.name}")


# ---------------------------------------------------------------------------
# 3) Nutrición (esquema flexible: se auto-detectan las columnas)
# ---------------------------------------------------------------------------

NUTRI_FIXED_COLS = ["jugador", "fecha", "temporada", "puesto"]


def parse_nutri(path):
    log(f"Leyendo Nutrición desde {path.name} ...")
    xls = pd.ExcelFile(path)
    all_records = []
    cols_seen = list(NUTRI_FIXED_COLS)

    for sheet in xls.sheet_names:
        df_raw = pd.read_excel(xls, sheet_name=sheet)
        header_map = {str(c).strip().lower(): c for c in df_raw.columns}

        jugador_key = next((header_map[k] for k in ("jugador", "nombre", "apellido y nombre") if k in header_map), None)
        if jugador_key is None:
            log(f"  hoja '{sheet}': sin columna Jugador reconocible, se omite")
            continue

        fecha_key = next((header_map[k] for k in ("fecha", "timestamp", "date") if k in header_map), None)
        temporada_key = next((header_map[k] for k in ("temporada", "season") if k in header_map), None)
        puesto_key = next((header_map[k] for k in ("puesto", "posicion", "position", "position name") if k in header_map), None)

        df = df_raw.dropna(subset=[jugador_key])
        if df.empty:
            continue

        known_keys = {k for k in (jugador_key, fecha_key, temporada_key, puesto_key) if k}
        other_cols = [c for c in df_raw.columns if c not in known_keys]

        year_sheet = re.fullmatch(r"\d{4}", sheet.strip())

        for _, row in df.iterrows():
            fecha = fmt_fecha(row[fecha_key]) if fecha_key else ""
            if year_sheet:
                temporada = sheet.strip()
            elif temporada_key:
                temporada = str(row[temporada_key]).strip()
            elif fecha:
                temporada = fecha.split("/")[-1]
            else:
                temporada = ""

            rec = {
                "jugador": str(row[jugador_key]).strip(),
                "fecha": fecha,
                "temporada": temporada,
                "puesto": str(row[puesto_key]).strip() if puesto_key and pd.notna(row[puesto_key]) else "Sin dato",
            }
            for c in other_cols:
                val = row[c]
                if pd.isna(val):
                    rec[c] = ""
                elif isinstance(val, (pd.Timestamp,)):
                    rec[c] = fmt_fecha(val)
                elif isinstance(val, (int, float, np.integer, np.floating)):
                    rec[c] = round(float(val), 2)
                else:
                    rec[c] = str(val).strip()
                if c not in cols_seen:
                    cols_seen.append(c)
            all_records.append(rec)

        log(f"  hoja '{sheet}': {len(df)} filas válidas")

    if not all_records:
        fail(f"No se encontraron filas válidas de Nutrición en {path.name}")

    log(f"  -> total combinado: {len(all_records)} registros, columnas: {cols_seen}")
    return all_records, cols_seen


# ---------------------------------------------------------------------------
# 4) Bienestar
# ---------------------------------------------------------------------------

WELLNESS_COLS = ["jugador", "fecha", "timestamp", "cansancio", "recuperacion", "sueno",
                  "dolor", "mental", "zonaDolor", "sintomas", "comentarios", "total"]


def find_col(columns, *needles_all):
    """Busca la primera columna cuyo nombre (en minúsculas) contenga TODAS las palabras
    de alguna de las tuplas en needles_all."""
    lowered = {c: str(c).strip().lower() for c in columns}
    for needles in needles_all:
        for c, low in lowered.items():
            if all(n in low for n in needles):
                return c
    return None


def parse_wellness(path):
    log(f"Leyendo Bienestar desde {path.name} ...")
    xls = pd.ExcelFile(path)
    sheet = "Wellness" if "Wellness" in xls.sheet_names else xls.sheet_names[0]
    df = pd.read_excel(xls, sheet_name=sheet)

    jugador_col = find_col(df.columns, ("apellido", "nombre"), ("jugador",), ("nombre",))
    timestamp_col = find_col(df.columns, ("timestamp",), ("fecha",))
    if jugador_col is None or timestamp_col is None:
        fail(f"No se encontraron columnas de Jugador/Fecha en {path.name}")

    cansancio_col = find_col(df.columns, ("cansado", "terminaste"))
    recuperacion_col = find_col(df.columns, ("recuperado",))
    sueno_col = find_col(df.columns, ("calidad", "sue"))
    dolor_col = find_col(df.columns, ("dolorido",))  # ojo: puede matchear con "en que parte..."; se filtra abajo
    dolor_col = find_col(df.columns, ("dolorido",)) if dolor_col and "parte" not in str(dolor_col).lower() else \
        next((c for c in df.columns if "dolorido" in str(c).lower() and "parte" not in str(c).lower()), None)
    mental_col = find_col(df.columns, ("cansado", "mental"), ("cansado", "emocion"))
    zona_col = find_col(df.columns, ("parte", "cuerpo"))
    sintomas_col = find_col(df.columns, ("sintoma",))
    comentarios_col = find_col(df.columns, ("comentarios",))
    total_col = find_col(df.columns, ("total",))

    df = df.dropna(subset=[jugador_col])

    out = pd.DataFrame()
    out["jugador"] = df[jugador_col].astype(str).str.strip()
    ts = df[timestamp_col].apply(fmt_timestamp)
    out["timestamp"] = ts
    out["fecha"] = ts.apply(lambda s: s.split(" ")[0] if s else "")
    out["cansancio"] = df[cansancio_col].apply(clean_num) if cansancio_col else 0.0
    out["recuperacion"] = df[recuperacion_col].apply(clean_num) if recuperacion_col else 0.0
    out["sueno"] = df[sueno_col].apply(clean_num) if sueno_col else 0.0
    out["dolor"] = df[dolor_col].apply(clean_num) if dolor_col else 0.0
    out["mental"] = df[mental_col].apply(clean_num) if mental_col else 0.0
    out["zonaDolor"] = df[zona_col].fillna("").astype(str).str.strip() if zona_col else ""
    out["sintomas"] = df[sintomas_col].fillna("").astype(str).str.strip() if sintomas_col else ""
    out["comentarios"] = df[comentarios_col].fillna("").astype(str).str.strip() if comentarios_col else ""
    if total_col:
        out["total"] = df[total_col].apply(clean_num)
    else:
        out["total"] = out[["cansancio", "recuperacion", "sueno", "dolor", "mental"]].sum(axis=1)

    out = out[out["jugador"].str.len() > 0]
    log(f"  -> {len(out)} encuestas, {out['jugador'].nunique()} jugadores")
    return df_to_records(out, WELLNESS_COLS)


# ---------------------------------------------------------------------------
# Orquestación
# ---------------------------------------------------------------------------

def require_file(path, label):
    if not path.exists():
        fail(f"Falta el archivo de datos requerido: {path} ({label}). "
             f"Colocalo en data/ con ese nombre exacto y volvé a correr el build.")


def main():
    log("=== Build del dashboard SIC — Análisis del rendimiento ===")

    carga_path = DATA_DIR / "SIC_Carga.xlsx"
    bip_path = DATA_DIR / "SIC_BiP.xlsx"
    nutri_path = DATA_DIR / "SIC_Nutri_Ref.xlsx"
    wellness_path = DATA_DIR / "SIC_Control_Bienestar.xlsx"
    logo_path = ASSETS_DIR / "SIC_logo.png"

    for p, label in [(carga_path, "Carga GPS"), (bip_path, "Ball in Play"),
                      (nutri_path, "Nutrición"), (wellness_path, "Bienestar"), (logo_path, "logo")]:
        require_file(p, label)

    carga_rows = parse_carga(carga_path)
    bip_rows = parse_bip(bip_path)
    nutri_rows, nutri_cols = parse_nutri(nutri_path)
    wellness_rows = parse_wellness(wellness_path)

    logo_b64 = base64.b64encode(logo_path.read_bytes()).decode("ascii")
    build_timestamp = datetime.now(timezone.utc).strftime("%d/%m/%Y %H:%M UTC")

    # --- 1) Inyectar los datos en una copia del template ---
    BUILD_DIR.mkdir(exist_ok=True)
    template_src = (TEMPLATE_DIR / "dashboard.jsx").read_text(encoding="utf-8")

    replacements = {
        "__CARGA_JSON__": json.dumps(carga_rows, ensure_ascii=False, separators=(",", ":")),
        "__BIP_JSON__": json.dumps(bip_rows, ensure_ascii=False, separators=(",", ":")),
        "__NUTRI_JSON__": json.dumps(nutri_rows, ensure_ascii=False, separators=(",", ":")),
        "__NUTRI_COLS_JSON__": json.dumps(nutri_cols, ensure_ascii=False),
        "__WELLNESS_JSON__": json.dumps(wellness_rows, ensure_ascii=False, separators=(",", ":")),
        "__LOGO_B64__": logo_b64,
        "__BUILD_TIMESTAMP__": build_timestamp,
    }
    injected = template_src
    missing = []
    for placeholder, value in replacements.items():
        if placeholder not in injected:
            missing.append(placeholder)
            continue
        injected = injected.replace(placeholder, value)
    if missing:
        fail(f"El template no contiene estos placeholders esperados: {missing}. "
             f"¿Se modificó template/dashboard.jsx sin actualizar scripts/build.py?")

    injected_path = BUILD_DIR / "dashboard.generated.jsx"
    injected_path.write_text(injected, encoding="utf-8")
    log(f"Datos inyectados en {injected_path} ({len(injected) / 1024:.0f} KB)")

    # --- 2) Punto de entrada que apunta al archivo ya inyectado ---
    entry_path = BUILD_DIR / "main.generated.jsx"
    entry_path.write_text(
        'import React from "react";\n'
        'import { createRoot } from "react-dom/client";\n'
        'import Dashboard from "./dashboard.generated.jsx";\n\n'
        'const root = createRoot(document.getElementById("root"));\n'
        'root.render(<Dashboard />);\n',
        encoding="utf-8",
    )

    # --- 3) Empaquetar con esbuild ---
    bundle_path = BUILD_DIR / "bundle.js"
    esbuild_bin = ROOT / "node_modules" / ".bin" / "esbuild"
    if not esbuild_bin.exists():
        fail("No se encontró node_modules/.bin/esbuild. Corré 'npm install' antes del build.")

    log("Empaquetando JS con esbuild ...")
    result = subprocess.run(
        [str(esbuild_bin), str(entry_path), "--bundle", "--minify",
         f"--outfile={bundle_path}", "--format=iife", "--loader:.jsx=jsx"],
        cwd=ROOT, capture_output=True, text=True,
    )
    if result.returncode != 0:
        fail(f"esbuild falló:\n{result.stdout}\n{result.stderr}")
    log(f"  -> bundle generado: {bundle_path.stat().st_size / 1024:.0f} KB")

    # --- 4) Armar el index.html final ---
    html_template = (TEMPLATE_DIR / "index.html").read_text(encoding="utf-8")
    bundle_js = bundle_path.read_text(encoding="utf-8")
    final_html = html_template.replace("__BUNDLE_JS__", bundle_js)

    out_path = ROOT / "index.html"
    out_path.write_text(final_html, encoding="utf-8")
    log(f"index.html final escrito en {out_path} ({out_path.stat().st_size / 1024:.0f} KB)")
    log("=== Build terminado OK ===")


if __name__ == "__main__":
    main()
