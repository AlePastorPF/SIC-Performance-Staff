# SIC · Análisis del rendimiento

Panel de rendimiento deportivo del San Isidro Club (Carga GPS, Ball in Play, Nutrición y Bienestar),
con actualización **automática**: reemplazás los Excel en `data/`, y el sitio se regenera solo.

---

## Cómo actualizar los datos (lo único que tenés que hacer)

1. Andá a la carpeta `data/` de este repositorio en GitHub.
2. Reemplazá el archivo correspondiente por la versión nueva, **con el mismo nombre exacto**:

   | Archivo en `data/`              | Contenido               |
   |----------------------------------|--------------------------|
   | `SIC_Carga.xlsx`                 | Carga GPS (hoja "GPS")   |
   | `SIC_BiP.xlsx`                   | Ball in Play             |
   | `SIC_Nutri_Ref.xlsx`             | Nutrición                |
   | `SIC_Control_Bienestar.xlsx`     | Bienestar                |

3. Confirmá el cambio (commit) directo en GitHub, o hacé `git push` si trabajás desde tu compu.

Eso es todo. GitHub Actions detecta el cambio, corre el script de build, **verifica que el sitio
generado funcione** (sin errores de JavaScript, con las 4 pestañas renderizando), y si todo salió
bien, actualiza `index.html` solo. No hace falta que nadie intervenga manualmente, ni que se
vuelva a pedir esto en un chat.

Podés ver el progreso en la pestaña **Actions** del repositorio. Si algo sale mal (por ejemplo,
si alguien sube un Excel con columnas distintas a las esperadas), el workflow se marca en rojo,
**no se toca el sitio publicado**, y el log de esa corrida te va a decir exactamente qué archivo
y qué columna faltó.

---

## Cómo ver el sitio publicado

Activá GitHub Pages una sola vez (si todavía no está activo):

`Settings` → `Pages` → `Source: GitHub Actions`.

(Importante: **no** es "Deploy from a branch" — el robot publica el sitio directamente desde el
workflow, así se evita un límite de GitHub donde un commit hecho por un bot no dispara la
publicación automática de Pages si la fuente es "Deploy from a branch".)

GitHub te va a dar una URL del tipo `https://tu-usuario.github.io/tu-repo/`. Ahí siempre vas a
ver la última versión de `index.html` que generó el robot.

---

## Estructura del proyecto

```
data/                       Los 4 Excel crudos. Se reemplazan para actualizar datos.
template/
  dashboard.jsx              El diseño y toda la lógica del dashboard (componente React).
  index.html                 El molde HTML donde se inyecta el código ya empaquetado.
assets/
  SIC_logo.png                El logo del club (se embebe automático en base64 al buildear).
scripts/
  build.py                    El script que hace todo: lee data/, arma el JSON, empaqueta el
                               JS con esbuild, y escribe el index.html final.
  verify_build.js              Prueba automática (smoke test): abre el sitio generado en un
                               navegador simulado, ingresa la contraseña, recorre las 4 pestañas,
                               y falla si encuentra algún error de JavaScript.
  requirements.txt             Dependencias de Python para build.py.
.github/workflows/build.yml   El robot: corre build.py + verify_build.js en cada cambio a data/,
                               y comitea el index.html actualizado si todo salió bien.
index.html                    El sitio final, ya generado. Es lo que ve el usuario.
package.json                  Dependencias de JavaScript (React, Recharts, lucide-react, esbuild).
```

---

## Correrlo en tu computadora (opcional, para probar cambios antes de subirlos)

Necesitás tener instalado Python 3.10+ y Node.js 18+.

```bash
# 1. Instalar dependencias (una sola vez)
pip install -r scripts/requirements.txt
npm install

# 2. Generar el sitio
npm run build
# (esto corre "python3 scripts/build.py" y escribe/actualiza index.html)

# 3. Verificar que no se rompió nada
npm run verify

# 4. Ver el resultado
# Abrí index.html directo con el navegador, o serví la carpeta:
python3 -m http.server 8000
# y entrá a http://localhost:8000
```

La contraseña del panel es: **`1935Zanja1935`** (definida en `template/dashboard.jsx`,
buscá `DASHBOARD_PASSWORD` si necesitás cambiarla).

---

## Si necesitás modificar el diseño o agregar un gráfico

Todo el diseño y la lógica de filtros/gráficos vive en **`template/dashboard.jsx`** (es un
componente de React normal, con Recharts para los gráficos e íconos de lucide-react). Los datos
llegan ahí como constantes ya cargadas (`CARGA_DATA`, `BIP_DATA`, `NUTRI_DATA`, `WELLNESS_DATA`) —
`scripts/build.py` es quien las llena con el contenido real de `data/` al momento del build,
reemplazando unos marcadores de texto (`__CARGA_JSON__`, etc.) que están al principio del archivo.

Si cambiás algo en `template/dashboard.jsx`, no hace falta tocar nada más: el próximo build
(automático al hacer push, o manual con `npm run build`) ya usa la versión nueva.

**Importante:** si alguna vez alguno de los Excel de origen cambia de *nombre de columna* (por
ejemplo, si "Distancia" pasa a llamarse "Distancia Total"), el build va a fallar con un error
claro indicando qué columna no encontró — no va a inventar datos ni fallar en silencio. En ese
caso hay que actualizar el mapeo correspondiente en `scripts/build.py` (las funciones
`parse_carga`, `parse_bip`, `parse_nutri` o `parse_wellness`, según cuál archivo haya cambiado).

---

## Notas sobre seguridad

La pantalla de contraseña (`1935Zanja1935`) es una **barrera básica**, no seguridad real: queda
visible en el código fuente del sitio para cualquiera que sepa buscarla en las herramientas de
desarrollador del navegador. Sirve para que alguien que reciba el link por error no vea los datos
sin querer, pero no reemplaza un control de acceso real (usuario/contraseña con backend, SSO, etc.).
Si el club necesita confidencialidad estricta, hay que sumar autenticación real en el hosting
(por ejemplo, protección por contraseña a nivel de Netlify/Vercel, o mover esto detrás de un login
corporativo), en vez de depender solo de esta pantalla.
