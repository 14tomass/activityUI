# ACTIVITYWATCH_DATA_MAPPING

## 1) Resumen de la API local de ActivityWatch

- Base API detectada: `http://localhost:5600/api/0/`
- Playground interactivo disponible: `http://localhost:5600/api/`
- Version detectada en la instalacion local: `v0.13.2`
- Endpoints clave verificados en local:
- `GET /api/0/info`
- `GET /api/0/buckets/`
- `GET /api/0/buckets/{bucket_id}/events`
- `POST /api/0/query/`

La API esta operativa y devuelve datos reales de la ultima semana en esta instalacion.

## 2) Buckets detectados en esta instalacion

Buckets observados via `GET /api/0/buckets/`:

1. `aw-watcher-window_LenovoTomy`
- Tipo: `currentwindow`
- Uso: actividad de aplicaciones/ventanas (app + titulo)

2. `aw-watcher-afk_LenovoTomy`
- Tipo: `afkstatus`
- Uso: estado `afk`/`not-afk` para filtrar tiempo realmente activo

3. `aw-watcher-web-chrome`
- Tipo: bucket web (legacy/sin sufijo de host)
- Uso: posible respaldo si faltan datos en bucket con host

4. `aw-watcher-web-chrome_LenovoTomy`
- Tipo: `web.tab.current`
- Uso: actividad web por URL/titulo de pestana

5. `aw-stopwatch`
- Tipo: stopwatch/manual
- Uso: no necesario para el dashboard actual MVP

## 3) Bucket recomendado para cada bloque del dashboard

1. KPI "Tiempo total de uso"
- Bucket principal: `aw-watcher-window_LenovoTomy`
- Filtro de actividad real: interseccion con `aw-watcher-afk_LenovoTomy` (estado `not-afk`)

2. Tarjeta "Uso por horas"
- Fuente: eventos de `aw-watcher-window_LenovoTomy`
- Filtro: interseccion con AFK `not-afk`
- Transformacion: agrupar duraciones por hora local del dia

3. Tiempo por aplicacion
- Fuente: `aw-watcher-window_LenovoTomy`
- Clave de agrupacion: `data.app`
- Opcional: desambiguar por `data.title` en casos puntuales

4. Tiempo por sitio web
- Fuente principal: `aw-watcher-web-chrome_LenovoTomy`
- Clave de agrupacion: `data.url` (y/o normalizacion por dominio)
- Respaldo si hiciera falta: `aw-watcher-web-chrome`

5. Resumen por categorias (Estudio, Entretenimiento, Productividad, Otros)
- Fuente combinada: tiempo por app + tiempo por web
- Requiere capa de reglas local (mapeo app/url -> categoria)
- No sale directo de un bucket unico; necesita transformacion adicional

## 4) Endpoints y consultas necesarios

## 4.1 Listado y seleccion de buckets

- `GET /api/0/buckets/`
- Objetivo: detectar buckets disponibles segun watcher y hostname real

## 4.2 Lectura de eventos crudos por rango

- `GET /api/0/buckets/{bucket_id}/events?start=ISO&end=ISO`
- Uso: depuracion y transformaciones frontend por hora/categoria

## 4.3 Agregados con Query API (recomendado)

- `POST /api/0/query/`
- Nota importante validada en local: `timeperiods` debe enviarse como lista de intervalos ISO:
- Ejemplo: `["2026-05-16T00:00:00+00:00/2026-05-17T00:00:00+00:00"]`

Consultas objetivo para el dashboard:

1. Tiempo total de uso diario:
- Filtrar AFK a `not-afk`
- Intersectar ventanas con AFK
- `sum_durations(...)`

2. Tiempo por aplicacion:
- Misma base filtrada (window intersect AFK)
- `merge_events_by_keys(..., ["app"])`
- `sort_by_duration(...)`

