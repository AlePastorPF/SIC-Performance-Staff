import React, { useState, useMemo, useRef, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, AreaChart, Area, ComposedChart, ScatterChart, Scatter, PieChart, Pie, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ZAxis, Legend, LabelList, ReferenceLine } from "recharts";
import { Activity, Gauge, Users, Zap, AlertTriangle, TrendingUp, MapPin, Filter, RefreshCw, UploadCloud, CheckCircle2, FileDown, Radio, Apple, HeartPulse } from "lucide-react";

const CARGA_COLS = ["jugador","periodo","actividad","fecha","puesto","distancia","mtsMin","maxAcel","hsr","maxVel","duracionMin","etiqueta","temporada","esfExp","contactos","playerLoad","rhie","big"];
const BIP_COLS = ["jugador","partido","puesto","secuencia","duracion","distancia","acelsAlta","hsr","big","contactos"];
const WELLNESS_COLS = ["jugador","fecha","timestamp","cansancio","recuperacion","sueno","dolor","mental","zonaDolor","sintomas","comentarios","total"];
const CARGA_DATA = __CARGA_JSON__;
const LOGO_SRC = "data:image/png;base64,__LOGO_B64__";
const BIP_DATA = __BIP_JSON__;
const NUTRI_DATA = __NUTRI_JSON__;
const NUTRI_COLS_RUNTIME = __NUTRI_COLS_JSON__;
const WELLNESS_DATA = __WELLNESS_JSON__;
const BUILD_TIMESTAMP = "__BUILD_TIMESTAMP__";

const COLORS = {
  bg: "#F5F7FA",
  surface: "#FFFFFF",
  surfaceAlt: "#F1F5F9",
  line: "#DDE3EA",
  turf: "#0D9488",
  turfDim: "#0F766E",
  chalk: "#0F172A",
  muted: "#64748B",
  amber: "#D97706",
  red: "#DC2626",
  blue: "#2563EB",
};

const POS_ORDER = ["Pilar","Hooker","Segunda Linea","Tercera Linea","Medio Scrum","Apertura","Centro","Wing","Fullback","Utilidad","Sin dato"];

function fmt1(n){ return Math.round(n*10)/10; }
function abbreviateName(fullName) {
  if (!fullName) return "";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) return fullName;
  return `${parts[0][0]} ${parts.slice(1).join(" ")}`;
}

function StatCard({ icon: Icon, label, value, unit, accent }) {
  return (
    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: "16px 18px", minWidth: 150, flex: "1 1 150px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <Icon size={15} color={accent || COLORS.turf} strokeWidth={2.25} />
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: COLORS.muted }}>{label}</span>
      </div>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 34, fontWeight: 700, color: COLORS.chalk, lineHeight: 1 }}>
        {value}<span style={{ fontSize: 15, color: COLORS.muted, marginLeft: 4, fontFamily: "Inter, sans-serif", fontWeight: 400 }}>{unit}</span>
      </div>
    </div>
  );
}

function YardDivider() {
  return (
    <div style={{ height: 1, margin: "22px 0", background: `repeating-linear-gradient(90deg, ${COLORS.line} 0px, ${COLORS.line} 6px, transparent 6px, transparent 12px)` }} />
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 600, color: COLORS.chalk, letterSpacing: "0.01em", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ width: 4, height: 16, background: COLORS.turf, display: "inline-block", borderRadius: 2 }} />
      {children}
    </div>
  );
}

function MultiSelect({ options, selected, onToggle, onClear, colors, allLabel, singularLabel, minWidth = 140, searchable = false }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = React.useRef(null);
  React.useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const label = selected.length === 0 ? allLabel : selected.length === 1 ? selected[0] : `${selected.length} ${singularLabel}s`;
  const filteredOptions = searchable && query ? options.filter(o => o.toLowerCase().includes(query.toLowerCase())) : options;
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{ background: colors.surface, color: colors.chalk, border: `1px solid ${selected.length ? colors.turfDim : colors.line}`, borderRadius: 7, padding: "7px 10px", fontSize: 12.5, fontFamily: "Inter, sans-serif", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, minWidth, justifyContent: "space-between" }}>
        {label}
        <span style={{ color: colors.muted, fontSize: 10 }}>▾</span>
      </button>
      {open && (
        <div style={{ position: "absolute", top: "110%", left: 0, zIndex: 20, background: colors.surfaceAlt, border: `1px solid ${colors.line}`, borderRadius: 8, padding: 8, minWidth: 210, maxHeight: 320, overflowY: "auto", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
          <div onClick={onClear} style={{ padding: "6px 8px", fontSize: 12, color: colors.turf, cursor: "pointer", fontWeight: 600, borderBottom: `1px solid ${colors.line}`, marginBottom: 4 }}>
            {allLabel}
          </div>
          {searchable && (
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={`Buscar ${singularLabel}...`}
              style={{ width: "100%", boxSizing: "border-box", background: colors.surface, color: colors.chalk, border: `1px solid ${colors.line}`, borderRadius: 6, padding: "6px 8px", fontSize: 12, fontFamily: "Inter, sans-serif", marginBottom: 6 }}
            />
          )}
          {filteredOptions.map(p => (
            <label key={p} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 8px", fontSize: 12.5, color: colors.chalk, cursor: "pointer", borderRadius: 5 }}>
              <input type="checkbox" checked={selected.includes(p)} onChange={() => onToggle(p)} style={{ accentColor: colors.turf }} />
              {p}
            </label>
          ))}
          {filteredOptions.length === 0 && (
            <div style={{ padding: "6px 8px", fontSize: 12, color: colors.muted }}>Sin resultados</div>
          )}
        </div>
      )}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: COLORS.surfaceAlt, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "8px 12px", fontFamily: "Inter, sans-serif", fontSize: 12 }}>
      <div style={{ color: COLORS.muted, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || COLORS.chalk }}>{p.name}: {typeof p.value === "number" ? fmt1(p.value) : p.value}</div>
      ))}
    </div>
  );
};

const DASHBOARD_PASSWORD = "1935Zanja1935";

export default function Dashboard() {
  const [unlocked, setUnlocked] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);

  const handleUnlock = () => {
    if (pwInput === DASHBOARD_PASSWORD) {
      setUnlocked(true);
      setPwError(false);
    } else {
      setPwError(true);
    }
  };

  if (!unlocked) {
    return (
      <div style={{ background: "#F5F7FA", minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "Inter, sans-serif" }}>
        <style>{`@import url("https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Inter:wght@400;500;600&display=swap");`}</style>
        <div style={{ background: "#FFFFFF", border: "1px solid #DDE3EA", borderRadius: 14, padding: "36px 32px", width: "100%", maxWidth: 340, textAlign: "center", boxShadow: "0 12px 40px rgba(15,23,42,0.12)" }}>
          <img src={LOGO_SRC} alt="San Isidro Club" style={{ height: 56, width: 56, objectFit: "contain", marginBottom: 16 }} />
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#0D9488", letterSpacing: "0.12em", marginBottom: 6 }}>SIC · RENDIMIENTO DEPORTIVO</div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 700, margin: "0 0 20px", color: "#0F172A" }}>Acceso restringido</h1>
          <input
            type="password"
            value={pwInput}
            onChange={(e) => { setPwInput(e.target.value); setPwError(false); }}
            onKeyDown={(e) => { if (e.key === "Enter") handleUnlock(); }}
            placeholder="Contraseña"
            autoFocus
            style={{
              width: "100%", boxSizing: "border-box", background: "#F5F7FA", color: "#0F172A",
              border: `1px solid ${pwError ? "#DC2626" : "#DDE3EA"}`, borderRadius: 8, padding: "11px 14px",
              fontSize: 14, fontFamily: "Inter, sans-serif", marginBottom: 12, outline: "none"
            }}
          />
          {pwError && (
            <div style={{ color: "#DC2626", fontSize: 12.5, marginBottom: 12, fontFamily: "Inter, sans-serif" }}>
              Contraseña incorrecta. Probá de nuevo.
            </div>
          )}
          <button onClick={handleUnlock} style={{
            width: "100%", background: "#0D9488", color: "#FFFFFF", border: "none", borderRadius: 8,
            padding: "11px 14px", fontSize: 14, fontWeight: 700, fontFamily: "Inter, sans-serif", cursor: "pointer"
          }}>
            Ingresar
          </button>
        </div>
      </div>
    );

  }

  return <DashboardContent />;
}

function DashboardContent() {
  const [cargaData, setCargaData] = useState(CARGA_DATA);
  // Filtro de calidad de dato: excluye velocidades máximas >= 37 km/h (valores no plausibles / error de GPS)
  const cargaDataClean = useMemo(() => cargaData.filter(d => !(d.maxVel >= 37)), [cargaData]);
  const [bipData, setBipData] = useState(BIP_DATA);
  const [nutriData, setNutriData] = useState(NUTRI_DATA);
  const [nutriColumns, setNutriColumns] = useState(NUTRI_COLS_RUNTIME);
  const [wellnessData, setWellnessData] = useState(WELLNESS_DATA);




  // Variante genérica para datasets con columnas desconocidas/variables (ej. Nutrición)






  // Parser flexible para Nutrición: no asumimos el esquema exacto de columnas.
  // Detectamos Jugador/Fecha/Temporada/Puesto (con variantes de nombre) para poder filtrar,
  // y guardamos el resto de las columnas tal cual vienen en el archivo para mostrarlas en la tabla.




  const [exportMsg, setExportMsg] = useState(null);
  const handleExportPDF = () => {
    try {
      const root = document.getElementById("sic-dashboard-root");
      if (!root) return;
      const clone = root.cloneNode(true);
      const html =
        "<!DOCTYPE html><html><head><meta charset='utf-8'><title>SIC - Panel de Rendimiento</title>" +
        "<style>@media print { @page { size: landscape; margin: 10mm; } .no-print { display: none !important; } .print-expand { max-height: none !important; overflow: visible !important; } * { background: #ffffff !important; background-color: #ffffff !important; color: #111111 !important; box-shadow: none !important; border-color: #cccccc !important; } } body{margin:0;background:#ffffff;}</style>" +
        "</head><body>" + clone.outerHTML +
        "<script>window.onload = function(){ setTimeout(function(){ window.print(); }, 300); };<\/script>" +
        "</body></html>";
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SIC_Reporte_${tab === "carga" ? "Carga" : "BallInPlay"}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      setExportMsg("Descargado. Abrilo y usá Ctrl+P / Cmd+P para guardarlo como PDF.");
      setTimeout(() => setExportMsg(null), 6000);
    } catch (err) {
      setExportMsg("No se pudo exportar. Probá Ctrl+P / Cmd+P directamente en esta página.");
      setTimeout(() => setExportMsg(null), 6000);
    }
  };

  const [tab, setTab] = useState("carga");
  const [puestoFilter, setPuestoFilter] = useState([]); // array of selected puestos; empty = todos
  const togglePuesto = (p) => setPuestoFilter(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  const [etiquetaFilter, setEtiquetaFilter] = useState("Todos");

  const [jugadorFilter, setJugadorFilter] = useState([]); // array of selected jugadores; empty = todos
  const toggleJugador = (j) => setJugadorFilter(prev => prev.includes(j) ? prev.filter(x => x !== j) : [...prev, j]);
  const [actividadFilter, setActividadFilter] = useState([]); // array of selected actividades; empty = todas
  const toggleActividad = (a) => setActividadFilter(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  const [fechaModo, setFechaModo] = useState("todas"); // todas | especifica | rango
  const [fechaFilter, setFechaFilter] = useState("Todos");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [temporadaFilter, setTemporadaFilter] = useState("Todas");
  const [periodoFilter, setPeriodoFilter] = useState("Session");
  const [detallePeriodosSel, setDetallePeriodosSel] = useState(["Session"]);
  const toggleDetallePeriodo = (p) => setDetallePeriodosSel(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  const periodos = useMemo(() => ["Todos", ...Array.from(new Set(cargaData.map(d => d.periodo))).sort()], [cargaData]);
  const periodosOpciones = useMemo(() => Array.from(new Set(cargaData.map(d => d.periodo))).sort(), [cargaData]);

  const puestos = useMemo(() => POS_ORDER.filter(p => cargaData.some(d => d.puesto === p)), [cargaData]);
  const etiquetas = useMemo(() => ["Todos", ...Array.from(new Set(cargaData.map(d => d.etiqueta)))], [cargaData]);
  const jugadoresCarga = useMemo(() => Array.from(new Set(cargaData.map(d => d.jugador))).sort(), [cargaData]);

  // ---- Ball in Play ----
  const [bipJugadorFilter, setBipJugadorFilter] = useState([]);
  const toggleBipJugador = (j) => setBipJugadorFilter(prev => prev.includes(j) ? prev.filter(x => x !== j) : [...prev, j]);
  const [bipPuestoFilter, setBipPuestoFilter] = useState([]);
  const toggleBipPuesto = (p) => setBipPuestoFilter(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  const [bipPartidoFilter, setBipPartidoFilter] = useState([]);
  const toggleBipPartido = (p) => setBipPartidoFilter(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  const bipJugadores = useMemo(() => Array.from(new Set(bipData.map(d => d.jugador))).sort(), [bipData]);
  const bipPuestos = useMemo(() => Array.from(new Set(bipData.map(d => d.puesto))).sort(), [bipData]);
  const bipPartidos = useMemo(() => Array.from(new Set(bipData.map(d => d.partido))).sort(), [bipData]);

  const filteredBip = useMemo(() => bipData.filter(d => {
    if (bipJugadorFilter.length > 0 && !bipJugadorFilter.includes(d.jugador)) return false;
    if (bipPuestoFilter.length > 0 && !bipPuestoFilter.includes(d.puesto)) return false;
    if (bipPartidoFilter.length > 0 && !bipPartidoFilter.includes(d.partido)) return false;
    return true;
  }), [bipData, bipJugadorFilter, bipPuestoFilter, bipPartidoFilter]);

  // ---- Nutrición ----
  const [nutriJugadorFilter, setNutriJugadorFilter] = useState([]);
  const toggleNutriJugador = (j) => setNutriJugadorFilter(prev => prev.includes(j) ? prev.filter(x => x !== j) : [...prev, j]);
  const [nutriPuestoFilter, setNutriPuestoFilter] = useState([]);
  const toggleNutriPuesto = (p) => setNutriPuestoFilter(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  const [nutriTemporadaFilter, setNutriTemporadaFilter] = useState("Todas");
  const [nutriFechaFilter, setNutriFechaFilter] = useState("Todas");

  const nutriJugadores = useMemo(() => Array.from(new Set(nutriData.map(d => d.jugador))).sort(), [nutriData]);
  const nutriPuestos = useMemo(() => Array.from(new Set(nutriData.map(d => d.puesto))).sort(), [nutriData]);
  const nutriTemporadas = useMemo(() => ["Todas", ...Array.from(new Set(nutriData.map(d => d.temporada).filter(Boolean))).sort()], [nutriData]);
  const nutriFechas = useMemo(() => ["Todas", ...Array.from(new Set(nutriData.map(d => d.fecha).filter(Boolean))).sort()], [nutriData]);

  const filteredNutri = useMemo(() => nutriData.filter(d => {
    if (nutriJugadorFilter.length > 0 && !nutriJugadorFilter.includes(d.jugador)) return false;
    if (nutriPuestoFilter.length > 0 && !nutriPuestoFilter.includes(d.puesto)) return false;
    if (nutriTemporadaFilter !== "Todas" && d.temporada !== nutriTemporadaFilter) return false;
    if (nutriFechaFilter !== "Todas" && d.fecha !== nutriFechaFilter) return false;
    return true;
  }), [nutriData, nutriJugadorFilter, nutriPuestoFilter, nutriTemporadaFilter, nutriFechaFilter]);

  const nutriExtraCols = useMemo(() => nutriColumns.filter(c => !["jugador", "fecha", "temporada", "puesto"].includes(c)), [nutriColumns]);

  // Orden de la tabla "Registros de Nutrición" — funciona para cualquier columna, fija o dinámica.
  const [nutriSortCol, setNutriSortCol] = useState(null);
  const [nutriSortDir, setNutriSortDir] = useState("asc");
  const toggleNutriSort = (col) => {
    if (nutriSortCol === col) {
      setNutriSortDir(d => (d === "asc" ? "desc" : "asc"));
    } else {
      setNutriSortCol(col);
      setNutriSortDir("asc");
    }
  };
  const parseFechaDDMMYYYY = (f) => {
    if (!f) return null;
    const parts = String(f).split("/");
    if (parts.length !== 3) return null;
    const [dd, mm, yy] = parts.map(Number);
    return new Date(yy, mm - 1, dd);
  };
  const sortedNutri = useMemo(() => {
    if (!nutriSortCol) return filteredNutri;
    const dir = nutriSortDir === "asc" ? 1 : -1;
    return [...filteredNutri].sort((a, b) => {
      const va = a[nutriSortCol], vb = b[nutriSortCol];
      if (nutriSortCol === "fecha") {
        const da = parseFechaDDMMYYYY(va), db = parseFechaDDMMYYYY(vb);
        if (!da && !db) return 0;
        if (!da) return 1;
        if (!db) return -1;
        return (da - db) * dir;
      }
      const na = parseFloat(va), nb = parseFloat(vb);
      const bothNumeric = va !== "" && vb !== "" && !isNaN(na) && !isNaN(nb);
      if (bothNumeric) return (na - nb) * dir;
      return String(va ?? "").localeCompare(String(vb ?? ""), "es") * dir;
    });
  }, [filteredNutri, nutriSortCol, nutriSortDir]);

  // ---- Bienestar ----
  const [jugadorFilterW, setJugadorFilterW] = useState("Todos");
  const [fechaFilterW, setFechaFilterW] = useState("Todos");

  const jugadoresWellness = useMemo(() => ["Todos", ...Array.from(new Set(wellnessData.map(d => d.jugador))).sort()], [wellnessData]);
  const fechasWellness = useMemo(() => ["Todos", ...Array.from(new Set(wellnessData.map(d => d.fecha))).sort((a, b) => {
    const [da, ma, ya] = a.split("/").map(Number);
    const [db, mb, yb] = b.split("/").map(Number);
    return new Date(ya, ma - 1, da) - new Date(yb, mb - 1, db);
  })], [wellnessData]);

  const filteredWellness = useMemo(() => wellnessData.filter(d =>
    (jugadorFilterW === "Todos" || d.jugador === jugadorFilterW) &&
    (fechaFilterW === "Todos" || d.fecha === fechaFilterW)
  ), [wellnessData, jugadorFilterW, fechaFilterW]);

  const wellnessAvgTotal = useMemo(() => filteredWellness.length ? fmt1(filteredWellness.reduce((s, d) => s + d.total, 0) / filteredWellness.length) : 0, [filteredWellness]);
  const alertasWellness = filteredWellness.filter(d => d.total >= 17).length;

  const wellnessPorFecha = useMemo(() => {
    const map = {};
    filteredWellness.forEach(d => {
      if (!map[d.fecha]) map[d.fecha] = { fecha: d.fecha, cansancio: 0, recuperacion: 0, sueno: 0, dolor: 0, mental: 0, n: 0 };
      const r = map[d.fecha];
      r.cansancio += d.cansancio; r.recuperacion += d.recuperacion; r.sueno += d.sueno; r.dolor += d.dolor; r.mental += d.mental; r.n += 1;
    });
    const parseF = (f) => { const [dd, mm, yy] = f.split("/").map(Number); return new Date(yy, mm - 1, dd); };
    return Object.values(map)
      .map(r => ({ fecha: r.fecha, Cansancio: fmt1(r.cansancio / r.n), Recuperacion: fmt1(r.recuperacion / r.n), Sueno: fmt1(r.sueno / r.n), Dolor: fmt1(r.dolor / r.n), Mental: fmt1(r.mental / r.n) }))
      .sort((a, b) => parseF(a.fecha) - parseF(b.fecha));
  }, [filteredWellness]);

  const wellnessRadarData = useMemo(() => {
    if (filteredWellness.length === 0) return [];
    const dims = [
      { key: "cansancio", label: "Cansancio" },
      { key: "recuperacion", label: "Recuperación" },
      { key: "sueno", label: "Sueño" },
      { key: "dolor", label: "Dolor" },
      { key: "mental", label: "Estado mental" },
    ];
    return dims.map(({ key, label }) => ({
      dimension: label,
      value: fmt1(filteredWellness.reduce((s, d) => s + d[key], 0) / filteredWellness.length),
    }));
  }, [filteredWellness]);

  const wellnessZonasDolor = useMemo(() => {
    const map = {};
    filteredWellness.forEach(d => {
      if (!d.zonaDolor) return;
      d.zonaDolor.split(",").map(z => z.trim()).filter(Boolean).forEach(z => {
        map[z] = (map[z] || 0) + 1;
      });
    });
    return Object.entries(map).map(([zona, count]) => ({ zona, count })).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [filteredWellness]);

  const jugadoresRiesgo = useMemo(() => {
    const latest = {};
    filteredWellness.forEach(d => { latest[d.jugador] = d; });
    return Object.values(latest).sort((a, b) => b.total - a.total).slice(0, 10);
  }, [filteredWellness]);

  // Registro más reciente de cada jugador (dentro de lo filtrado), usado como "foto actual" en los gráficos
  const nutriUltimoPorJugador = useMemo(() => {
    const parseF = (f) => { const [dd, mm, yy] = (f || "").split("/").map(Number); return new Date(yy || 0, (mm || 1) - 1, dd || 1); };
    const map = {};
    filteredNutri.forEach(d => {
      if (!map[d.jugador] || parseF(d.fecha) > parseF(map[d.jugador].fecha)) map[d.jugador] = d;
    });
    return Object.values(map);
  }, [filteredNutri]);

  // 1) IM/O por jugador + línea de Sumatoria de Pliegues
  const nutriImoChart = useMemo(() =>
    [...nutriUltimoPorJugador]
      .map(d => ({ jugador: d.jugador, puesto: d.puesto, imo: fmt1(parseFloat(d["IM/O"]) || 0), pliegues: fmt1(parseFloat(d["Sumatoria Pliegues (mm)"]) || 0) }))
      .sort((a, b) => b.imo - a.imo),
    [nutriUltimoPorJugador]);

  const nutriPlieguesPromedio = useMemo(() => {
    if (nutriImoChart.length === 0) return 0;
    return fmt1(nutriImoChart.reduce((s, d) => s + d.pliegues, 0) / nutriImoChart.length);
  }, [nutriImoChart]);

  // 1b) Evolución histórica de IMO + Sumatoria de Pliegues, por jugador seleccionado (responde al filtro de jugadores)
  const nutriEvolucionPorJugador = useMemo(() => {
    if (nutriJugadorFilter.length === 0) return [];
    const parseF = (f) => { const [dd, mm, yy] = (f || "").split("/").map(Number); return new Date(yy || 0, (mm || 1) - 1, dd || 1); };
    return nutriJugadorFilter.map(jug => {
      const registros = filteredNutri
        .filter(d => d.jugador === jug)
        .sort((a, b) => parseF(a.fecha) - parseF(b.fecha))
        .map(d => ({
          fecha: d.fecha,
          puesto: d.puesto,
          imo: fmt1(parseFloat(d["IM/O"]) || 0),
          pliegues: fmt1(parseFloat(d["Sumatoria Pliegues (mm)"]) || 0),
        }));
      return { jugador: jug, puesto: registros[0] ? registros[0].puesto : "Sin dato", registros, avgPliegues: fmt1(registros.reduce((s, r) => s + r.pliegues, 0) / registros.length) };
    }).filter(r => r.registros.length > 0);
  }, [filteredNutri, nutriJugadorFilter]);

  // 2) Composición corporal (5 componentes, columnas D-H): promedio, o del jugador si hay uno solo seleccionado
  // Clasificación de puesto en Forwards (Pilar/Hooker/Segunda/Tercera Línea) vs Backs (resto),
  // y color de IMO según los umbrales definidos para cada grupo.
  const isForwardPuesto = (puesto) => /pilar|hooker|segunda|tercera/i.test(puesto || "");
  const imoColorFor = (imo, puesto) => {
    if (isForwardPuesto(puesto)) {
      if (imo < 4.8) return "#FB923C"; // naranja
      if (imo <= 5.0) return "#FACC15"; // amarillo
      return COLORS.turf; // verde, > 5.0
    }
    if (imo < 4.6) return "#FB923C"; // naranja
    if (imo <= 4.8) return "#FACC15"; // amarillo
    return COLORS.turf; // verde, > 4.8
  };

  // Z-Score adiposo: acá un valor MÁS NEGATIVO es mejor (más verde), al revés que en IMO.
  const zAdiposoColorFor = (z, puesto) => {
    if (isForwardPuesto(puesto)) {
      if (z >= -0.79) return "#FB923C"; // naranja
      if (z >= -1.19) return "#FACC15"; // amarillo (-0.8 a -1.19)
      return COLORS.turf; // verde, < -1.2
    }
    if (z >= -1.79) return "#FB923C"; // naranja
    if (z >= -1.99) return "#FACC15"; // amarillo (-1.8 a -1.99)
    return COLORS.turf; // verde, < -2
  };

  const NUTRI_MASA_COLS = ["Masa adiposa", "Masa muscular", "Masa Residual", "Masa ósea", "Masa de la piel"];
  const NUTRI_MASA_COLORS = { "Masa adiposa": "#DC2626", "Masa muscular": "#0D9488", "Masa Residual": "#64748B", "Masa ósea": "#2563EB", "Masa de la piel": "#D97706" };
  const nutriComposicionData = useMemo(() => {
    const source = nutriJugadorFilter.length === 1
      ? nutriUltimoPorJugador.filter(d => d.jugador === nutriJugadorFilter[0])
      : nutriUltimoPorJugador;
    if (source.length === 0) return [];
    const sums = {}; NUTRI_MASA_COLS.forEach(c => { sums[c] = 0; });
    source.forEach(d => NUTRI_MASA_COLS.forEach(c => { sums[c] += parseFloat(d[c]) || 0; }));
    const total = NUTRI_MASA_COLS.reduce((s, c) => s + sums[c], 0) || 1;
    return NUTRI_MASA_COLS.map(c => ({ name: c, value: fmt1((sums[c] / source.length)), pct: fmt1((sums[c] / total) * 100), fill: NUTRI_MASA_COLORS[c] }));
  }, [nutriUltimoPorJugador, nutriJugadorFilter]);

  // 3) Comparativo de Masa Ósea, según los filtros activos (reemplaza a la somatocarta)
  const nutriMasaOseaData = useMemo(() => {
    const source = nutriUltimoPorJugador.filter(d => parseFloat(d["Masa ósea"]) > 0);
    return source
      .map(d => ({ jugador: d.jugador, puesto: d.puesto, masaOsea: fmt1(parseFloat(d["Masa ósea"]) || 0) }))
      .sort((a, b) => b.masaOsea - a.masaOsea);
  }, [nutriUltimoPorJugador]);

  const nutriMasaOseaPromedio = useMemo(() => {
    if (nutriMasaOseaData.length === 0) return 0;
    return fmt1(nutriMasaOseaData.reduce((s, d) => s + d.masaOsea, 0) / nutriMasaOseaData.length);
  }, [nutriMasaOseaData]);

  const bipKpis = useMemo(() => {
    const n = filteredBip.length || 1;
    const sum = (k) => filteredBip.reduce((s, d) => s + (d[k] || 0), 0);
    // Duración real de juego: sumar solo secuencias únicas (partido+secuencia) para no multiplicar por cantidad de jugadores
    const seen = new Set();
    let duracionTotal = 0;
    filteredBip.forEach(d => {
      const key = `${d.partido}__${d.secuencia}`;
      if (!seen.has(key)) { seen.add(key); duracionTotal += d.duracion || 0; }
    });
    return {
      secuencias: filteredBip.length,
      distanciaTotal: sum("distancia"),
      contactosTotal: sum("contactos"),
      duracionTotalMin: duracionTotal / 60,
      hsrProm: fmt1(sum("hsr") / n),
    };
  }, [filteredBip]);

  const bipPorJugador = useMemo(() => {
    const map = {};
    filteredBip.forEach(d => {
      if (!map[d.jugador]) map[d.jugador] = { jugador: d.jugador, puesto: d.puesto, secuencias: 0, distancia: 0, contactos: 0, acelsAlta: 0, hsr: 0, bigSum: 0, bigN: 0, duracion: 0, duracionMax: 0 };
      const r = map[d.jugador];
      r.secuencias += 1;
      r.distancia += d.distancia || 0;
      r.contactos += d.contactos || 0;
      r.acelsAlta += d.acelsAlta || 0;
      r.hsr += d.hsr || 0;
      if (d.big > 0) { r.bigSum += d.big; r.bigN += 1; }
      r.duracion += d.duracion || 0;
      r.duracionMax = Math.max(r.duracionMax, d.duracion || 0);
    });
    return Object.values(map).map(r => ({
      ...r,
      bigProm: r.bigN > 0 ? fmt1(r.bigSum / r.bigN) : 0,
      duracionProm: r.secuencias > 0 ? fmt1(r.duracion / r.secuencias) : 0,
    })).sort((a, b) => b.distancia - a.distancia);
  }, [filteredBip]);

  // Mts/min correcto: por cada jugador+partido, sumatoria de distancia de todas sus secuencias / duración total de ese partido para ese jugador.
  // Luego se promedian esos valores por puesto para el gráfico.
  // Mts/min = distancia total recorrida / tiempo total, agrupado por puesto
  // Mts/min = distancia total recorrida / duración total real del partido (sin duplicar por jugador)
  const bipDuracionTotalReal = useMemo(() => {
    const seen = new Set();
    let total = 0;
    filteredBip.forEach(d => {
      const key = `${d.partido}__${d.secuencia}`;
      if (seen.has(key)) return;
      seen.add(key);
      total += d.duracion || 0;
    });
    return total;
  }, [filteredBip]);

  // Secuencias de juego mayores a 1 minuto (60s): cantidad, minutos que suman, y % del BiP total
  const bipSecuenciasLargas = useMemo(() => {
    const seen = new Set();
    const uniqueSeqs = [];
    filteredBip.forEach(d => {
      const key = `${d.partido}__${d.secuencia}`;
      if (seen.has(key)) return;
      seen.add(key);
      uniqueSeqs.push(d.duracion || 0);
    });
    const totalSeg = uniqueSeqs.reduce((s, v) => s + v, 0);
    const largas = uniqueSeqs.filter(v => v >= 60);
    const cortas = uniqueSeqs.filter(v => v < 60);
    const segLargas = largas.reduce((s, v) => s + v, 0);
    const segCortas = cortas.reduce((s, v) => s + v, 0);
    return {
      totalSecuencias: uniqueSeqs.length,
      cantidadLargas: largas.length,
      minutosLargas: fmt1(segLargas / 60),
      pctLargas: totalSeg > 0 ? fmt1((segLargas / totalSeg) * 100) : 0,
      cantidadCortas: cortas.length,
      minutosCortas: fmt1(segCortas / 60),
      pctCortas: totalSeg > 0 ? fmt1((segCortas / totalSeg) * 100) : 0,
      chartData: [
        { categoria: "≤ 60 s", secuencias: cortas.length, minutos: fmt1(segCortas / 60) },
        { categoria: "> 60 s", secuencias: largas.length, minutos: fmt1(segLargas / 60) },
      ],
    };
  }, [filteredBip]);

  // Top 5 jugadores con más minutos acumulados en juego (Ball in Play)
  const bipTop5Minutos = useMemo(() =>
    [...bipPorJugador]
      .map(r => ({ jugador: r.jugador, puesto: r.puesto, minutos: fmt1(r.duracion / 60) }))
      .sort((a, b) => b.minutos - a.minutos)
      .slice(0, 5),
    [bipPorJugador]);

  // ---- Radar BiP: Distancia, Acels Alta, HSR, BiG, Contactos ----
  const BIP_RADAR_METRICS = [
    { key: "distancia", label: "Distancia" },
    { key: "acelsAlta", label: "Acels. Alta" },
    { key: "hsr", label: "HSR" },
    { key: "big", label: "BiG" },
    { key: "contactos", label: "Contactos" },
  ];
  const bipPercentile85 = (values) => {
    const nonZero = values.filter(v => v > 0).sort((a, b) => a - b);
    if (nonZero.length === 0) return 1;
    const idx = Math.min(nonZero.length - 1, Math.floor(0.85 * nonZero.length));
    return nonZero[idx] || 1;
  };
  const bipRadarRef = useMemo(() => {
    const ref = {};
    BIP_RADAR_METRICS.forEach(({ key }) => { ref[key] = bipPercentile85(bipData.map(d => d[key] || 0)) || 1; });
    return ref;
  }, [bipData]);

  const bipRadarMode = bipJugadorFilter.length > 0 ? "jugador" : (bipPartidoFilter.length > 0 ? "partido" : "equipo");
  const bipRadarGroups = useMemo(() => {
    if (bipRadarMode === "jugador") return bipJugadorFilter.slice(0, 6);
    if (bipRadarMode === "partido") return bipPartidoFilter.slice(0, 6);
    return ["Equipo"];
  }, [bipRadarMode, bipJugadorFilter, bipPartidoFilter]);

  const bipAvgForRows = (rows) => {
    const n = rows.length || 1;
    const sums = {};
    BIP_RADAR_METRICS.forEach(({ key }) => { sums[key] = 0; });
    rows.forEach(d => { BIP_RADAR_METRICS.forEach(({ key }) => { sums[key] += d[key] || 0; }); });
    const out = {};
    BIP_RADAR_METRICS.forEach(({ key }) => { out[key] = sums[key] / n; });
    return out;
  };

  const bipRadarData = useMemo(() => {
    const groupRows = {};
    bipRadarGroups.forEach(g => {
      groupRows[g] = bipRadarMode === "jugador"
        ? filteredBip.filter(d => d.jugador === g)
        : bipRadarMode === "partido"
        ? filteredBip.filter(d => d.partido === g)
        : filteredBip;
    });
    const groupAvgs = {};
    bipRadarGroups.forEach(g => { groupAvgs[g] = bipAvgForRows(groupRows[g]); });
    return BIP_RADAR_METRICS.map(({ key, label }) => {
      const row = { metric: label };
      bipRadarGroups.forEach(g => {
        const raw = groupAvgs[g][key] || 0;
        row[g] = fmt1(Math.min(100, (raw / bipRadarRef[key]) * 100));
        row[`${g}__raw`] = fmt1(raw);
      });
      return row;
    });
  }, [filteredBip, bipRadarRef, bipRadarGroups, bipRadarMode]);

  // BiG promedio por jugador (gráfico de línea)
  const bipBigPorJugadorLine = useMemo(() =>
    [...bipPorJugador].sort((a, b) => b.bigProm - a.bigProm).map(r => ({ jugador: r.jugador, bigProm: r.bigProm })),
    [bipPorJugador]);

  // BiG promedio por partido, comparando por jugador o por puesto (grupo)
  const bipBigPartidoMode = bipJugadorFilter.length > 0 ? "jugador" : (bipPuestoFilter.length > 0 ? "puesto" : "equipo");
  const bipBigPartidoGroups = useMemo(() => {
    if (bipBigPartidoMode === "jugador") return bipJugadorFilter.slice(0, 6);
    if (bipBigPartidoMode === "puesto") return bipPuestoFilter.slice(0, 6);
    return ["Equipo"];
  }, [bipBigPartidoMode, bipJugadorFilter, bipPuestoFilter]);

  const bipBigPorPartidoLine = useMemo(() => {
    const partidosOrdenados = Array.from(new Set(filteredBip.map(d => d.partido)));
    return partidosOrdenados.map(partido => {
      const row = { partido };
      bipBigPartidoGroups.forEach(g => {
        const rows = filteredBip.filter(d => d.partido === partido && (
          bipBigPartidoMode === "jugador" ? d.jugador === g :
          bipBigPartidoMode === "puesto" ? d.puesto === g : true
        ));
        const withBig = rows.filter(d => d.big > 0);
        row[g] = withBig.length ? fmt1(withBig.reduce((s, d) => s + d.big, 0) / withBig.length) : 0;
      });
      return row;
    });
  }, [filteredBip, bipBigPartidoGroups, bipBigPartidoMode]);

  // Duración de cada secuencia individual de juego, respetando los filtros de partido y jugador activos
  const bipSecuenciasDuracion = useMemo(() => {
    const seen = new Set();
    const out = [];
    filteredBip.forEach(d => {
      const key = `${d.partido}__${d.secuencia}`;
      if (seen.has(key)) return;
      seen.add(key);
      out.push({ partido: d.partido, secuencia: d.secuencia, duracion: fmt1(d.duracion || 0) });
    });
    const multiPartido = new Set(out.map(r => r.partido)).size > 1;
    return out
      .sort((a, b) => (a.partido + a.secuencia).localeCompare(b.partido + b.secuencia))
      .map(r => ({ ...r, label: multiPartido ? `${r.partido} · ${r.secuencia}` : r.secuencia }));
  }, [filteredBip]);

  // Duración total de Ball in Play por partido (minutos), contando cada secuencia una sola vez
  const bipDuracionPorPartido = useMemo(() => {
    const seen = new Set();
    const map = {};
    filteredBip.forEach(d => {
      const key = `${d.partido}__${d.secuencia}`;
      if (seen.has(key)) return;
      seen.add(key);
      map[d.partido] = (map[d.partido] || 0) + (d.duracion || 0);
    });
    return Object.entries(map)
      .map(([partido, seg]) => ({ partido, minutos: fmt1(seg / 60) }))
      .sort((a, b) => b.minutos - a.minutos);
  }, [filteredBip]);


  const actividadesCarga = useMemo(() => Array.from(new Set(cargaData.map(d => d.actividad).filter(Boolean))).sort(), [cargaData]);
  const temporadas = useMemo(() => ["Todas", ...Array.from(new Set(cargaData.map(d => d.temporada))).sort()], [cargaData]);
  const parseFecha = (f) => { const [d, m, y] = f.split("/").map(Number); return new Date(y, m - 1, d); };
  const fechasCarga = useMemo(() => ["Todos", ...Array.from(new Set(cargaData.map(d => d.fecha))).sort((a, b) => parseFecha(a) - parseFecha(b))], [cargaData]);

  const getWeekStart = (fechaStr) => {
    const d = parseFecha(fechaStr);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(d);
    monday.setDate(d.getDate() + diff);
    return monday;
  };
  const weekLabel = (monday) => `Sem. ${String(monday.getDate()).padStart(2, "0")}/${String(monday.getMonth() + 1).padStart(2, "0")}`;

  const [semanaFilter, setSemanaFilter] = useState([]);
  const toggleSemana = (s) => setSemanaFilter(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const semanasCarga = useMemo(() => {
    const map = {};
    cargaData.forEach(d => { const m = getWeekStart(d.fecha); map[weekLabel(m)] = m.getTime(); });
    return Object.keys(map).sort((a, b) => map[a] - map[b]);
  }, [cargaData]);

  const filteredCarga = useMemo(() => cargaDataClean.filter(d => {
    if (puestoFilter.length > 0 && !puestoFilter.includes(d.puesto)) return false;
    if (etiquetaFilter !== "Todos" && d.etiqueta !== etiquetaFilter) return false;
    if (jugadorFilter.length > 0 && !jugadorFilter.includes(d.jugador)) return false;
    if (actividadFilter.length > 0 && !actividadFilter.includes(d.actividad)) return false;
    if (temporadaFilter !== "Todas" && d.temporada !== temporadaFilter) return false;
    if (periodoFilter !== "Todos" && d.periodo !== periodoFilter) return false;
    if (semanaFilter.length > 0 && !semanaFilter.includes(weekLabel(getWeekStart(d.fecha)))) return false;
    if (fechaModo === "especifica" && fechaFilter !== "Todos" && d.fecha !== fechaFilter) return false;
    if (fechaModo === "rango" && (fechaDesde || fechaHasta)) {
      const fd = parseFecha(d.fecha);
      if (fechaDesde && fd < new Date(fechaDesde)) return false;
      if (fechaHasta && fd > new Date(fechaHasta)) return false;
    }
    return true;
  }), [cargaDataClean, puestoFilter, etiquetaFilter, jugadorFilter, actividadFilter, temporadaFilter, periodoFilter, semanaFilter, fechaModo, fechaFilter, fechaDesde, fechaHasta]);

  // Igual a filteredCarga pero SIN aplicar el filtro de Periodo: así "Detalle por sesión" siempre muestra todos los períodos de la actividad seleccionada
  const filteredCargaTodosPeriodos = useMemo(() => cargaDataClean.filter(d => {
    if (puestoFilter.length > 0 && !puestoFilter.includes(d.puesto)) return false;
    if (etiquetaFilter !== "Todos" && d.etiqueta !== etiquetaFilter) return false;
    if (jugadorFilter.length > 0 && !jugadorFilter.includes(d.jugador)) return false;
    if (actividadFilter.length > 0 && !actividadFilter.includes(d.actividad)) return false;
    if (temporadaFilter !== "Todas" && d.temporada !== temporadaFilter) return false;
    if (semanaFilter.length > 0 && !semanaFilter.includes(weekLabel(getWeekStart(d.fecha)))) return false;
    if (fechaModo === "especifica" && fechaFilter !== "Todos" && d.fecha !== fechaFilter) return false;
    if (fechaModo === "rango" && (fechaDesde || fechaHasta)) {
      const fd = parseFecha(d.fecha);
      if (fechaDesde && fd < new Date(fechaDesde)) return false;
      if (fechaHasta && fd > new Date(fechaHasta)) return false;
    }
    return true;
  }), [cargaDataClean, puestoFilter, etiquetaFilter, jugadorFilter, actividadFilter, temporadaFilter, semanaFilter, fechaModo, fechaFilter, fechaDesde, fechaHasta]);


  const totalDistancia = filteredCarga.reduce((s, d) => s + d.distancia, 0);
  const sesiones = new Set(filteredCarga.map(d => d.fecha + d.periodo)).size;
  const maxVelReg = filteredCarga.reduce((m, d) => Math.max(m, d.maxVel), 0);
  const jugadoresMonitoreados = new Set(filteredCarga.map(d => d.jugador)).size;

  const porFecha = useMemo(() => {
    const map = {};
    filteredCarga.forEach(d => {
      if (!map[d.fecha]) map[d.fecha] = { total: 0, actividad: d.actividad, hasPartido: false };
      map[d.fecha].total += d.distancia;
      if (d.etiqueta === "Partido" && !map[d.fecha].hasPartido) {
        map[d.fecha].actividad = d.actividad;
        map[d.fecha].hasPartido = true;
      }
    });
    return Object.entries(map).map(([fecha, v]) => ({ fecha, actividad: v.actividad || fecha, distancia: Math.round(v.total) }))
      .sort((a, b) => {
        const [da, ma, ya] = a.fecha.split("/").map(Number);
        const [db, mb, yb] = b.fecha.split("/").map(Number);
        return new Date(ya, ma - 1, da) - new Date(yb, mb - 1, db);
      });
  }, [filteredCarga]);

  const porPuesto = useMemo(() => {
    const map = {};
    filteredCarga.forEach(d => {
      if (!map[d.puesto]) map[d.puesto] = { total: 0, n: 0 };
      map[d.puesto].total += d.distancia;
      map[d.puesto].n += 1;
    });
    return POS_ORDER.filter(p => map[p]).map(p => ({ puesto: p, distancia: fmt1(map[p].total / map[p].n) }));
  }, [filteredCarga]);

  const topJugadores = useMemo(() => {
    const map = {};
    filteredCarga.forEach(d => {
      map[d.jugador] = (map[d.jugador] || 0) + d.distancia;
    });
    return Object.entries(map).map(([jugador, distancia]) => ({ jugador, distancia: Math.round(distancia) }))
      .sort((a, b) => b.distancia - a.distancia).slice(0, 10);
  }, [filteredCarga]);

  const avgDistanciaPorFecha = useMemo(() => porFecha.length ? Math.round(porFecha.reduce((s, d) => s + d.distancia, 0) / porFecha.length) : 0, [porFecha]);

  const SCATTER_PALETTE = ["#0D9488", "#2563EB", "#7C3AED", "#0891B2", "#0284C7", "#059669", "#DB2777", "#4F46E5", "#0EA5E9", "#65A30D", "#9333EA"];
  const puestosEnDatos = useMemo(() => POS_ORDER.filter(p => filteredCarga.some(d => d.puesto === p)), [filteredCarga]);
  const puestoColor = (puesto) => SCATTER_PALETTE[Math.max(0, puestosEnDatos.indexOf(puesto)) % SCATTER_PALETTE.length];

  const scatterData = useMemo(() => {
    const base = filteredCarga.filter(d => d.distancia > 0);
    if (base.length === 0) return [];
    const maxOf = (key) => {
      const mx = Math.max(...base.map(d => d[key] || 0));
      return mx > 0 ? mx : 1;
    };
    const refs = { distancia: maxOf("distancia"), contactos: maxOf("contactos"), esfExp: maxOf("esfExp"), rhie: maxOf("rhie"), hsr: maxOf("hsr"), big: maxOf("big") };
    return base.map(d => {
      const nContactos = (d.contactos || 0) / refs.contactos;
      const nDistancia = (d.distancia || 0) / refs.distancia;
      const nEsfExp = (d.esfExp || 0) / refs.esfExp;
      const nRhie = (d.rhie || 0) / refs.rhie;
      const nHsr = (d.hsr || 0) / refs.hsr;
      const nBigInv = refs.big > 0 ? Math.max(0, (refs.big - (d.big || 0)) / refs.big) : 0;
      const indiceExigencia = Math.round(((nContactos + nDistancia + nEsfExp + nRhie + nHsr + nBigInv) / 6) * 100);
      return {
        indiceExigencia: isNaN(indiceExigencia) ? 0 : indiceExigencia, contactos: d.contactos, puesto: d.puesto, jugador: d.jugador,
        fecha: d.fecha, actividad: d.actividad, etiqueta: d.etiqueta, periodo: d.periodo, distancia: d.distancia, maxVel: d.maxVel, hsr: d.hsr, esfExp: d.esfExp, big: d.big,
      };
    });
  }, [filteredCarga]);
  const avgIndiceExigencia = useMemo(() => scatterData.length ? fmt1(scatterData.reduce((s, d) => s + d.indiceExigencia, 0) / scatterData.length) : 0, [scatterData]);
  const avgContactos = useMemo(() => scatterData.length ? fmt1(scatterData.reduce((s, d) => s + d.contactos, 0) / scatterData.length) : 0, [scatterData]);

  // Top 3 partidos con mayor Índice de Exigencia por cada jugador seleccionado
  // Índice de Exigencia (solo Partidos) — por jugador: el 100% es el MEJOR partido de ESE jugador, el resto es relativo a esa marca personal
  // Índice de Exigencia (SOLO Partidos): primero se arma un score compuesto normalizando cada métrica
  // contra la población de partidos, y luego ese score se reescala para que el MEJOR partido de cada
  // jugador (o de cada puesto) sea el 100% de referencia. Se recalcula solo con los datos disponibles,
  // así que a medida que se cargan más partidos el índice se va actualizando.
  const partidosScoreBase = useMemo(() => {
    const base = cargaDataClean.filter(d =>
      d.etiqueta === "Partido" && d.periodo === "Session" && d.distancia > 0 &&
      (temporadaFilter === "Todas" || d.temporada === temporadaFilter)
    );
    if (base.length === 0) return [];
    const maxOf = (key) => { const mx = Math.max(...base.map(d => d[key] || 0)); return mx > 0 ? mx : 1; };
    const refs = { distancia: maxOf("distancia"), contactos: maxOf("contactos"), esfExp: maxOf("esfExp"), rhie: maxOf("rhie"), hsr: maxOf("hsr"), big: maxOf("big") };
    return base.map(d => {
      const nContactos = (d.contactos || 0) / refs.contactos;
      const nDistancia = (d.distancia || 0) / refs.distancia;
      const nEsfExp = (d.esfExp || 0) / refs.esfExp;
      const nRhie = (d.rhie || 0) / refs.rhie;
      const nHsr = (d.hsr || 0) / refs.hsr;
      const nBigInv = refs.big > 0 ? Math.max(0, (refs.big - (d.big || 0)) / refs.big) : 0;
      const score = (nContactos + nDistancia + nEsfExp + nRhie + nHsr + nBigInv) / 6;
      return { ...d, score: isNaN(score) ? 0 : score };
    });
  }, [cargaDataClean, temporadaFilter]);

  const jugadorTopPartidos = useMemo(() => {
    if (jugadorFilter.length === 0) return [];
    return jugadorFilter.map(jug => {
      const rows = partidosScoreBase.filter(d => d.jugador === jug);
      if (rows.length === 0) return { jugador: jug, partidos: [] };
      const mejorScore = Math.max(...rows.map(d => d.score)) || 1;
      const partidos = rows
        .map(d => ({ ...d, indiceExigencia: Math.round((d.score / mejorScore) * 100) }))
        .sort((a, b) => b.indiceExigencia - a.indiceExigencia)
        .slice(0, 3);
      return { jugador: jug, partidos };
    }).filter(r => r.partidos.length > 0);
  }, [partidosScoreBase, jugadorFilter]);

  // ---- Radar "Sesiones" + tabla comparativa vs. mejor Índice de Exigencia, con magnitud SWC ----
  const [radarJugadorSel, setRadarJugadorSel] = useState("");
  const [radarPartidosSel, setRadarPartidosSel] = useState([]);
  const toggleRadarPartido = (p) => setRadarPartidosSel(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  const radarJugadoresDisponibles = useMemo(() => Array.from(new Set(partidosScoreBase.map(d => d.jugador))).sort(), [partidosScoreBase]);

  const radarJugadorRows = useMemo(() => {
    if (!radarJugadorSel) return [];
    const rows = partidosScoreBase.filter(d => d.jugador === radarJugadorSel);
    if (rows.length === 0) return [];
    const mejorScore = Math.max(...rows.map(d => d.score)) || 1;
    return rows
      .map(d => ({ ...d, indiceExigencia: Math.round((d.score / mejorScore) * 100), sesionLabel: `${d.actividad} (${d.fecha})` }))
      .sort((a, b) => parseFecha(b.fecha) - parseFecha(a.fecha));
  }, [partidosScoreBase, radarJugadorSel]);

  const radarPartidosOpciones = useMemo(() => radarJugadorRows.map(d => d.sesionLabel), [radarJugadorRows]);

  const radarJugadorStats = useMemo(() => {
    if (radarJugadorRows.length === 0) return { mejor: 0, media: 0, sd: 1 };
    const valores = radarJugadorRows.map(d => d.indiceExigencia);
    const mejor = Math.max(...valores);
    const media = fmt1(valores.reduce((s, v) => s + v, 0) / valores.length);
    const meanRaw = valores.reduce((s, v) => s + v, 0) / valores.length;
    const variance = valores.length > 1 ? valores.reduce((s, v) => s + (v - meanRaw) * (v - meanRaw), 0) / (valores.length - 1) : 0;
    const sd = Math.sqrt(variance) || 1;
    return { mejor, media, sd };
  }, [radarJugadorRows]);

  const radarSesionesData = useMemo(() => {
    const source = radarPartidosSel.length > 0 ? radarJugadorRows.filter(d => radarPartidosSel.includes(d.sesionLabel)) : radarJugadorRows;
    return source.map(d => ({
      sesion: d.sesionLabel,
      indice: d.indiceExigencia,
      "Mejor performance": radarJugadorStats.mejor,
      "Performance media": radarJugadorStats.media,
    }));
  }, [radarJugadorRows, radarPartidosSel, radarJugadorStats]);

  // Magnitud SWC (escala Hopkins): Trivial < 0.2 | Baja 0.2–0.6 | Moderada 0.6–1.2 | Alta 1.2–2.0 | Muy alta > 2.0
  const swcMagnitude = (deltaSwc) => {
    const a = Math.abs(deltaSwc);
    if (a < 0.2) return { label: "Trivial", color: COLORS.turf };
    if (a < 0.6) return { label: "Baja", color: "#FACC15" };
    if (a < 1.2) return { label: "Moderada", color: "#FB923C" };
    if (a < 2.0) return { label: "Alta", color: COLORS.red };
    return { label: "Muy alta", color: "#B91C1C" };
  };

  const radarComparacionTabla = useMemo(() => {
    const source = radarPartidosSel.length > 0 ? radarJugadorRows.filter(d => radarPartidosSel.includes(d.sesionLabel)) : radarJugadorRows;
    const swcUnit = radarJugadorStats.sd * 0.2 || 1;
    return source.map(d => {
      const delta = d.indiceExigencia - radarJugadorStats.mejor;
      const deltaSwc = delta / swcUnit;
      return { ...d, delta: fmt1(delta), magnitud: swcMagnitude(deltaSwc) };
    });
  }, [radarJugadorRows, radarPartidosSel, radarJugadorStats]);

  // Índice de Exigencia (solo Partidos) — por puesto: el 100% es la MEJOR marca registrada en ese puesto
  const indiceExigenciaPorPuesto = useMemo(() => {
    if (partidosScoreBase.length === 0) return [];
    const puestosSet = Array.from(new Set(partidosScoreBase.map(d => d.puesto)));
    return puestosSet.map(puesto => {
      const rows = partidosScoreBase.filter(d => d.puesto === puesto);
      const mejorScore = Math.max(...rows.map(d => d.score)) || 1;
      const indices = rows.map(d => (d.score / mejorScore) * 100);
      const avg = indices.length ? indices.reduce((s, v) => s + v, 0) / indices.length : 0;
      return { puesto, indice: fmt1(avg), partidos: rows.length };
    }).sort((a, b) => b.indice - a.indice);
  }, [partidosScoreBase]);



  const cargaRadarMetrics = [
    { key: "distancia", label: "Distancia" },
    { key: "hsr", label: "HSR" },
    { key: "big", label: "BiG (↓mejor)" },
    { key: "rhie", label: "RHIE" },
    { key: "esfExp", label: "Esf. Explosivos" },
    { key: "contactos", label: "Contactos" },
  ];
  const percentile85 = (values) => {
    const nonZero = values.filter(v => v > 0).sort((a, b) => a - b);
    if (nonZero.length === 0) return 1;
    const idx = Math.min(nonZero.length - 1, Math.floor(0.85 * nonZero.length));
    return nonZero[idx] || 1;
  };
  const cargaRadarRef = useMemo(() => {
    const sessionRows = cargaDataClean.filter(d => d.periodo === "Session");
    const ref = {};
    cargaRadarMetrics.forEach(({ key }) => {
      ref[key] = percentile85(sessionRows.map(d => d[key] || 0)) || 1;
    });
    return ref;
  }, [cargaDataClean]);

  const RADAR_COLORS = [COLORS.turf, "#2563EB", COLORS.blue, "#7C3AED", "#0891B2", "#DB2777"];

  const cargaRadarMode = jugadorFilter.length > 0 ? "jugador" : (puestoFilter.length > 0 ? "puesto" : "plantel");
  const cargaRadarGroups = useMemo(() => {
    if (cargaRadarMode === "jugador") return jugadorFilter.slice(0, 6);
    if (cargaRadarMode === "puesto") return puestoFilter.slice(0, 6);
    return ["Plantel"];
  }, [cargaRadarMode, jugadorFilter, puestoFilter]);

  const avgForRows = (rows) => {
    const sessionRows = rows.filter(d => d.periodo === "Session");
    const use = sessionRows.length > 0 ? sessionRows : rows;
    const n = use.length || 1;
    const sums = {};
    cargaRadarMetrics.forEach(({ key }) => { sums[key] = 0; });
    use.forEach(d => { cargaRadarMetrics.forEach(({ key }) => { sums[key] += d[key] || 0; }); });
    const out = {};
    cargaRadarMetrics.forEach(({ key }) => { out[key] = sums[key] / n; });
    out.__n = use.length;
    return out;
  };

  const cargaRadarData = useMemo(() => {
    const groupRows = {};
    cargaRadarGroups.forEach(g => {
      groupRows[g] = cargaRadarMode === "jugador"
        ? filteredCarga.filter(d => d.jugador === g)
        : cargaRadarMode === "puesto"
        ? filteredCarga.filter(d => d.puesto === g)
        : filteredCarga;
    });
    const groupAvgs = {};
    cargaRadarGroups.forEach(g => { groupAvgs[g] = avgForRows(groupRows[g]); });
    return cargaRadarMetrics.map(({ key, label }) => {
      const row = { metric: label };
      cargaRadarGroups.forEach(g => {
        const raw = groupAvgs[g][key] || 0;
        row[g] = fmt1(Math.min(100, (raw / cargaRadarRef[key]) * 100));
        row[`${g}__raw`] = fmt1(raw);
      });
      return row;
    });
  }, [filteredCarga, cargaRadarRef, cargaRadarGroups, cargaRadarMode]);

  // Línea de referencia: mejores marcas del/los puesto(s) relevante(s), en Partidos con >=60 min jugados
  const cargaRadarBenchmarkPuestos = useMemo(() => {
    if (cargaRadarMode === "puesto") return puestoFilter.slice(0, 6);
    if (cargaRadarMode === "jugador") {
      const set = new Set();
      jugadorFilter.forEach(j => {
        const row = cargaDataClean.find(d => d.jugador === j);
        if (row) set.add(row.puesto);
      });
      return Array.from(set);
    }
    return [];
  }, [cargaRadarMode, puestoFilter, jugadorFilter, cargaDataClean]);

  const cargaRadarBenchmark = useMemo(() => {
    if (cargaRadarBenchmarkPuestos.length === 0) return null;
    const base = cargaDataClean.filter(d => d.etiqueta === "Partido" && d.periodo === "Session" && d.duracionMin >= 60 && cargaRadarBenchmarkPuestos.includes(d.puesto));
    if (base.length === 0) return null;
    const best = {};
    cargaRadarMetrics.forEach(({ key }) => { best[key] = Math.max(...base.map(d => d[key] || 0)); });
    return best;
  }, [cargaRadarBenchmarkPuestos, cargaDataClean]);

  const cargaRadarDataWithBenchmark = useMemo(() => {
    if (!cargaRadarBenchmark) return cargaRadarData;
    return cargaRadarData.map((row, i) => {
      const key = cargaRadarMetrics[i].key;
      const raw = cargaRadarBenchmark[key] || 0;
      return { ...row, "Mejor marca": fmt1(Math.min(100, (raw / cargaRadarRef[key]) * 100)), "Mejor marca__raw": fmt1(raw) };
    });
  }, [cargaRadarData, cargaRadarBenchmark, cargaRadarRef]);

  const partidosExigentes = useMemo(() => {
    try {
      const source = cargaDataClean.filter(d => d.etiqueta === "Partido" && d.periodo === "Session" && (temporadaFilter === "Todas" || d.temporada === temporadaFilter));
      const byFecha = {};
      source.forEach(d => {
        if (!byFecha[d.fecha]) byFecha[d.fecha] = { fecha: d.fecha, actividad: d.actividad, temporada: d.temporada, distancia: 0, contactos: 0, esfExp: 0, rhie: 0, big: 0, hsr: 0, n: 0 };
        const r = byFecha[d.fecha];
        r.distancia += (d.distancia || 0); r.contactos += (d.contactos || 0); r.esfExp += (d.esfExp || 0); r.rhie += (d.rhie || 0); r.big += (d.big || 0); r.hsr += (d.hsr || 0); r.n += 1;
      });
      const matches = Object.values(byFecha).map(r => ({
        fecha: r.fecha, actividad: r.actividad || "Partido", temporada: r.temporada, jugadores: r.n,
        avgDistancia: r.n ? r.distancia / r.n : 0,
        avgContactos: r.n ? r.contactos / r.n : 0,
        avgEsfExp: r.n ? r.esfExp / r.n : 0,
        avgRhie: r.n ? r.rhie / r.n : 0,
        avgBig: r.n ? r.big / r.n : 0,
        avgHsr: r.n ? r.hsr / r.n : 0,
      }));
      if (matches.length === 0) return [];
      const maxOf = (key) => {
        const vals = matches.map(m => m[key]).filter(v => typeof v === "number" && !isNaN(v));
        if (vals.length === 0) return 1;
        const mx = Math.max(...vals);
        return mx > 0 ? mx : 1;
      };
      const refs = { avgDistancia: maxOf("avgDistancia"), avgContactos: maxOf("avgContactos"), avgEsfExp: maxOf("avgEsfExp"), avgRhie: maxOf("avgRhie"), avgBig: maxOf("avgBig"), avgHsr: maxOf("avgHsr") };
      return matches.map(m => {
        const nContactos = refs.avgContactos ? m.avgContactos / refs.avgContactos : 0;
        const nDistancia = refs.avgDistancia ? m.avgDistancia / refs.avgDistancia : 0;
        const nEsfExp = refs.avgEsfExp ? m.avgEsfExp / refs.avgEsfExp : 0;
        const nRhie = refs.avgRhie ? m.avgRhie / refs.avgRhie : 0;
        const nHsr = refs.avgHsr ? m.avgHsr / refs.avgHsr : 0;
        const nBigInv = refs.avgBig > 0 ? Math.max(0, (refs.avgBig - m.avgBig) / refs.avgBig) : 0; // BiG: menor = mejor performance -> se invierte
        const score = Math.round(((nContactos + nDistancia + nEsfExp + nRhie + nHsr + nBigInv) / 6) * 100);
        return { ...m, score: isNaN(score) ? 0 : score };
      }).sort((a, b) => b.score - a.score).slice(0, 5);
    } catch (err) {
      return [];
    }
  }, [cargaDataClean, temporadaFilter]);

  const tablaJugadores = useMemo(() => {
    const map = {};
    filteredCarga.forEach(d => {
      if (!map[d.jugador]) map[d.jugador] = { jugador: d.jugador, puesto: d.puesto, sesiones: 0, distanciaTotal: 0, maxVel: 0, hsrTotal: 0, contactosTotal: 0, bigTotal: 0 };
      const r = map[d.jugador];
      r.sesiones += 1;
      r.distanciaTotal += d.distancia;
      r.maxVel = Math.max(r.maxVel, d.maxVel);
      r.hsrTotal += d.hsr;
      r.contactosTotal += (d.contactos || 0);
      r.bigTotal += (d.big || 0);
    });
    const indiceMap = {};
    scatterData.forEach(d => {
      if (!indiceMap[d.jugador]) indiceMap[d.jugador] = { sum: 0, n: 0 };
      indiceMap[d.jugador].sum += d.indiceExigencia;
      indiceMap[d.jugador].n += 1;
    });
    Object.values(map).forEach(r => {
      const idx = indiceMap[r.jugador];
      r.indiceExigencia = idx && idx.n > 0 ? Math.round(idx.sum / idx.n) : 0;
      r.bigProm = r.sesiones > 0 ? fmt1(r.bigTotal / r.sesiones) : 0;
    });
    return Object.values(map).sort((a, b) => b.distanciaTotal - a.distanciaTotal);
  }, [filteredCarga, scatterData]);

  // Detalle sesión por sesión (respeta todos los filtros activos, útil sobre todo al filtrar por jugador)
  const detalleSesiones = useMemo(() => {
    const source = detallePeriodosSel.length > 0
      ? filteredCargaTodosPeriodos.filter(d => detallePeriodosSel.includes(d.periodo))
      : filteredCargaTodosPeriodos;
    return [...source]
      .sort((a, b) => {
        const df = parseFecha(b.fecha) - parseFecha(a.fecha);
        if (df !== 0) return df;
        const dj = a.jugador.localeCompare(b.jugador);
        if (dj !== 0) return dj;
        const da = (a.actividad || "").localeCompare(b.actividad || "");
        if (da !== 0) return da;
        return (a.periodo || "").localeCompare(b.periodo || "");
      })
      .map(d => ({
        jugador: d.jugador, fecha: d.fecha, actividad: d.actividad, puesto: d.puesto,
        etiqueta: d.etiqueta, periodo: d.periodo, distancia: d.distancia, maxVel: d.maxVel, hsr: d.hsr,
        contactos: d.contactos, big: d.big,
      }));
  }, [filteredCargaTodosPeriodos, detallePeriodosSel]);

  // Agregación semanal (semana = lunes a domingo) para Distancia total y Esf. Explosivos
  const cargaPorSemana = useMemo(() => {
    const map = {};
    filteredCarga.forEach(d => {
      const monday = getWeekStart(d.fecha);
      const key = monday.getTime();
      if (!map[key]) map[key] = { key, monday, distancia: 0, esfExp: 0 };
      map[key].distancia += d.distancia || 0;
      map[key].esfExp += d.esfExp || 0;
    });
    return Object.values(map)
      .sort((a, b) => a.key - b.key)
      .map(r => ({
        semana: weekLabel(r.monday),
        distancia: Math.round(r.distancia),
        esfExp: fmt1(r.esfExp),
      }));
  }, [filteredCarga]);

  return (
    <div id="sic-dashboard-root" style={{ background: COLORS.bg, minHeight: "100%", fontFamily: "Inter, sans-serif", padding: "28px 24px 40px", color: COLORS.chalk }}>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap");
        * { box-sizing: border-box; }
        select { -webkit-appearance: none; appearance: none; }
        table { border-collapse: collapse; width: 100%; }
        th, td { text-align: left; padding: 9px 12px; font-size: 12.5px; }
        tbody tr:hover { background: ${COLORS.surfaceAlt}; }
        ::-webkit-scrollbar { height: 6px; width: 6px; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.line}; border-radius: 3px; }
        .spin-icon { animation: spin828 0.9s linear infinite; }
        @keyframes spin828 { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media print {
          @page { size: landscape; margin: 10mm; }
          .no-print { display: none !important; }
          * { background: #ffffff !important; background-color: #ffffff !important; color: #111111 !important; box-shadow: none !important; border-color: #cccccc !important; }
          body, html { background: #ffffff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .dash-header { margin-bottom: 12px !important; }
          .print-expand { max-height: none !important; overflow: visible !important; }
          /* Los gráficos (SVG) usan fill/stroke, no color/background, así que mantienen sus colores para que los datos sigan siendo legibles */
        }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 20 }} className="dash-header">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img src={LOGO_SRC} alt="San Isidro Club" style={{ height: 52, width: 52, objectFit: "contain", flexShrink: 0 }} />
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: COLORS.turf, letterSpacing: "0.12em", marginBottom: 4 }}>SIC · RENDIMIENTO DEPORTIVO</div>
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 38, fontWeight: 700, margin: 0, letterSpacing: "0.01em" }}>Análisis del rendimiento</h1>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }} className="no-print">
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: COLORS.muted, display: "flex", alignItems: "center", gap: 5, maxWidth: 260 }}>
            <CheckCircle2 size={13} color={COLORS.turf} />
            Datos actualizados: {BUILD_TIMESTAMP}
          </div>
          <div style={{ position: "relative" }}>
            <button onClick={handleExportPDF} style={{
              display: "flex", alignItems: "center", gap: 7, padding: "9px 14px", borderRadius: 9, cursor: "pointer",
              background: COLORS.surface, color: COLORS.chalk, border: `1px solid ${COLORS.turfDim}`,
              fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 13
            }}>
              <FileDown size={14} color={COLORS.turf} />
              Exportar PDF
            </button>
            {exportMsg && (
              <div style={{ position: "absolute", top: "115%", right: 0, zIndex: 30, background: COLORS.surfaceAlt, border: `1px solid ${COLORS.turfDim}`, borderRadius: 8, padding: "8px 12px", fontSize: 11.5, color: COLORS.chalk, fontFamily: "Inter, sans-serif", width: 240, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
                {exportMsg}
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 6, background: COLORS.surface, padding: 4, borderRadius: 10, border: `1px solid ${COLORS.line}` }}>
            {[["carga", "Carga (GPS)", Activity], ["bip", "Ball in Play", Radio], ["nutri", "Nutrición", Apple], ["bienestar", "Bienestar", HeartPulse]].map(([key, lab, Icon]) => (
              <button key={key} onClick={() => setTab(key)} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 7, border: "none", cursor: "pointer",
                background: tab === key ? COLORS.turf : "transparent", color: tab === key ? COLORS.bg : COLORS.muted,
                fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 13, transition: "all 0.15s"
              }}>
                <Icon size={14} strokeWidth={2.5} /> {lab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {tab === "carga" && (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
            <StatCard icon={MapPin} label="Distancia Total" value={(totalDistancia/1000).toFixed(1)} unit="km" />
            <StatCard icon={Activity} label="Sesiones Registradas" value={sesiones} unit="" accent={COLORS.blue} />
            <StatCard icon={Zap} label="Vel. Máxima Registrada" value={fmt1(maxVelReg)} unit="km/h" accent={COLORS.amber} />
            <StatCard icon={Users} label="Jugadores Monitoreados" value={jugadoresMonitoreados} unit="" />
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }} className="no-print">
            <Filter size={14} color={COLORS.muted} />
            <select value={temporadaFilter} onChange={e => setTemporadaFilter(e.target.value)} style={{ background: COLORS.surface, color: COLORS.chalk, border: `1px solid ${COLORS.turfDim}`, borderRadius: 7, padding: "7px 10px", fontSize: 12.5, fontFamily: "Inter, sans-serif", fontWeight: 600 }}>
              {temporadas.map(t => <option key={t} value={t}>{t === "Todas" ? "Todas las temporadas" : `Temporada ${t}`}</option>)}
            </select>
            <MultiSelect options={puestos} selected={puestoFilter} onToggle={togglePuesto} onClear={() => setPuestoFilter([])} colors={COLORS} allLabel="Todos los puestos" singularLabel="puesto" minWidth={140} />
            <select value={periodoFilter} onChange={e => setPeriodoFilter(e.target.value)} style={{ background: COLORS.surface, color: COLORS.chalk, border: `1px solid ${COLORS.line}`, borderRadius: 7, padding: "7px 10px", fontSize: 12.5, fontFamily: "Inter, sans-serif" }}>
              {periodos.map(p => <option key={p} value={p}>{p === "Todos" ? "Todos los períodos" : p}</option>)}
            </select>
            <div style={{ display: "flex", gap: 4, background: COLORS.surface, padding: 3, borderRadius: 8, border: `1px solid ${COLORS.line}` }}>
              {["Todos", ...etiquetas.filter(e => e !== "Todos")].map(opt => (
                <button key={opt} onClick={() => setEtiquetaFilter(opt)} style={{
                  display: "flex", alignItems: "center", gap: 5, padding: "6px 11px", borderRadius: 6, border: "none", cursor: "pointer",
                  background: etiquetaFilter === opt ? COLORS.turf : "transparent",
                  color: etiquetaFilter === opt ? COLORS.bg : COLORS.muted,
                  fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 12.5, whiteSpace: "nowrap"
                }}>
                  {opt === "Partido" ? "🏉 Partidos" : opt === "Entrenamiento" ? "Entrenamientos" : "Todos"}
                </button>
              ))}
            </div>
            <MultiSelect options={actividadesCarga} selected={actividadFilter} onToggle={toggleActividad} onClear={() => setActividadFilter([])} colors={COLORS} allLabel="Todas las actividades" singularLabel="actividad" minWidth={170} searchable={true} />
            <MultiSelect options={jugadoresCarga} selected={jugadorFilter} onToggle={toggleJugador} onClear={() => setJugadorFilter([])} colors={COLORS} allLabel="Todos los jugadores" singularLabel="jugador" minWidth={160} searchable={true} />
            <MultiSelect options={semanasCarga} selected={semanaFilter} onToggle={toggleSemana} onClear={() => setSemanaFilter([])} colors={COLORS} allLabel="Todas las semanas" singularLabel="semana" minWidth={150} searchable={true} />
            <select value={fechaModo} onChange={e => setFechaModo(e.target.value)} style={{ background: COLORS.surface, color: COLORS.chalk, border: `1px solid ${COLORS.line}`, borderRadius: 7, padding: "7px 10px", fontSize: 12.5, fontFamily: "Inter, sans-serif" }}>
              <option value="todas">Todas las fechas</option>
              <option value="especifica">Fecha específica</option>
              <option value="rango">Rango de fechas</option>
            </select>
            {fechaModo === "especifica" && (
              <select value={fechaFilter} onChange={e => setFechaFilter(e.target.value)} style={{ background: COLORS.surface, color: COLORS.chalk, border: `1px solid ${COLORS.line}`, borderRadius: 7, padding: "7px 10px", fontSize: 12.5, fontFamily: "Inter, sans-serif" }}>
                {fechasCarga.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            )}
            {fechaModo === "rango" && (
              <>
                <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} style={{ background: COLORS.surface, color: COLORS.chalk, border: `1px solid ${COLORS.line}`, borderRadius: 7, padding: "6px 10px", fontSize: 12.5, fontFamily: "Inter, sans-serif" }} />
                <span style={{ color: COLORS.muted, fontSize: 12 }}>a</span>
                <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} style={{ background: COLORS.surface, color: COLORS.chalk, border: `1px solid ${COLORS.line}`, borderRadius: 7, padding: "6px 10px", fontSize: 12.5, fontFamily: "Inter, sans-serif" }} />
              </>
            )}
            {(jugadorFilter.length > 0 || actividadFilter.length > 0 || semanaFilter.length > 0 || fechaModo !== "todas" || puestoFilter.length > 0 || etiquetaFilter !== "Todos" || temporadaFilter !== "Todas" || periodoFilter !== "Todos") && (
              <button onClick={() => { setJugadorFilter([]); setActividadFilter([]); setSemanaFilter([]); setFechaModo("todas"); setFechaFilter("Todos"); setFechaDesde(""); setFechaHasta(""); setPuestoFilter([]); setEtiquetaFilter("Todos"); setTemporadaFilter("Todas"); setPeriodoFilter("Todos"); }} style={{ background: "transparent", color: COLORS.turf, border: `1px solid ${COLORS.turfDim}`, borderRadius: 7, padding: "7px 12px", fontSize: 12, fontFamily: "Inter, sans-serif", cursor: "pointer" }}>
                Limpiar filtros
              </button>
            )}
          </div>

          <YardDivider />

          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, marginBottom: 16 }}>
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 18 }}>
              <SectionLabel>Distancia total por fecha</SectionLabel>
              <ResponsiveContainer width="100%" height={230}>
                <AreaChart data={porFecha}>
                  <defs>
                    <linearGradient id="distGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.turf} stopOpacity={0.5} />
                      <stop offset="100%" stopColor={COLORS.turf} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={COLORS.line} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="actividad" tick={{ fill: COLORS.muted, fontSize: 9 }} axisLine={{ stroke: COLORS.line }} tickLine={false} angle={-40} textAnchor="end" height={60} interval={Math.max(0, Math.ceil(porFecha.length / 18) - 1)} />
                  <YAxis tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const p = payload[0].payload;
                    return (
                      <div style={{ background: COLORS.surfaceAlt, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "8px 12px", fontFamily: "Inter, sans-serif", fontSize: 12 }}>
                        <div style={{ color: COLORS.chalk, fontWeight: 600, marginBottom: 2 }}>{p.actividad}</div>
                        <div style={{ color: COLORS.muted, marginBottom: 4 }}>{p.fecha}</div>
                        <div style={{ color: COLORS.turf }}>Distancia: {p.distancia.toLocaleString("es-AR")} m</div>
                      </div>
                    );
                  }} />
                  <Area type="monotone" dataKey="distancia" name="Distancia (m)" stroke={COLORS.turf} strokeWidth={2} fill="url(#distGrad)" dot={{ r: 3, fill: COLORS.turf, strokeWidth: 0 }}>
                    <LabelList dataKey="distancia" position="top" fill={COLORS.chalk} fontSize={8.5} formatter={(v) => v.toLocaleString("es-AR")} />
                  </Area>
                  <ReferenceLine y={avgDistanciaPorFecha} stroke={COLORS.blue} strokeDasharray="5 4" strokeWidth={1.5} label={{ value: `Promedio: ${avgDistanciaPorFecha.toLocaleString("es-AR")} m`, position: "insideTopRight", fill: COLORS.blue, fontSize: 10.5, fontWeight: 600 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 18 }}>
              <SectionLabel>Distancia promedio por puesto</SectionLabel>
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={porPuesto} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid stroke={COLORS.line} strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fill: COLORS.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="puesto" type="category" width={95} tick={{ fill: COLORS.muted, fontSize: 10.5 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="distancia" name="Distancia (m)" fill={COLORS.turf} radius={[0, 4, 4, 0]}>
                    <LabelList dataKey="distancia" position="insideRight" fill={COLORS.bg} fontSize={11} fontWeight={600} formatter={(v) => v.toLocaleString("es-AR")} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 18 }}>
              <SectionLabel>Top 10 · Distancia acumulada</SectionLabel>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={topJugadores} margin={{ bottom: 40 }}>
                  <CartesianGrid stroke={COLORS.line} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="jugador" tick={{ fill: COLORS.muted, fontSize: 9.5 }} axisLine={{ stroke: COLORS.line }} tickLine={false} angle={-40} textAnchor="end" interval={0} />
                  <YAxis tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="distancia" name="Distancia (m)" fill={COLORS.amber} radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="distancia" position="insideTop" fill={COLORS.bg} fontSize={10} fontWeight={600} formatter={(v) => v.toLocaleString("es-AR")} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 18 }}>
              <SectionLabel>Índice de Exigencia vs. Contactos</SectionLabel>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", marginBottom: 10 }}>
                {puestosEnDatos.map(p => (
                  <div key={p} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, color: COLORS.muted, fontFamily: "Inter, sans-serif" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: puestoColor(p), display: "inline-block" }} />
                    {p}
                  </div>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <ScatterChart margin={{ top: 10, right: 10 }}>
                  <CartesianGrid stroke={COLORS.line} strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="indiceExigencia" name="Índice de Exigencia" domain={[0, 100]} tick={{ fill: COLORS.muted, fontSize: 10 }} axisLine={{ stroke: COLORS.line }} tickLine={false} />
                  <YAxis type="number" dataKey="contactos" name="Contactos" tick={{ fill: COLORS.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <ZAxis range={[40, 41]} />
                  <Tooltip content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const p = payload[0].payload;
                    return (
                      <div style={{ background: COLORS.surfaceAlt, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "8px 12px", fontFamily: "Inter, sans-serif", fontSize: 12 }}>
                        <div style={{ color: COLORS.chalk, fontWeight: 600, marginBottom: 2 }}>{p.jugador}</div>
                        <div style={{ color: COLORS.muted, marginBottom: 2 }}>{p.puesto}</div>
                        <div style={{ color: puestoColor(p.puesto) }}>Índice de Exigencia: {p.indiceExigencia}</div>
                        <div style={{ color: puestoColor(p.puesto) }}>Contactos: {p.contactos}</div>
                      </div>
                    );
                  }} cursor={{ strokeDasharray: "3 3" }} />
                  <ReferenceLine x={avgIndiceExigencia} stroke={COLORS.chalk} strokeOpacity={0.4} strokeDasharray="5 4" label={{ value: `Prom. X: ${avgIndiceExigencia}`, position: "top", fill: COLORS.muted, fontSize: 10 }} />
                  <ReferenceLine y={avgContactos} stroke={COLORS.chalk} strokeOpacity={0.4} strokeDasharray="5 4" label={{ value: `Prom. Y: ${avgContactos}`, position: "right", fill: COLORS.muted, fontSize: 10 }} />
                  <Scatter data={scatterData} fillOpacity={0.8}>
                    {scatterData.map((d, i) => <Cell key={i} fill={puestoColor(d.puesto)} />)}
                    <LabelList dataKey="jugador" content={(props) => {
                      const { x, y, index } = props;
                      const d = scatterData[index];
                      if (!d) return null;
                      return (
                        <g>
                          <text x={x} y={y - 12} textAnchor="middle" fill={COLORS.chalk} fontSize={8.5} fontFamily="Inter, sans-serif" fontWeight={600}>{abbreviateName(d.jugador)}</text>
                          <text x={x} y={y - 3} textAnchor="middle" fill={COLORS.muted} fontSize={7.5} fontFamily="Inter, sans-serif">{d.actividad}</text>
                        </g>
                      );
                    }} />
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {jugadorTopPartidos.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              {jugadorTopPartidos.map((rj, ji) => (
                <div key={rj.jugador} style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 18, marginBottom: ji < jugadorTopPartidos.length - 1 ? 12 : 0 }}>
                  <SectionLabel>🏆 Top 3 partidos · {rj.jugador} <span style={{ marginLeft: 8, fontSize: 11, fontFamily: "Inter, sans-serif", fontWeight: 500, color: COLORS.muted, textTransform: "none" }}>% de su mejor partido (100% = su marca más alta)</span></SectionLabel>
                  <div style={{ display: "grid", gridTemplateColumns: `repeat(${rj.partidos.length}, 1fr)`, gap: 14 }}>
                    {rj.partidos.map((p, i) => (
                      <div key={i} style={{
                        background: `linear-gradient(160deg, ${COLORS.surfaceAlt} 0%, ${COLORS.surface} 100%)`,
                        border: `1px solid ${i === 0 ? COLORS.turf : COLORS.line}`, borderRadius: 12, padding: 16, position: "relative", overflow: "hidden"
                      }}>
                        <div style={{ position: "absolute", top: -10, right: -6, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 56, fontWeight: 700, color: COLORS.line, lineHeight: 1, opacity: 0.5 }}>
                          #{i + 1}
                        </div>
                        <div style={{ position: "relative" }}>
                          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: COLORS.muted, marginBottom: 4 }}>{p.fecha}</div>
                          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 19, fontWeight: 700, color: COLORS.chalk, marginBottom: 10, minHeight: 24 }}>{p.actividad}</div>
                          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 12 }}>
                            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 700, color: COLORS.turf }}>{p.indiceExigencia}</span>
                            <span style={{ fontSize: 10.5, color: COLORS.muted }}>% de su mejor partido</span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: COLORS.muted, fontFamily: "Inter, sans-serif" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Distancia</span><span style={{ color: COLORS.chalk, fontFamily: "'JetBrains Mono', monospace" }}>{fmt1(p.distancia)} m</span></div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Vel. Máx.</span><span style={{ color: COLORS.chalk, fontFamily: "'JetBrains Mono', monospace" }}>{fmt1(p.maxVel)} km/h</span></div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}><span>HSR</span><span style={{ color: COLORS.chalk, fontFamily: "'JetBrains Mono', monospace" }}>{fmt1(p.hsr)} m</span></div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Contactos</span><span style={{ color: COLORS.chalk, fontFamily: "'JetBrains Mono', monospace" }}>{fmt1(p.contactos)}</span></div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Esf. Expl.</span><span style={{ color: COLORS.chalk, fontFamily: "'JetBrains Mono', monospace" }}>{fmt1(p.esfExp)}</span></div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}><span>BiG <span style={{ opacity: 0.7 }}>(↓mejor)</span></span><span style={{ color: COLORS.chalk, fontFamily: "'JetBrains Mono', monospace" }}>{fmt1(p.big)}</span></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 18, marginBottom: 16 }}>
            <SectionLabel>
              Índice de Exigencia por Puesto
              <span style={{ marginLeft: 8, fontSize: 11, fontFamily: "Inter, sans-serif", fontWeight: 500, color: COLORS.muted, textTransform: "none" }}>
                100% = el mejor partido registrado en ese puesto (solo Partidos)
              </span>
            </SectionLabel>
            {indiceExigenciaPorPuesto.length === 0 ? (
              <div style={{ color: COLORS.muted, fontSize: 12.5, fontFamily: "Inter, sans-serif", padding: "10px 2px" }}>
                No hay partidos disponibles para esta selección de temporada.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={indiceExigenciaPorPuesto} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid stroke={COLORS.line} strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: COLORS.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="puesto" type="category" width={95} tick={{ fill: COLORS.muted, fontSize: 10.5 }} axisLine={false} tickLine={false} />
                  <Tooltip content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const p = payload[0].payload;
                    return (
                      <div style={{ background: COLORS.surfaceAlt, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "8px 12px", fontFamily: "Inter, sans-serif", fontSize: 12 }}>
                        <div style={{ color: COLORS.chalk, fontWeight: 600, marginBottom: 2 }}>{p.puesto}</div>
                        <div style={{ color: COLORS.turf }}>{p.indice}% promedio (sobre su mejor partido)</div>
                        <div style={{ color: COLORS.muted }}>{p.partidos} partidos analizados</div>
                      </div>
                    );
                  }} />
                  <Bar dataKey="indice" name="Índice de Exigencia (%)" fill={COLORS.turf} radius={[0, 4, 4, 0]}>
                    <LabelList dataKey="indice" position="insideRight" fill={COLORS.bg} fontSize={11} fontWeight={600} formatter={(v) => `${v}%`} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 18, marginBottom: 16 }}>
            <SectionLabel>
              Perfil por sesión · Índice de Exigencia
              <span style={{ marginLeft: 8, fontSize: 11, fontFamily: "Inter, sans-serif", fontWeight: 500, color: COLORS.muted, textTransform: "none" }}>
                cada eje es un partido · 100% = su mejor partido
              </span>
            </SectionLabel>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }} className="no-print">
              <Filter size={14} color={COLORS.muted} />
              <select value={radarJugadorSel} onChange={e => { setRadarJugadorSel(e.target.value); setRadarPartidosSel([]); }} style={{ background: COLORS.surface, color: COLORS.chalk, border: `1px solid ${COLORS.turfDim}`, borderRadius: 7, padding: "7px 10px", fontSize: 12.5, fontFamily: "Inter, sans-serif", fontWeight: 600, maxWidth: 220 }}>
                <option value="">Elegí un jugador...</option>
                {radarJugadoresDisponibles.map(j => <option key={j} value={j}>{j}</option>)}
              </select>
              {radarJugadorSel && (
                <MultiSelect options={radarPartidosOpciones} selected={radarPartidosSel} onToggle={toggleRadarPartido} onClear={() => setRadarPartidosSel([])} colors={COLORS} allLabel="Todas sus sesiones" singularLabel="sesión" minWidth={170} searchable={true} />
              )}
            </div>

            {!radarJugadorSel ? (
              <div style={{ color: COLORS.muted, fontSize: 12.5, fontFamily: "Inter, sans-serif", padding: "10px 2px" }}>
                Elegí un jugador arriba para ver su perfil sesión por sesión.
              </div>
            ) : radarSesionesData.length === 0 ? (
              <div style={{ color: COLORS.muted, fontSize: 12.5, fontFamily: "Inter, sans-serif", padding: "10px 2px" }}>
                Sin partidos disponibles para esta selección.
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={340}>
                  <RadarChart data={radarSesionesData} outerRadius="70%">
                    <PolarGrid stroke={COLORS.line} />
                    <PolarAngleAxis dataKey="sesion" tick={{ fill: COLORS.muted, fontSize: 10 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fill: COLORS.muted, fontSize: 9 }} axisLine={false} />
                    <Radar dataKey="indice" name={radarJugadorSel} stroke={COLORS.turf} fill={COLORS.turf} fillOpacity={0.3} label={{ fill: COLORS.chalk, fontSize: 10.5, fontWeight: 600, formatter: (v) => `${v}%` }} />
                    <Radar dataKey="Mejor performance" name="Mejor performance" stroke={COLORS.red} fill="transparent" strokeWidth={2} strokeDasharray="6 4" />
                    <Radar dataKey="Performance media" name="Performance media" stroke={COLORS.blue} fill="transparent" strokeWidth={2} strokeDasharray="2 3" />
                    <Legend wrapperStyle={{ fontSize: 11.5, color: COLORS.muted }} />
                    <Tooltip content={({ active, payload, label }) => {
                      if (!active || !payload || !payload.length) return null;
                      return (
                        <div style={{ background: COLORS.surfaceAlt, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "8px 12px", fontFamily: "Inter, sans-serif", fontSize: 12 }}>
                          <div style={{ color: COLORS.chalk, fontWeight: 600, marginBottom: 4 }}>{label}</div>
                          {payload.map((p, i) => (
                            <div key={i} style={{ color: p.color }}>{p.name}: {p.value}%</div>
                          ))}
                        </div>
                      );
                    }} />
                  </RadarChart>
                </ResponsiveContainer>

                <div style={{ marginTop: 16, overflowX: "auto" }}>
                  <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: "Inter, sans-serif", marginBottom: 10 }}>
                    Comparación contra su mejor Índice de Exigencia · magnitud de la diferencia según SWC (Hopkins): Trivial (&lt;0.2), Baja (0.2–0.6), Moderada (0.6–1.2), Alta (1.2–2.0), Muy alta (&gt;2.0), en unidades de desvío estándar de ese jugador.
                  </div>
                  <table>
                    <thead>
                      <tr style={{ color: COLORS.muted, borderBottom: `1px solid ${COLORS.line}`, textTransform: "uppercase", fontSize: 10, letterSpacing: "0.04em" }}>
                        <th>Partido</th><th>Fecha</th><th style={{ textAlign: "center" }}>Índice</th><th style={{ textAlign: "center" }}>Mejor partido</th><th style={{ textAlign: "center" }}>Diferencia</th><th style={{ textAlign: "center" }}>Magnitud (SWC)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {radarComparacionTabla.map((r, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${COLORS.line}` }}>
                          <td style={{ fontWeight: 500 }}>{r.actividad}</td>
                          <td style={{ color: COLORS.muted, fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5 }}>{r.fecha}</td>
                          <td style={{ textAlign: "center", fontFamily: "'JetBrains Mono', monospace", color: COLORS.turf, fontWeight: 600 }}>{r.indiceExigencia}%</td>
                          <td style={{ textAlign: "center", fontFamily: "'JetBrains Mono', monospace", color: COLORS.muted }}>{radarJugadorStats.mejor}%</td>
                          <td style={{ textAlign: "center", fontFamily: "'JetBrains Mono', monospace", color: r.delta < 0 ? COLORS.red : COLORS.turf }}>{r.delta > 0 ? "+" : ""}{r.delta}%</td>
                          <td style={{ textAlign: "center" }}>
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: 5, background: r.magnitud.color + "22",
                              border: `1px solid ${r.magnitud.color}`, borderRadius: 6, padding: "3px 9px", fontSize: 11, fontWeight: 600, color: r.magnitud.color
                            }}>
                              <span style={{ width: 7, height: 7, borderRadius: "50%", background: r.magnitud.color, display: "inline-block" }} />
                              {r.magnitud.label}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16, marginBottom: 16 }}>
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 18 }}>
              <SectionLabel>
                Perfil de carga · Distancia, HSR, BiG, RHIE, Esf. Explosivos, Contactos
                <span style={{ marginLeft: 8, fontSize: 11, fontFamily: "Inter, sans-serif", fontWeight: 500, color: COLORS.muted, textTransform: "none" }}>
                  {cargaRadarMode === "jugador" ? "· por jugador" : cargaRadarMode === "puesto" ? "· por puesto" : "· plantel completo"} · sobre sesiones completas
                </span>
              </SectionLabel>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={cargaRadarDataWithBenchmark} outerRadius="70%">
                  <PolarGrid stroke={COLORS.line} />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: COLORS.muted, fontSize: 11.5 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fill: COLORS.muted, fontSize: 9 }} axisLine={false} />
                  {cargaRadarGroups.map((g, i) => (
                    <Radar key={g} dataKey={g} name={g} stroke={RADAR_COLORS[i % RADAR_COLORS.length]} fill={RADAR_COLORS[i % RADAR_COLORS.length]} fillOpacity={cargaRadarGroups.length > 1 ? 0.15 : 0.35}
                      label={cargaRadarGroups.length === 1 ? { fill: COLORS.chalk, fontSize: 11, fontWeight: 600, formatter: (v) => `${v}%` } : false} />
                  ))}
                  {cargaRadarBenchmark && (
                    <Radar dataKey="Mejor marca" name="Mejor marca (puesto, ≥60 min)" stroke={COLORS.red} fill="transparent" strokeWidth={2} strokeDasharray="6 4" />
                  )}
                  {(cargaRadarGroups.length > 1 || cargaRadarBenchmark) && <Legend wrapperStyle={{ fontSize: 11.5, color: COLORS.muted }} />}
                  <Tooltip content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    return (
                      <div style={{ background: COLORS.surfaceAlt, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "8px 12px", fontFamily: "Inter, sans-serif", fontSize: 12 }}>
                        <div style={{ color: COLORS.chalk, fontWeight: 600, marginBottom: 4 }}>{label}</div>
                        {payload.map((entry, i) => (
                          <div key={i} style={{ color: entry.color }}>
                            {entry.name}: {entry.value}% <span style={{ color: COLORS.muted }}>(prom. {entry.payload[`${entry.name}__raw`]})</span>
                          </div>
                        ))}
                      </div>
                    );
                  }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 18, overflowX: "auto" }}>
              <SectionLabel>Valores de referencia</SectionLabel>
              <table>
                <thead>
                  <tr style={{ color: COLORS.muted, borderBottom: `1px solid ${COLORS.line}`, textTransform: "uppercase", fontSize: 10, letterSpacing: "0.04em" }}>
                    <th>Métrica</th>
                    {cargaRadarGroups.map((g, i) => (
                      <th key={g} style={{ color: RADAR_COLORS[i % RADAR_COLORS.length], textAlign: "right" }}>{g}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cargaRadarData.map((row, ri) => (
                    <tr key={ri} style={{ borderBottom: `1px solid ${COLORS.line}` }}>
                      <td style={{ color: COLORS.muted, fontSize: 11.5 }}>{row.metric}</td>
                      {cargaRadarGroups.map((g, i) => (
                        <td key={g} style={{ textAlign: "right", fontFamily: "'JetBrains Mono', monospace", color: COLORS.chalk }}>
                          {row[`${g}__raw`]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: 10, fontSize: 10.5, color: COLORS.muted, fontFamily: "Inter, sans-serif" }}>
                Valores promedio reales por sesión (no normalizados). El radar los muestra como % del percentil 85 histórico.
              </div>
            </div>
          </div>

          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 18, overflowX: "auto" }}>
            <SectionLabel>Resumen por jugador</SectionLabel>
            <table>
              <thead>
                <tr style={{ color: COLORS.muted, borderBottom: `1px solid ${COLORS.line}`, textTransform: "uppercase", fontSize: 10.5, letterSpacing: "0.05em" }}>
                  <th>Jugador</th><th>Puesto</th><th>Sesiones</th><th>Distancia Total (m)</th><th>Vel. Máx (km/h)</th><th>HSR Total (m)</th><th>Contactos</th><th>BiG (prom.)</th><th>Índice Exigencia</th>
                </tr>
              </thead>
              <tbody>
                {tablaJugadores.map((r, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${COLORS.line}` }}>
                    <td style={{ fontWeight: 500 }}>{r.jugador}</td>
                    <td style={{ color: COLORS.muted }}>{r.puesto}</td>
                    <td style={{ fontFamily: "'JetBrains Mono', monospace" }}>{r.sesiones}</td>
                    <td style={{ fontFamily: "'JetBrains Mono', monospace" }}>{Math.round(r.distanciaTotal).toLocaleString("es-AR")}</td>
                    <td style={{ fontFamily: "'JetBrains Mono', monospace", color: COLORS.amber }}>{fmt1(r.maxVel)}</td>
                    <td style={{ fontFamily: "'JetBrains Mono', monospace" }}>{Math.round(r.hsrTotal)}</td>
                    <td style={{ fontFamily: "'JetBrains Mono', monospace" }}>{fmt1(r.contactosTotal)}</td>
                    <td style={{ fontFamily: "'JetBrains Mono', monospace" }}>{fmt1(r.bigProm)}</td>
                    <td style={{ fontFamily: "'JetBrains Mono', monospace", color: COLORS.turf, fontWeight: 600 }}>{r.indiceExigencia}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 18, overflowX: "auto", marginTop: 16 }}>
            <SectionLabel>
              Detalle por sesión
              <span style={{ marginLeft: 8, fontSize: 11, fontFamily: "Inter, sans-serif", fontWeight: 500, color: COLORS.muted, textTransform: "none" }}>
                {detalleSesiones.length} {detalleSesiones.length === 1 ? "registro" : "registros"} · independiente del filtro de Periodo general
              </span>
            </SectionLabel>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }} className="no-print">
              <Filter size={14} color={COLORS.muted} />
              <MultiSelect options={periodosOpciones} selected={detallePeriodosSel} onToggle={toggleDetallePeriodo} onClear={() => setDetallePeriodosSel([])} colors={COLORS} allLabel="Todos los períodos" singularLabel="período" minWidth={160} searchable={true} />
              {detallePeriodosSel.length === 0 && (
                <span style={{ fontSize: 11, color: COLORS.muted, fontFamily: "Inter, sans-serif" }}>(mostrando todos los períodos)</span>
              )}
            </div>
            <div className="print-expand" style={{ maxHeight: 420, overflowY: "auto" }}>
              <table>
                <thead>
                  <tr style={{ color: COLORS.muted, borderBottom: `1px solid ${COLORS.line}`, textTransform: "uppercase", fontSize: 10, letterSpacing: "0.04em" }}>
                    <th>Jugador</th><th>Fecha</th><th>Actividad</th><th>Puesto</th><th>Tipo</th><th>Periodo</th><th>Distancia (m)</th><th>Vel. Máx (km/h)</th><th>HSR (m)</th><th>Contactos</th><th>BiG</th>
                  </tr>
                </thead>
                <tbody>
                  {detalleSesiones.map((r, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${COLORS.line}` }}>
                      <td style={{ fontWeight: 500 }}>{r.jugador}</td>
                      <td style={{ color: COLORS.muted, fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5 }}>{r.fecha}</td>
                      <td style={{ color: COLORS.muted }}>{r.actividad}</td>
                      <td style={{ color: COLORS.muted }}>{r.puesto}</td>
                      <td style={{ color: COLORS.muted, fontSize: 11 }}>{r.etiqueta}</td>
                      <td style={{ color: COLORS.turf, fontSize: 11, fontWeight: 600 }}>{r.periodo}</td>
                      <td style={{ fontFamily: "'JetBrains Mono', monospace" }}>{fmt1(r.distancia)}</td>
                      <td style={{ fontFamily: "'JetBrains Mono', monospace", color: COLORS.amber }}>{fmt1(r.maxVel)}</td>
                      <td style={{ fontFamily: "'JetBrains Mono', monospace" }}>{fmt1(r.hsr)}</td>
                      <td style={{ fontFamily: "'JetBrains Mono', monospace" }}>{fmt1(r.contactos)}</td>
                      <td style={{ fontFamily: "'JetBrains Mono', monospace" }}>{fmt1(r.big)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginTop: 16, marginBottom: 16 }}>
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 18 }}>
              <SectionLabel>Distancia total y Esf. Explosivos por semana</SectionLabel>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={cargaPorSemana} margin={{ bottom: 40 }}>
                  <CartesianGrid stroke={COLORS.line} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="semana" tick={{ fill: COLORS.muted, fontSize: 9.5 }} axisLine={{ stroke: COLORS.line }} tickLine={false} angle={-40} textAnchor="end" interval={0} height={60} />
                  <YAxis yAxisId="left" tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: "Distancia (m)", angle: -90, position: "insideLeft", fill: COLORS.muted, fontSize: 10.5 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: "Esf. Explosivos", angle: 90, position: "insideRight", fill: COLORS.muted, fontSize: 10.5 }} />
                  <Tooltip content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    return (
                      <div style={{ background: COLORS.surfaceAlt, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "8px 12px", fontFamily: "Inter, sans-serif", fontSize: 12 }}>
                        <div style={{ color: COLORS.chalk, fontWeight: 600, marginBottom: 4 }}>{label}</div>
                        {payload.map((p, i) => (
                          <div key={i} style={{ color: p.color }}>{p.name}: {p.value.toLocaleString("es-AR")}</div>
                        ))}
                      </div>
                    );
                  }} />
                  <Legend wrapperStyle={{ fontSize: 11.5, color: COLORS.muted }} />
                  <Bar yAxisId="left" dataKey="distancia" name="Distancia (m)" fill={COLORS.turf} radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="distancia" position="insideTop" fill={COLORS.bg} fontSize={10} fontWeight={600} formatter={(v) => v.toLocaleString("es-AR")} />
                  </Bar>
                  <Line yAxisId="right" type="monotone" dataKey="esfExp" name="Esf. Explosivos" stroke={COLORS.amber} strokeWidth={2.5} dot={{ r: 4, fill: COLORS.amber }}>
                    <LabelList dataKey="esfExp" position="top" fill={COLORS.chalk} fontSize={9.5} />
                  </Line>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <YardDivider />
            <SectionLabel>
              🔥 Partidos más exigentes
              <span style={{ marginLeft: 8, fontSize: 11, fontFamily: "Inter, sans-serif", fontWeight: 500, color: COLORS.muted, textTransform: "none" }}>
                {temporadaFilter === "Todas" ? "· todas las temporadas" : `· temporada ${temporadaFilter}`}
              </span>
            </SectionLabel>

            <div style={{ background: COLORS.surfaceAlt, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: COLORS.muted, lineHeight: 1.7 }}>
              <div style={{ color: COLORS.turf, fontWeight: 600, marginBottom: 4 }}>Fórmula del índice de exigencia</div>
              <div>Índice = ( Contactos/max + Distancia/max + Esf.Expl/max + RHIE/max + HSR/max + <span style={{ color: COLORS.chalk }}>(1 − BiG/max)</span> ) / 6 × 100</div>
              <div style={{ color: COLORS.muted, marginTop: 4, fontSize: 10.5 }}>Cada métrica es el promedio por jugador del partido, normalizado contra el máximo de la temporada seleccionada. BiG se invierte porque un valor menor indica mejor performance.</div>
            </div>

            {partidosExigentes.length === 0 ? (
              <div style={{ color: COLORS.muted, fontSize: 12.5, fontFamily: "Inter, sans-serif", padding: "10px 2px" }}>
                No hay partidos con datos suficientes para calcular el índice en esta selección de temporada.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(5, partidosExigentes.length)}, 1fr)`, gap: 14 }}>
                {partidosExigentes.map((m, i) => (
                  <div key={i} style={{
                    background: `linear-gradient(160deg, ${COLORS.surfaceAlt} 0%, ${COLORS.surface} 100%)`,
                    border: `1px solid ${i === 0 ? COLORS.turf : COLORS.line}`,
                    borderRadius: 12, padding: 16, position: "relative", overflow: "hidden"
                  }}>
                    <div style={{ position: "absolute", top: -10, right: -6, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 64, fontWeight: 700, color: COLORS.line, lineHeight: 1, opacity: 0.5 }}>
                      #{i + 1}
                    </div>
                    <div style={{ position: "relative" }}>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: COLORS.muted, marginBottom: 4 }}>{m.fecha} · {m.temporada}</div>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 700, color: COLORS.chalk, marginBottom: 10, minHeight: 24 }}>{m.actividad}</div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 12 }}>
                        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 36, fontWeight: 700, color: COLORS.turf }}>{m.score}</span>
                        <span style={{ fontSize: 11, color: COLORS.muted }}>índice de exigencia</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: COLORS.muted, fontFamily: "Inter, sans-serif" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Contactos prom.</span><span style={{ color: COLORS.chalk, fontFamily: "'JetBrains Mono', monospace" }}>{fmt1(m.avgContactos)}</span></div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Distancia prom.</span><span style={{ color: COLORS.chalk, fontFamily: "'JetBrains Mono', monospace" }}>{fmt1(m.avgDistancia)} m</span></div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Esf. Expl. prom.</span><span style={{ color: COLORS.chalk, fontFamily: "'JetBrains Mono', monospace" }}>{fmt1(m.avgEsfExp)}</span></div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}><span>RHIE prom.</span><span style={{ color: COLORS.chalk, fontFamily: "'JetBrains Mono', monospace" }}>{fmt1(m.avgRhie)}</span></div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}><span>HSR prom.</span><span style={{ color: COLORS.chalk, fontFamily: "'JetBrains Mono', monospace" }}>{fmt1(m.avgHsr)} m</span></div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}><span>BiG prom. <span style={{ opacity: 0.7 }}>(↓mejor)</span></span><span style={{ color: COLORS.chalk, fontFamily: "'JetBrains Mono', monospace" }}>{fmt1(m.avgBig)}</span></div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Jugadores</span><span style={{ color: COLORS.chalk, fontFamily: "'JetBrains Mono', monospace" }}>{m.jugadores}</span></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </>
      )}


      {tab === "bip" && (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
            <StatCard icon={Radio} label="Secuencias BiP" value={bipKpis.secuencias.toLocaleString("es-AR")} unit="" />
            <StatCard icon={MapPin} label="Distancia Total" value={(bipKpis.distanciaTotal / 1000).toFixed(1)} unit="km" />
            <StatCard icon={Zap} label="Duración Total en Juego" value={fmt1(bipKpis.duracionTotalMin)} unit="min" accent={COLORS.amber} />
            <StatCard icon={Users} label="Contactos Totales" value={Math.round(bipKpis.contactosTotal).toLocaleString("es-AR")} unit="" accent={COLORS.blue} />
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }} className="no-print">
            <Filter size={14} color={COLORS.muted} />
            <MultiSelect options={bipPuestos} selected={bipPuestoFilter} onToggle={toggleBipPuesto} onClear={() => setBipPuestoFilter([])} colors={COLORS} allLabel="Todos los puestos" singularLabel="puesto" minWidth={140} />
            <MultiSelect options={bipPartidos} selected={bipPartidoFilter} onToggle={toggleBipPartido} onClear={() => setBipPartidoFilter([])} colors={COLORS} allLabel="Todos los partidos" singularLabel="partido" minWidth={170} searchable={true} />
            <MultiSelect options={bipJugadores} selected={bipJugadorFilter} onToggle={toggleBipJugador} onClear={() => setBipJugadorFilter([])} colors={COLORS} allLabel="Todos los jugadores" singularLabel="jugador" minWidth={160} searchable={true} />
            {(bipJugadorFilter.length > 0 || bipPuestoFilter.length > 0 || bipPartidoFilter.length > 0) && (
              <button onClick={() => { setBipJugadorFilter([]); setBipPuestoFilter([]); setBipPartidoFilter([]); }} style={{ background: "transparent", color: COLORS.turf, border: `1px solid ${COLORS.turfDim}`, borderRadius: 7, padding: "7px 12px", fontSize: 12, fontFamily: "Inter, sans-serif", cursor: "pointer" }}>
                Limpiar filtros
              </button>
            )}
          </div>

          <YardDivider />

          <div style={{ background: COLORS.surfaceAlt, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: COLORS.muted, lineHeight: 1.7 }}>
            <div style={{ color: COLORS.turf, fontWeight: 600, marginBottom: 4 }}>¿Qué es Ball in Play?</div>
            <div>Representa únicamente el período en que los jugadores están realizando acciones propias del juego, excluyendo todas las pausas reglamentarias. Es el tiempo efectivo de juego.</div>
          </div>

          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 18, marginBottom: 16 }}>
            <SectionLabel>Duración de Ball in Play por partido</SectionLabel>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={bipDuracionPorPartido} margin={{ bottom: 60 }}>
                <CartesianGrid stroke={COLORS.line} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="partido" tick={{ fill: COLORS.muted, fontSize: 10 }} axisLine={{ stroke: COLORS.line }} tickLine={false} angle={-40} textAnchor="end" interval={0} height={70} />
                <YAxis tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: "minutos", angle: -90, position: "insideLeft", fill: COLORS.muted, fontSize: 10.5 }} />
                <Tooltip content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  return (
                    <div style={{ background: COLORS.surfaceAlt, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "8px 12px", fontFamily: "Inter, sans-serif", fontSize: 12 }}>
                      <div style={{ color: COLORS.chalk, fontWeight: 600, marginBottom: 2 }}>{label}</div>
                      <div style={{ color: COLORS.turf }}>{payload[0].value} min en juego</div>
                    </div>
                  );
                }} />
                <Bar dataKey="minutos" name="Duración BiP" fill={COLORS.turf} radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="minutos" position="insideTop" fill={COLORS.bg} fontSize={10.5} fontWeight={600} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 18, marginBottom: 16 }}>
            <SectionLabel>Duración de cada secuencia de juego</SectionLabel>
            <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: "Inter, sans-serif", marginBottom: 10, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <span>Responde a los filtros de partido y jugador activos arriba.</span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: COLORS.red, display: "inline-block" }} />
                Secuencias ≥ 60 s
              </span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={bipSecuenciasDuracion} margin={{ bottom: 60 }}>
                <CartesianGrid stroke={COLORS.line} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: COLORS.muted, fontSize: 8.5 }} axisLine={{ stroke: COLORS.line }} tickLine={false} angle={-40} textAnchor="end" interval={Math.max(0, Math.ceil(bipSecuenciasDuracion.length / 30) - 1)} height={70} />
                <YAxis tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: "segundos", angle: -90, position: "insideLeft", fill: COLORS.muted, fontSize: 10.5 }} />
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const p = payload[0].payload;
                  return (
                    <div style={{ background: COLORS.surfaceAlt, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "8px 12px", fontFamily: "Inter, sans-serif", fontSize: 12 }}>
                      <div style={{ color: COLORS.chalk, fontWeight: 600, marginBottom: 2 }}>{p.partido} · {p.secuencia}</div>
                      <div style={{ color: p.duracion >= 60 ? COLORS.red : COLORS.turf }}>{p.duracion} s {p.duracion >= 60 ? "· ≥ 60 s" : ""}</div>
                    </div>
                  );
                }} />
                <ReferenceLine y={60} stroke={COLORS.red} strokeDasharray="6 4" strokeOpacity={0.7} label={{ value: "60 s", position: "right", fill: COLORS.red, fontSize: 10.5, fontWeight: 600 }} />
                <Line
                  type="monotone" dataKey="duracion" name="Duración (s)" stroke={COLORS.turf} strokeWidth={1.5}
                  dot={bipSecuenciasDuracion.length <= 60 ? (props) => {
                    const { cx, cy, payload, index } = props;
                    return <circle key={`dot-${index}`} cx={cx} cy={cy} r={payload.duracion >= 60 ? 4 : 2.5} fill={payload.duracion >= 60 ? COLORS.red : COLORS.turf} stroke="none" />;
                  } : false}
                >
                  <LabelList dataKey="duracion" position="top" fill={COLORS.red} fontSize={9.5} fontWeight={600} formatter={(v) => (v >= 60 ? `${v}s` : "")} />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 18, marginBottom: 16 }}>
            <SectionLabel>Secuencias de juego mayores a 1 minuto (60 s)</SectionLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
              <StatCard icon={Radio} label="Secuencias > 60s" value={bipSecuenciasLargas.cantidadLargas} unit={`de ${bipSecuenciasLargas.totalSecuencias}`} accent={COLORS.amber} />
              <StatCard icon={Zap} label="Minutos que suman" value={bipSecuenciasLargas.minutosLargas} unit="min" />
              <StatCard icon={TrendingUp} label="% del Ball in Play total" value={bipSecuenciasLargas.pctLargas} unit="%" accent={COLORS.blue} />
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={bipSecuenciasLargas.chartData} margin={{ bottom: 10 }}>
                <CartesianGrid stroke={COLORS.line} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="categoria" tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={{ stroke: COLORS.line }} tickLine={false} />
                <YAxis tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: "minutos", angle: -90, position: "insideLeft", fill: COLORS.muted, fontSize: 10.5 }} />
                <Tooltip content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const p = payload[0].payload;
                  return (
                    <div style={{ background: COLORS.surfaceAlt, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "8px 12px", fontFamily: "Inter, sans-serif", fontSize: 12 }}>
                      <div style={{ color: COLORS.chalk, fontWeight: 600, marginBottom: 2 }}>{label}</div>
                      <div style={{ color: COLORS.turf }}>{p.secuencias} secuencias</div>
                      <div style={{ color: COLORS.amber }}>{p.minutos} min</div>
                    </div>
                  );
                }} />
                <Bar dataKey="minutos" name="Minutos" fill={COLORS.turf} radius={[4, 4, 0, 0]} maxBarSize={90}>
                  <LabelList dataKey="minutos" position="insideTop" fill={COLORS.bg} fontSize={11} fontWeight={600} formatter={(v) => `${v} min`} />
                  <LabelList dataKey="secuencias" position="top" fill={COLORS.chalk} fontSize={10.5} formatter={(v) => `${v} secuencias`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 18 }}>
              <SectionLabel>Top 5 · Jugadores con más minutos en juego</SectionLabel>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={bipTop5Minutos} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid stroke={COLORS.line} strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fill: COLORS.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="jugador" type="category" width={140} tick={{ fill: COLORS.muted, fontSize: 10.5 }} axisLine={false} tickLine={false} />
                  <Tooltip content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const p = payload[0].payload;
                    return (
                      <div style={{ background: COLORS.surfaceAlt, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "8px 12px", fontFamily: "Inter, sans-serif", fontSize: 12 }}>
                        <div style={{ color: COLORS.chalk, fontWeight: 600, marginBottom: 2 }}>{p.jugador}</div>
                        <div style={{ color: COLORS.muted, marginBottom: 2 }}>{p.puesto}</div>
                        <div style={{ color: COLORS.turf }}>{p.minutos} min en juego</div>
                      </div>
                    );
                  }} />
                  <Bar dataKey="minutos" name="Minutos" fill={COLORS.turf} radius={[0, 4, 4, 0]}>
                    <LabelList dataKey="minutos" position="insideRight" fill={COLORS.bg} fontSize={11} fontWeight={600} formatter={(v) => `${v} min`} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 18 }}>
              <SectionLabel>Top 10 · Contactos acumulados</SectionLabel>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={[...bipPorJugador].sort((a, b) => b.contactos - a.contactos).slice(0, 10)} margin={{ bottom: 40 }}>
                  <CartesianGrid stroke={COLORS.line} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="jugador" tick={{ fill: COLORS.muted, fontSize: 9.5 }} axisLine={{ stroke: COLORS.line }} tickLine={false} angle={-40} textAnchor="end" interval={0} />
                  <YAxis tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="contactos" name="Contactos" fill={COLORS.amber} radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="contactos" position="insideTop" fill={COLORS.bg} fontSize={10} fontWeight={600} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginBottom: 16 }}>
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 18 }}>
              <SectionLabel>
                Perfil BiP · Distancia, Acels. Alta, HSR, BiG, Contactos
                <span style={{ marginLeft: 8, fontSize: 11, fontFamily: "Inter, sans-serif", fontWeight: 500, color: COLORS.muted, textTransform: "none" }}>
                  {bipRadarMode === "jugador" ? "· por jugador" : bipRadarMode === "partido" ? "· por partido" : "· equipo completo"}
                </span>
              </SectionLabel>
              <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: "Inter, sans-serif", marginBottom: 10 }}>
                Elegí jugadores o partidos en los filtros de arriba para comparar series. Cada eje está normalizado como % del percentil 85 histórico de esa métrica.
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={bipRadarData} outerRadius="70%">
                  <PolarGrid stroke={COLORS.line} />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: COLORS.muted, fontSize: 11.5 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fill: COLORS.muted, fontSize: 9 }} axisLine={false} />
                  {bipRadarGroups.map((g, i) => (
                    <Radar key={g} dataKey={g} name={g} stroke={RADAR_COLORS[i % RADAR_COLORS.length]} fill={RADAR_COLORS[i % RADAR_COLORS.length]} fillOpacity={bipRadarGroups.length > 1 ? 0.15 : 0.35}
                      label={bipRadarGroups.length === 1 ? { fill: COLORS.chalk, fontSize: 11, fontWeight: 600, formatter: (v) => `${v}%` } : false} />
                  ))}
                  {bipRadarGroups.length > 1 && <Legend wrapperStyle={{ fontSize: 11.5, color: COLORS.muted }} />}
                  <Tooltip content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    return (
                      <div style={{ background: COLORS.surfaceAlt, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "8px 12px", fontFamily: "Inter, sans-serif", fontSize: 12 }}>
                        <div style={{ color: COLORS.chalk, fontWeight: 600, marginBottom: 4 }}>{label}</div>
                        {payload.map((entry, i) => (
                          <div key={i} style={{ color: entry.color }}>
                            {entry.name}: {entry.value}% <span style={{ color: COLORS.muted }}>(prom. {entry.payload[`${entry.name}__raw`]})</span>
                          </div>
                        ))}
                      </div>
                    );
                  }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 18 }}>
              <SectionLabel>BiG promedio por jugador</SectionLabel>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={bipBigPorJugadorLine} margin={{ bottom: 50 }}>
                  <CartesianGrid stroke={COLORS.line} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="jugador" tick={{ fill: COLORS.muted, fontSize: 9 }} axisLine={{ stroke: COLORS.line }} tickLine={false} angle={-40} textAnchor="end" interval={0} height={70} />
                  <YAxis tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="bigProm" name="BiG prom. (s)" stroke={COLORS.turf} strokeWidth={2} dot={{ r: 3 }}>
                    <LabelList dataKey="bigProm" position="top" fill={COLORS.chalk} fontSize={9.5} />
                  </Line>
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 18 }}>
              <SectionLabel>
                BiG promedio por partido
                <span style={{ marginLeft: 8, fontSize: 11, fontFamily: "Inter, sans-serif", fontWeight: 500, color: COLORS.muted, textTransform: "none" }}>
                  {bipBigPartidoMode === "jugador" ? "· por jugador" : bipBigPartidoMode === "puesto" ? "· por puesto" : "· equipo completo"}
                </span>
              </SectionLabel>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={bipBigPorPartidoLine} margin={{ bottom: 50 }}>
                  <CartesianGrid stroke={COLORS.line} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="partido" tick={{ fill: COLORS.muted, fontSize: 9 }} axisLine={{ stroke: COLORS.line }} tickLine={false} angle={-40} textAnchor="end" interval={0} height={70} />
                  <YAxis tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  {bipBigPartidoGroups.length > 1 && <Legend wrapperStyle={{ fontSize: 10.5, color: COLORS.muted }} />}
                  {bipBigPartidoGroups.map((g, i) => (
                    <Line key={g} type="monotone" dataKey={g} name={g} stroke={RADAR_COLORS[i % RADAR_COLORS.length]} strokeWidth={2} dot={{ r: 3 }}>
                      <LabelList dataKey={g} position="top" fill={COLORS.chalk} fontSize={9} />
                    </Line>
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 18, overflowX: "auto" }}>
            <SectionLabel>Resumen por jugador · Ball in Play</SectionLabel>
            <table>
              <thead>
                <tr style={{ color: COLORS.muted, borderBottom: `1px solid ${COLORS.line}`, textTransform: "uppercase", fontSize: 10.5, letterSpacing: "0.05em" }}>
                  <th>Jugador</th><th>Puesto</th><th>Secuencias</th><th>Distancia Total (m)</th><th>Duración (min)</th><th>Secuencia (máx / prom, s)</th><th>HSR Total (m)</th><th>Contactos</th><th>Acels. Alta</th><th>BiG Prom. (s)</th>
                </tr>
              </thead>
              <tbody>
                {bipPorJugador.map((r, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${COLORS.line}` }}>
                    <td style={{ fontWeight: 500 }}>{r.jugador}</td>
                    <td style={{ color: COLORS.muted }}>{r.puesto}</td>
                    <td style={{ fontFamily: "'JetBrains Mono', monospace" }}>{r.secuencias}</td>
                    <td style={{ fontFamily: "'JetBrains Mono', monospace" }}>{Math.round(r.distancia).toLocaleString("es-AR")}</td>
                    <td style={{ fontFamily: "'JetBrains Mono', monospace", color: COLORS.amber }}>{fmt1(r.duracion / 60)}</td>
                    <td style={{ fontFamily: "'JetBrains Mono', monospace" }}>{fmt1(r.duracionMax)} / {r.duracionProm}</td>
                    <td style={{ fontFamily: "'JetBrains Mono', monospace" }}>{Math.round(r.hsr)}</td>
                    <td style={{ fontFamily: "'JetBrains Mono', monospace" }}>{fmt1(r.contactos)}</td>
                    <td style={{ fontFamily: "'JetBrains Mono', monospace" }}>{fmt1(r.acelsAlta)}</td>
                    <td style={{ fontFamily: "'JetBrains Mono', monospace" }}>{r.bigProm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "nutri" && (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
            <StatCard icon={Apple} label="Registros" value={filteredNutri.length.toLocaleString("es-AR")} unit="" />
            <StatCard icon={Users} label="Jugadores" value={new Set(filteredNutri.map(d => d.jugador)).size} unit="" accent={COLORS.blue} />
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }} className="no-print">
            <Filter size={14} color={COLORS.muted} />
            <MultiSelect options={nutriJugadores} selected={nutriJugadorFilter} onToggle={toggleNutriJugador} onClear={() => setNutriJugadorFilter([])} colors={COLORS} allLabel="Todos los jugadores" singularLabel="jugador" minWidth={160} searchable={true} />
            <select value={nutriTemporadaFilter} onChange={e => setNutriTemporadaFilter(e.target.value)} style={{ background: COLORS.surface, color: COLORS.chalk, border: `1px solid ${COLORS.turfDim}`, borderRadius: 7, padding: "7px 10px", fontSize: 12.5, fontFamily: "Inter, sans-serif", fontWeight: 600 }}>
              {nutriTemporadas.map(t => <option key={t} value={t}>{t === "Todas" ? "Todas las temporadas" : `Temporada ${t}`}</option>)}
            </select>
            <select value={nutriFechaFilter} onChange={e => setNutriFechaFilter(e.target.value)} style={{ background: COLORS.surface, color: COLORS.chalk, border: `1px solid ${COLORS.line}`, borderRadius: 7, padding: "7px 10px", fontSize: 12.5, fontFamily: "Inter, sans-serif" }}>
              {nutriFechas.map(f => <option key={f} value={f}>{f === "Todas" ? "Todas las fechas" : f}</option>)}
            </select>
            <MultiSelect options={nutriPuestos} selected={nutriPuestoFilter} onToggle={toggleNutriPuesto} onClear={() => setNutriPuestoFilter([])} colors={COLORS} allLabel="Todos los puestos" singularLabel="puesto" minWidth={140} />
            {(nutriJugadorFilter.length > 0 || nutriPuestoFilter.length > 0 || nutriTemporadaFilter !== "Todas" || nutriFechaFilter !== "Todas") && (
              <button onClick={() => { setNutriJugadorFilter([]); setNutriPuestoFilter([]); setNutriTemporadaFilter("Todas"); setNutriFechaFilter("Todas"); }} style={{ background: "transparent", color: COLORS.turf, border: `1px solid ${COLORS.turfDim}`, borderRadius: 7, padding: "7px 12px", fontSize: 12, fontFamily: "Inter, sans-serif", cursor: "pointer" }}>
                Limpiar filtros
              </button>
            )}
          </div>

          <YardDivider />

          {nutriData.length === 0 ? (
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 24, textAlign: "center" }}>
              <div style={{ color: COLORS.muted, fontSize: 13, fontFamily: "Inter, sans-serif", marginBottom: 8 }}>
                Todavía no hay datos de Nutrición cargados.
              </div>
              <div style={{ color: COLORS.muted, fontSize: 12, fontFamily: "Inter, sans-serif" }}>
                Usá el botón "Actualizar datos de Nut" de arriba para subir tu archivo SIC_Nutri_Ref.
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginBottom: 16 }}>
                <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 18 }}>
                  <SectionLabel>IMO por jugador · Sumatoria de Pliegues</SectionLabel>
                  <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: "Inter, sans-serif", marginBottom: 6 }}>
                    Usa el registro más reciente de cada jugador dentro de los filtros activos.
                  </div>
                  <div style={{ display: "flex", gap: 14, marginBottom: 10, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10.5, color: COLORS.muted, fontFamily: "Inter, sans-serif" }}>IMO Backs: <span style={{ color: "#FB923C" }}>&lt;4.6</span> · <span style={{ color: "#FACC15" }}>4.6-4.8</span> · <span style={{ color: COLORS.turf }}>&gt;4.8</span></span>
                    <span style={{ fontSize: 10.5, color: COLORS.muted, fontFamily: "Inter, sans-serif" }}>IMO Forwards: <span style={{ color: "#FB923C" }}>&lt;4.8</span> · <span style={{ color: "#FACC15" }}>4.8-5.0</span> · <span style={{ color: COLORS.turf }}>&gt;5.0</span></span>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={nutriImoChart} margin={{ bottom: 60 }}>
                      <CartesianGrid stroke={COLORS.line} strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="jugador" tick={{ fill: COLORS.muted, fontSize: 9 }} axisLine={{ stroke: COLORS.line }} tickLine={false} angle={-40} textAnchor="end" interval={0} height={70} />
                      <YAxis yAxisId="left" tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: "IMO", angle: -90, position: "insideLeft", fill: COLORS.muted, fontSize: 10.5 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: "Sumatoria Pliegues (mm)", angle: 90, position: "insideRight", fill: COLORS.muted, fontSize: 9.5 }} />
                      <Tooltip content={({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null;
                        return (
                          <div style={{ background: COLORS.surfaceAlt, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "8px 12px", fontFamily: "Inter, sans-serif", fontSize: 12 }}>
                            <div style={{ color: COLORS.chalk, fontWeight: 600, marginBottom: 4 }}>{label}</div>
                            {payload.map((p, i) => <div key={i} style={{ color: p.color }}>{p.name}: {p.value}</div>)}
                          </div>
                        );
                      }} />
                      <Legend wrapperStyle={{ fontSize: 11.5, color: COLORS.muted }} />
                      <ReferenceLine yAxisId="right" y={nutriPlieguesPromedio} stroke={COLORS.amber} strokeOpacity={0.5} strokeDasharray="5 4" label={{ value: `Prom. pliegues: ${nutriPlieguesPromedio}mm`, position: "insideTopRight", fill: COLORS.amber, fontSize: 9.5 }} />
                      <Bar yAxisId="left" dataKey="imo" name="IMO" radius={[4, 4, 0, 0]}>
                        {nutriImoChart.map((d, i) => <Cell key={i} fill={imoColorFor(d.imo, d.puesto)} />)}
                        <LabelList dataKey="imo" position="insideTop" fill={COLORS.bg} fontSize={9.5} fontWeight={600} />
                      </Bar>
                      <Line yAxisId="right" type="monotone" dataKey="pliegues" name="Sumatoria Pliegues (mm)" stroke={COLORS.amber} strokeWidth={2.5} dot={{ r: 3, fill: COLORS.amber }}>
                        <LabelList dataKey="pliegues" position="bottom" fill={COLORS.amber} fontSize={8.5} />
                      </Line>
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginBottom: 16 }}>
                <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 18 }}>
                  <SectionLabel>
                    Evolución histórica · IMO y Sumatoria de Pliegues
                    <span style={{ marginLeft: 8, fontSize: 11, fontFamily: "Inter, sans-serif", fontWeight: 500, color: COLORS.muted, textTransform: "none" }}>
                      responde al filtro de jugadores
                    </span>
                  </SectionLabel>
                  {nutriJugadorFilter.length === 0 ? (
                    <div style={{ color: COLORS.muted, fontSize: 12.5, fontFamily: "Inter, sans-serif", padding: "10px 2px" }}>
                      Elegí uno o más jugadores en el filtro de arriba para ver su evolución a lo largo del tiempo.
                    </div>
                  ) : nutriEvolucionPorJugador.length === 0 ? (
                    <div style={{ color: COLORS.muted, fontSize: 12.5, fontFamily: "Inter, sans-serif", padding: "10px 2px" }}>
                      Sin registros históricos para esta selección.
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: nutriEvolucionPorJugador.length > 1 ? "1fr 1fr" : "1fr", gap: 16 }}>
                      {nutriEvolucionPorJugador.map((rj) => (
                        <div key={rj.jugador}>
                          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, color: COLORS.chalk, marginBottom: 6 }}>{rj.jugador}</div>
                          <ResponsiveContainer width="100%" height={260}>
                            <ComposedChart data={rj.registros} margin={{ bottom: 50 }}>
                              <CartesianGrid stroke={COLORS.line} strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="fecha" tick={{ fill: COLORS.muted, fontSize: 9 }} axisLine={{ stroke: COLORS.line }} tickLine={false} angle={-40} textAnchor="end" interval={0} height={60} />
                              <YAxis yAxisId="left" tick={{ fill: COLORS.muted, fontSize: 10.5 }} axisLine={false} tickLine={false} label={{ value: "IMO", angle: -90, position: "insideLeft", fill: COLORS.muted, fontSize: 10 }} />
                              <YAxis yAxisId="right" orientation="right" tick={{ fill: COLORS.muted, fontSize: 10.5 }} axisLine={false} tickLine={false} label={{ value: "Pliegues (mm)", angle: 90, position: "insideRight", fill: COLORS.muted, fontSize: 9 }} />
                              <Tooltip content={({ active, payload, label }) => {
                                if (!active || !payload || !payload.length) return null;
                                return (
                                  <div style={{ background: COLORS.surfaceAlt, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "8px 12px", fontFamily: "Inter, sans-serif", fontSize: 12 }}>
                                    <div style={{ color: COLORS.chalk, fontWeight: 600, marginBottom: 4 }}>{label}</div>
                                    {payload.map((p, i) => <div key={i} style={{ color: p.color }}>{p.name}: {p.value}</div>)}
                                  </div>
                                );
                              }} />
                              <Legend wrapperStyle={{ fontSize: 10.5, color: COLORS.muted }} />
                              <ReferenceLine yAxisId="right" y={rj.avgPliegues} stroke={COLORS.amber} strokeOpacity={0.5} strokeDasharray="5 4" label={{ value: `Prom: ${rj.avgPliegues}mm`, position: "insideTopRight", fill: COLORS.amber, fontSize: 9 }} />
                              <Bar yAxisId="left" dataKey="imo" name="IMO" radius={[4, 4, 0, 0]}>
                                {rj.registros.map((r, i) => <Cell key={i} fill={imoColorFor(r.imo, r.puesto)} />)}
                                <LabelList dataKey="imo" position="insideTop" fill={COLORS.bg} fontSize={9} fontWeight={600} />
                              </Bar>
                              <Line yAxisId="right" type="monotone" dataKey="pliegues" name="Sumatoria de Pliegues" stroke={COLORS.amber} strokeWidth={2.5} dot={{ r: 3, fill: COLORS.amber }}>
                                <LabelList dataKey="pliegues" position="bottom" fill={COLORS.amber} fontSize={8} />
                              </Line>
                            </ComposedChart>
                          </ResponsiveContainer>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 18 }}>
                  <SectionLabel>Composición corporal · 5 componentes</SectionLabel>
                  <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: "Inter, sans-serif", marginBottom: 10 }}>
                    {nutriJugadorFilter.length === 1 ? `Jugador: ${nutriJugadorFilter[0]} (registro más reciente)` : "Promedio del plantel filtrado · elegí un solo jugador en el filtro para verlo individual"}
                  </div>
                  {nutriComposicionData.length === 0 ? (
                    <div style={{ color: COLORS.muted, fontSize: 12.5, fontFamily: "Inter, sans-serif" }}>Sin datos para esta selección.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie data={nutriComposicionData} dataKey="pct" nameKey="name" cx="50%" cy="50%" outerRadius={95} label={({ name, pct }) => `${pct}%`}>
                          {nutriComposicionData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                        </Pie>
                        <Legend wrapperStyle={{ fontSize: 10.5, color: COLORS.muted }} />
                        <Tooltip content={({ active, payload }) => {
                          if (!active || !payload || !payload.length) return null;
                          const p = payload[0].payload;
                          return (
                            <div style={{ background: COLORS.surfaceAlt, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "8px 12px", fontFamily: "Inter, sans-serif", fontSize: 12 }}>
                              <div style={{ color: COLORS.chalk, fontWeight: 600 }}>{p.name}</div>
                              <div style={{ color: p.fill }}>{p.pct}% · valor {p.value}</div>
                            </div>
                          );
                        }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 18 }}>
                  <SectionLabel>Comparativo de Masa Ósea</SectionLabel>
                  <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: "Inter, sans-serif", marginBottom: 10 }}>
                    Registro más reciente de cada jugador dentro de los filtros activos.
                  </div>
                  {nutriMasaOseaData.length === 0 ? (
                    <div style={{ color: COLORS.muted, fontSize: 12.5, fontFamily: "Inter, sans-serif" }}>Sin datos de Masa ósea para esta selección.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={Math.max(260, nutriMasaOseaData.length * 26)}>
                      <BarChart data={nutriMasaOseaData} layout="vertical" margin={{ left: 10 }}>
                        <CartesianGrid stroke={COLORS.line} strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" tick={{ fill: COLORS.muted, fontSize: 10 }} axisLine={false} tickLine={false} label={{ value: "Masa ósea", position: "insideBottom", offset: -5, fill: COLORS.muted, fontSize: 10 }} />
                        <YAxis dataKey="jugador" type="category" width={130} tick={{ fill: COLORS.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                        <ReferenceLine x={nutriMasaOseaPromedio} stroke={COLORS.chalk} strokeOpacity={0.5} strokeDasharray="5 4" label={{ value: `Prom: ${nutriMasaOseaPromedio}`, position: "top", fill: COLORS.muted, fontSize: 10 }} />
                        <Tooltip content={({ active, payload }) => {
                          if (!active || !payload || !payload.length) return null;
                          const p = payload[0].payload;
                          return (
                            <div style={{ background: COLORS.surfaceAlt, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "8px 12px", fontFamily: "Inter, sans-serif", fontSize: 12 }}>
                              <div style={{ color: COLORS.chalk, fontWeight: 600, marginBottom: 2 }}>{p.jugador}</div>
                              <div style={{ color: COLORS.muted, marginBottom: 4 }}>{p.puesto}</div>
                              <div style={{ color: COLORS.blue }}>Masa ósea: {p.masaOsea}</div>
                            </div>
                          );
                        }} />
                        <Bar dataKey="masaOsea" name="Masa ósea" fill={COLORS.blue} radius={[0, 4, 4, 0]}>
                          <LabelList dataKey="masaOsea" position="insideRight" fill={COLORS.bg} fontSize={10.5} fontWeight={600} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 18, overflowX: "auto" }}>
                <SectionLabel>Registros de Nutrición</SectionLabel>
                <div className="print-expand" style={{ maxHeight: 480, overflowY: "auto" }}>
                  <table>
                    <thead>
                      <tr style={{ color: COLORS.muted, borderBottom: `1px solid ${COLORS.line}`, textTransform: "uppercase", fontSize: 10, letterSpacing: "0.04em" }}>
                        {[["jugador", "Jugador"], ["fecha", "Fecha"], ["temporada", "Temporada"], ["puesto", "Puesto"]].map(([key, label]) => (
                          <th key={key} onClick={() => toggleNutriSort(key)} style={{ cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }} title="Ordenar">
                            {label}
                            <span style={{ marginLeft: 4, opacity: nutriSortCol === key ? 1 : 0.25 }}>
                              {nutriSortCol === key ? (nutriSortDir === "asc" ? "▲" : "▼") : "▲▼"}
                            </span>
                          </th>
                        ))}
                        {nutriExtraCols.map(c => (
                          <th key={c} onClick={() => toggleNutriSort(c)} style={{ cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }} title="Ordenar">
                            {c === "IM/O" ? "IMO" : c}
                            <span style={{ marginLeft: 4, opacity: nutriSortCol === c ? 1 : 0.25 }}>
                              {nutriSortCol === c ? (nutriSortDir === "asc" ? "▲" : "▼") : "▲▼"}
                            </span>
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedNutri.map((r, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${COLORS.line}` }}>
                        <td style={{ fontWeight: 500 }}>{r.jugador}</td>
                        <td style={{ color: COLORS.muted, fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5 }}>{r.fecha}</td>
                        <td style={{ color: COLORS.muted }}>{r.temporada}</td>
                        <td style={{ color: COLORS.muted }}>{r.puesto}</td>
                        {nutriExtraCols.map(c => {
                          if (c === "IM/O") {
                            const imoVal = fmt1(parseFloat(r[c]) || 0);
                            return (
                              <td key={c} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                <span style={{
                                  display: "inline-flex", alignItems: "center", gap: 5,
                                  background: imoColorFor(imoVal, r.puesto) + "22", border: `1px solid ${imoColorFor(imoVal, r.puesto)}`,
                                  borderRadius: 6, padding: "2px 8px", color: imoColorFor(imoVal, r.puesto), fontWeight: 600
                                }}>
                                  {imoVal}
                                </span>
                              </td>
                            );
                          }
                          if (c === "Score z-adiposo") {
                            const zVal = fmt1(parseFloat(r[c]) || 0);
                            return (
                              <td key={c} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                <span style={{
                                  display: "inline-flex", alignItems: "center", gap: 5,
                                  background: zAdiposoColorFor(zVal, r.puesto) + "22", border: `1px solid ${zAdiposoColorFor(zVal, r.puesto)}`,
                                  borderRadius: 6, padding: "2px 8px", color: zAdiposoColorFor(zVal, r.puesto), fontWeight: 600
                                }}>
                                  {zVal}
                                </span>
                              </td>
                            );
                          }
                          return <td key={c} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{String(r[c] ?? "")}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            </>
          )}
        </>
      )}

      {tab === "bienestar" && (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
            <StatCard icon={HeartPulse} label="Encuestas" value={filteredWellness.length.toLocaleString("es-AR")} unit="" />
            <StatCard icon={TrendingUp} label="Score Promedio" value={wellnessAvgTotal} unit="/25" accent={COLORS.blue} />
            <StatCard icon={AlertTriangle} label="Alertas (score ≥17)" value={alertasWellness} unit="" accent={COLORS.red} />
            <StatCard icon={Users} label="Jugadores" value={new Set(filteredWellness.map(d => d.jugador)).size} unit="" />
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }} className="no-print">
            <Filter size={14} color={COLORS.muted} />
            <select value={jugadorFilterW} onChange={e => setJugadorFilterW(e.target.value)} style={{ background: COLORS.surface, color: COLORS.chalk, border: `1px solid ${COLORS.line}`, borderRadius: 7, padding: "7px 10px", fontSize: 12.5, fontFamily: "Inter, sans-serif" }}>
              {jugadoresWellness.map(j => <option key={j} value={j}>{j}</option>)}
            </select>
            <select value={fechaFilterW} onChange={e => setFechaFilterW(e.target.value)} style={{ background: COLORS.surface, color: COLORS.chalk, border: `1px solid ${COLORS.line}`, borderRadius: 7, padding: "7px 10px", fontSize: 12.5, fontFamily: "Inter, sans-serif" }}>
              {fechasWellness.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            {(jugadorFilterW !== "Todos" || fechaFilterW !== "Todos") && (
              <button onClick={() => { setJugadorFilterW("Todos"); setFechaFilterW("Todos"); }} style={{ background: "transparent", color: COLORS.turf, border: `1px solid ${COLORS.turfDim}`, borderRadius: 7, padding: "7px 12px", fontSize: 12, fontFamily: "Inter, sans-serif", cursor: "pointer" }}>
                Limpiar filtros
              </button>
            )}
          </div>

          <YardDivider />

          {wellnessData.length === 0 ? (
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 24, textAlign: "center" }}>
              <div style={{ color: COLORS.muted, fontSize: 13, fontFamily: "Inter, sans-serif", marginBottom: 8 }}>
                Todavía no hay datos de Bienestar cargados.
              </div>
              <div style={{ color: COLORS.muted, fontSize: 12, fontFamily: "Inter, sans-serif" }}>
                Usá el botón "Actualizar Bienestar" de arriba para subir tu archivo SIC_Control_Bienestar.
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, marginBottom: 16 }}>
                <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 18 }}>
                  <SectionLabel>Evolución de las 5 dimensiones</SectionLabel>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={wellnessPorFecha} margin={{ bottom: 40 }}>
                      <CartesianGrid stroke={COLORS.line} strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="fecha" tick={{ fill: COLORS.muted, fontSize: 9 }} axisLine={{ stroke: COLORS.line }} tickLine={false} angle={-40} textAnchor="end" height={55} interval={Math.max(0, Math.ceil(wellnessPorFecha.length / 15) - 1)} />
                      <YAxis domain={[0, 5]} tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 10.5, color: COLORS.muted }} />
                      <Line type="monotone" dataKey="Cansancio" stroke={COLORS.amber} strokeWidth={2} dot={{ r: 2 }} />
                      <Line type="monotone" dataKey="Recuperacion" stroke={COLORS.turf} strokeWidth={2} dot={{ r: 2 }} />
                      <Line type="monotone" dataKey="Sueno" stroke={COLORS.blue} strokeWidth={2} dot={{ r: 2 }} />
                      <Line type="monotone" dataKey="Dolor" stroke={COLORS.red} strokeWidth={2} dot={{ r: 2 }} />
                      <Line type="monotone" dataKey="Mental" stroke="#A78BFA" strokeWidth={2} dot={{ r: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 18 }}>
                  <SectionLabel>Perfil promedio del plantel</SectionLabel>
                  <ResponsiveContainer width="100%" height={280}>
                    <RadarChart data={wellnessRadarData} outerRadius="70%">
                      <PolarGrid stroke={COLORS.line} />
                      <PolarAngleAxis dataKey="dimension" tick={{ fill: COLORS.muted, fontSize: 10.5 }} />
                      <PolarRadiusAxis domain={[0, 5]} tick={{ fill: COLORS.muted, fontSize: 9 }} axisLine={false} />
                      <Radar dataKey="value" stroke={COLORS.turf} fill={COLORS.turf} fillOpacity={0.35} label={{ fill: COLORS.chalk, fontSize: 11, fontWeight: 600 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 18 }}>
                  <SectionLabel>Zonas de dolor más frecuentes</SectionLabel>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={wellnessZonasDolor} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid stroke={COLORS.line} strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" tick={{ fill: COLORS.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="zona" type="category" width={130} tick={{ fill: COLORS.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" name="Menciones" fill={COLORS.red} radius={[0, 4, 4, 0]}>
                        <LabelList dataKey="count" position="insideRight" fill={COLORS.bg} fontSize={11} fontWeight={600} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 18, overflowX: "auto" }}>
                  <SectionLabel>Jugadores a monitorear (mayor score reciente)</SectionLabel>
                  <table>
                    <thead>
                      <tr style={{ color: COLORS.muted, borderBottom: `1px solid ${COLORS.line}`, textTransform: "uppercase", fontSize: 10, letterSpacing: "0.04em" }}>
                        <th>Jugador</th><th>Fecha</th><th>Zona dolor</th><th>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jugadoresRiesgo.map((r, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${COLORS.line}` }}>
                          <td style={{ fontWeight: 500 }}>{r.jugador}</td>
                          <td style={{ color: COLORS.muted, fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5 }}>{r.fecha}</td>
                          <td style={{ color: COLORS.muted, fontSize: 11.5 }}>{r.zonaDolor || "—"}</td>
                          <td style={{ fontFamily: "'JetBrains Mono', monospace", color: r.total >= 17 ? COLORS.red : r.total >= 12 ? COLORS.amber : COLORS.turf, fontWeight: 600 }}>{r.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}

      <div style={{ marginTop: 24, fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: COLORS.muted, textAlign: "center" }}>
        Fuente: planillas SIC_Carga &amp; SIC_BiP · datos cargados desde Google Drive
      </div>
    </div>
  );
}