3. Tiempo por sitio web:
- Base web del rango
- `merge_events_by_keys(..., ["url"])`
- `sort_by_duration(...)`

4. Distribucion por horas:
- Opcion A: traer eventos filtrados y agrupar en frontend por hora local
- Opcion B: evaluar query mas avanzada por bloques horarios (mas compleja)

## 5) Estructura real de eventos observada

## 5.1 Eventos de ventana/aplicacion (`currentwindow`)

Campos relevantes observados:
- `timestamp`
- `duration`
- `data.app`
- `data.title`

Ejemplo breve:

```json
{
  "timestamp": "2026-05-15T20:37:53.633247+00:00",
  "duration": 49.355364,
  "data": {
    "app": "chrome.exe",
    "title": "YouTube - Google Chrome"
  }
}
```

## 5.2 Eventos AFK (`afkstatus`)

Campos relevantes:
- `timestamp`
- `duration`
- `data.status` (`afk` o `not-afk`)

Ejemplo breve:

```json
{
  "timestamp": "2026-05-15T20:37:53.629837+00:00",
  "duration": 89.359694,
  "data": {
    "status": "not-afk"
  }
}
```

## 5.3 Eventos web (`web.tab.current`)

Campos relevantes:
- `timestamp`
- `duration`
- `data.url`
- `data.title`
- `data.audible`
- `data.incognito`

Ejemplo breve:

```json
{
  "timestamp": "2026-05-15T20:37:53.635253+00:00",
  "duration": 49.352058,
  "data": {
    "url": "https://www.youtube.com/watch?v=...",
    "title": "Video title - YouTube"
  }
}
```

## 6) Que conecta directo y que requiere transformacion

Conexiones directas viables:

1. KPI de tiempo total diario (query con filtro AFK)
2. Ranking de tiempo por app
3. Ranking de tiempo por URL/sitio

Requieren logica adicional:

1. Grafico "Uso por horas" (agregacion por franja horaria en frontend)
2. Categorias Estudio/Entretenimiento/Productividad/Otros:
- definir reglas locales de clasificacion app/url
- mantener un mapeo configurable para reasignaciones
- combinar tiempos de fuentes app + web sin doble conteo

Nota de referencia canonica para integracion:
- Para calculos de tiempo activo tomaremos como base el procesamiento canonico basico de ActivityWatch: eventos de ventana intersectados con AFK `not-afk`.
- Si en iteraciones posteriores aparecen diferencias con expectativas de UI o con otros calculos agregados, se contrastaran resultados y se ajustara la estrategia de agregacion.

## 7) Riesgos y dudas tecnicas

1. Doble conteo entre ventana y web:
- Si se suman sin estrategia, puede inflarse el total.
- Recomendacion: usar ventana+AFK como base de "tiempo total" y web para desglose de sitios.

2. Buckets dependientes de hostname/dispositivo:
- Los ids incluyen sufijo de host (ej. `_LenovoTomy`).
- La integracion debe detectar dinamicamente bucket ids, no hardcodear uno fijo.

3. Timezone y cortes de dia:
- ActivityWatch guarda timestamps en UTC con offset.
- La UI debe definir claramente dia local (Europe/Madrid) para evitar desfases en horas.

4. Calidad de datos web:
- Puede haber URLs largas/ruidosas.
- Conviene normalizar por dominio para ciertos bloques visuales.

## 8) Orden propuesto para la integracion real (sin implementarla aun)

1. DATA-02: crear capa de descubrimiento de buckets activos (window/afk/web) y validacion de disponibilidad.
2. DATA-03: conectar KPI de tiempo total diario usando Query API + filtro AFK.
3. DATA-04: conectar tarjeta "Uso por horas" con agregacion por hora en frontend.
4. DATA-05: conectar ranking por apps y por sitios.
5. DATA-06: definir y aplicar primera version de reglas de categorizacion local.
6. DATA-07: sustituir mocks del dashboard de forma incremental con fallback seguro.
