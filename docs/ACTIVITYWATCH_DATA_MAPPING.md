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

Implementacion aplicada en DATA-04:
- Se usa Opcion A con query canónica (`RETURN = events`) y agregacion frontend en 24 bins horarios del dia ActivityWatch.
- Los eventos que cruzan horas se reparten proporcionalmente entre franjas.

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

5. Diferencias con "Time active" de la UI oficial:
- Si usamos solo `window + AFK not-afk` y corte de dia a medianoche UTC, el KPI puede diferir de ActivityWatch web UI.
- La UI oficial puede incluir `audible_events` (desde bucket web) como extension de `not-afk`.
- El corte diario debe respetar `startOfDay` de `GET /api/0/settings` (en esta instalacion: `07:00`), no asumir siempre `00:00`.

## 8) Orden propuesto para la integracion real (sin implementarla aun)

1. DATA-02: crear capa de descubrimiento de buckets activos (window/afk/web) y validacion de disponibilidad.
2. DATA-03: conectar KPI de tiempo total diario usando Query API + filtro AFK.
3. DATA-04: conectar tarjeta "Uso por horas" con agregacion por hora en frontend.
4. DATA-05: conectar ranking por apps y por sitios.
5. DATA-06: definir y aplicar primera version de reglas de categorizacion local.
6. DATA-07: sustituir mocks del dashboard de forma incremental con fallback seguro.

## 9) Requisitos de desarrollo local (CORS)

- Para consumir la API local de ActivityWatch desde el frontend en desarrollo (`http://127.0.0.1:5173`), es necesario habilitar ese origen en `aw-server`.
- Configuracion aplicada y validada en Windows:
- Archivo: `C:\Users\tomas\AppData\Local\activitywatch\activitywatch\aw-server\aw-server.toml`
- Seccion `[server]`:
- `cors_origins = "http://127.0.0.1:5173"`
- Validacion manual realizada desde consola del navegador:
- `fetch("http://localhost:5600/api/0/info")` responde correctamente con `hostname` y `version` (`v0.13.2`).

## 10) Aprendizajes de DATA-03-DEBUG (KPI diario)

- Query implementada inicialmente (simplificada) para `2026-05-16`:
- `window + AFK not-afk` con `timeperiod` `2026-05-16T00:00:00+00:00/2026-05-16T23:59:59+00:00`
- Resultado: `19092.114s` (`5h 18m`)
- UI oficial ActivityWatch para la misma fecha:
- `6h 28m 43s` (`23323.868s`)
- Verificacion tecnica:
- Al aplicar query canonica (union de `not_afk` con `audible_events` de web cuando corresponda) y corte diario segun `startOfDay=07:00`:
- `2026-05-16T07:00:00+02:00/2026-05-17T06:59:59+02:00`
- Resultado: `23323.868s` (coincide con UI oficial)
- Implicacion para DATA-03-FIX:
- El KPI debe alinearse con la query canonica de ActivityWatch y construir el intervalo diario segun `startOfDay` de settings + zona horaria local.

## 11) DATA-03-FIX aplicado

- Implementacion final para KPI diario:
1. Descubrir buckets dinamicamente (`window`, `afk`, `web`) con `discoverActivityWatchBuckets()`.
2. Leer `GET /api/0/settings` y obtener `startOfDay`.
3. Construir `timeperiod` diario en hora local usando `startOfDay`:
- ejemplo con `day=2026-05-16` y `startOfDay=07:00`:
- `2026-05-16T07:00:00+02:00/2026-05-17T06:59:59+02:00`
4. Ejecutar query canonica equivalente a ActivityWatch web UI:
- `events = flood(window)`
- `not_afk = flood(afk)` + filtro `status=not-afk`
- si hay bucket web: `browser_events` + `audible_events` + `period_union(not_afk, audible_events)`
- `events = filter_period_intersect(events, not_afk)`
- `RETURN = sum_durations(events)`

- Comportamiento de fallback:
- si `/settings` falla: usar `startOfDay=00:00` con warning
- si falta bucket web: seguir sin `audible_events` (resultado puede variar segun instalacion)
- si fallan discovery/query o faltan buckets esenciales: no romper UI y conservar fallback visual en KPI

## 12) DATA-03-FIX-DEBUG-2: seleccion de bucket web

- Comparativa ejecutada para el mismo dia (`2026-05-16`) y mismo intervalo con `startOfDay=00:00`:
- `2026-05-16T00:00:00+02:00/2026-05-16T23:59:59+02:00`

- Variante A (bucket web `aw-watcher-web-chrome`):
- `19064.837s` => `5h 17m 45s`

- Variante B (bucket web `aw-watcher-web-chrome_LenovoTomy`):
- `24126.820s` => `7h 42m 7s`

- Referencia UI oficial ActivityWatch:
- `6h 42m 6s` (`24126s`)

- Conclusiones:
1. La discrepancia actual no depende de `startOfDay` (ya confirmado en `00:00`).
2. La seleccion de bucket web cambia de forma decisiva el KPI.
3. La variante con bucket `_LenovoTomy` reproduce practicamente el valor oficial.

- Causa de seleccion actual incorrecta:
- `discoverActivityWatchBuckets()` toma el primer bucket `web.tab.current` devuelto por `/buckets/`, que en esta instalacion es `aw-watcher-web-chrome` (sin sufijo de host).

- Regla propuesta para DATA-03-FIX-2:
- Si hay multiples buckets web de tipo `web.tab.current`, preferir el que termine en `_${hostname}` usando `hostname` de `/api/0/info`.
- Si no existe coincidencia por hostname, fallback a la seleccion actual.

## 13) DATA-03-FIX-2 aplicado

- La capa de discovery ya prioriza bucket web por host activo:
1. lee `hostname` desde `GET /api/0/info`
2. filtra candidatos `web.tab.current`
3. prioriza el bucket cuyo id termina en `_${hostname}`
4. si no existe, fallback a la regla anterior (primer `web.tab.current`, despues prefijo `aw-watcher-web-`)

- Implicacion directa:
- En instalaciones con bucket legacy y bucket con sufijo de host, el KPI usa el bucket del host activo y evita desalineaciones como la observada en DATA-03-FIX-DEBUG-2.

## 14) DATA-04 aplicado (tarjeta "Uso por horas")

- Nueva funcion: `getHourlyActiveUsage({ day })`.
- Reutiliza:
1. discovery dinamico de buckets (incluida prioridad web por hostname)
2. lectura de `startOfDay` desde settings
3. query canónica de actividad
- Flujo:
1. Query canónica con `RETURN = events`
2. Construccion del rango diario ActivityWatch (24h)
3. Agregacion de segundos activos por cada una de las 24 horas consecutivas del rango
4. Normalizacion de barras respecto a la hora maxima
- Decisión visual:
- barra azul = franja con mayor tiempo de uso real.
- En caso de fallo (API/query/buckets):
- fallback a barras mock y warning controlado en consola.

## 15) DATA-05 aplicado (capa de desglose por apps y sitios)

- Nuevas funciones reutilizables en capa API:
1. `getDailyApplicationUsage({ day })`
2. `getDailyWebsiteUsage({ day })`

- Criterios tecnicos compartidos:
1. discovery dinamico de buckets
2. `startOfDay` leido desde `/settings`
3. rango ActivityWatch del dia solicitado
4. buckets seleccionados por host activo

- Resultado de `getDailyApplicationUsage`:
- lista ordenada por duracion descendente
- campos: `app`, `seconds`, `formattedDuration`, `classificationHints`

- Resultado de `getDailyWebsiteUsage`:
- lista ordenada por duracion descendente
- agrupacion por dominio (`hostname` sin `www.`)
- campos: `domain`, `seconds`, `formattedDuration`, `sampleUrl`, `classificationHints`
- si una URL no es parseable, se agrupa como `unknown`

- Validacion manual disponible:
- `npm run check:activitywatch-usage`
- imprime bloque `[DATA-05-VERIFY] Daily application and website usage` con top apps y top domains reales para `2026-05-16`.

## 16) DATA-05-WEB-DEBUG (websites en depuracion)

- Hallazgo de validacion manual:
- aplicaciones alineadas con ActivityWatch oficial.
- websites no alineados aun en pestaña Browser (caso destacado: `chatgpt.com`).

- Hipotesis tecnica en evaluacion:
- el calculo actual usa eventos web demasiado crudos.
- ActivityWatch Browser parece aplicar pipeline:
1. eventos web
2. interseccion con ventanas activas de navegador
3. `split_url_events(...)`
4. agrupacion por dominio.

- Verificacion temporal activa en navegador:
- bloque `[DATA-05-WEB-DEBUG] Website usage comparison` con:
1. Variante A (actual)
2. Variante B (browser-style)
3. comparacion frente a valores oficiales
4. conclusion de coincidencia relativa.

## 17) DATA-05-WEB-FIX aplicado (websites aprobado)

- Resultado de la depuracion:
- la Variante B (Browser Style) replica ActivityWatch Browser para `2026-05-16` con diferencias sub-segundo.
- Se adopta como implementacion oficial para websites.

- Pipeline final de `getDailyWebsiteUsage({ day })`:
1. obtener eventos web del bucket seleccionado por host
2. intersectar con ventanas activas de navegador
3. aplicar `split_url_events(...)`
4. agrupar por dominio (`hostname` sin `www.`)

- Estado de DATA-05:
- `getDailyApplicationUsage({ day })` aprobado
- `getDailyWebsiteUsage({ day })` aprobado
- tarea cerrada

## 18) DATA-06 implementado (capa de categorizacion diaria)

- Nueva funcion reutilizable:
- `getDailyCategoryUsage({ day })`

- Objetivo tecnico:
- repartir el tiempo activo diario en categorias sin doble conteo:
1. Estudio
2. Entretenimiento
3. Productividad
4. Otros

- Regla de asignacion estable:
1. prioridad dominio web cuando hay navegacion activa asociada
2. fallback a aplicacion activa si no hay web asociada
3. fallback final a `Otros`

- Estrategia anti-doble-conteo:
- la base de calculo son eventos activos canonicos del dia
- en eventos de navegador se reparte por solapamiento con eventos web Browser Style
- el tiempo remanente de cada evento se clasifica una sola vez por app/`Otros`

- Salida de `getDailyCategoryUsage({ day })`:
- `category`
- `seconds`
- `formattedDuration`
- `percentage` (respecto al total categorizado)

- Validacion temporal activa en navegador:
- bloque `[DATA-06-VERIFY] Category usage consistency`
- compara total KPI diario vs total categorizado y marca `OK` si diferencia <= 2s.

## 19) DATA-06 cerrado

- La verificacion de coherencia quedo validada para `2026-05-16`:
- KPI diario: `24126.820s`
- total categorizado: `24128.158s`
- diferencia: `1.338s` (`OK`, dentro del margen <= `2s`)
- El bloque temporal de consola `[DATA-06-VERIFY] Category usage consistency` fue retirado.
- En funcionamiento normal quedan solo warnings de fallo real al cargar/categorizar datos.

## 20) DATA-07 implementado (tarjeta visual de categorias)

- La tarjeta visual de categorias ya consume `getDailyCategoryUsage({ day })` (dia fijo actual `2026-05-16`).
- Se mantiene orden visual estable de categorias:
1. Estudio
2. Entretenimiento
3. Productividad
4. Otros
- Las barras usan el porcentaje real devuelto por la capa de categorizacion.
- En caso de fallo de carga se mantiene fallback mock sin romper UI.
- DATA-07-CLOSE: retirado el bloque temporal de consola `[DATA-07-VERIFY]`; en funcionamiento normal quedan solo warnings de fallo real.

## 21) Notas tecnicas para roadmap futuro (DATA-08 y DATA-09)

- Para **DATA-08** (detalle real por categoria), la capa de datos debera devolver desglose diario por categoria con items de app/sitio y duracion (sin doble conteo), reutilizando la misma base canonica de actividad ya validada.
- Para **DATA-09** (detalle real por franja horaria), las consultas o transformaciones deberan permitir filtrar/segmentar eventos por intervalo horario especifico y devolver top apps/sitios de esa franja.

## 22) DATA-08 implementado (detalle real por categoria)

- Se implemento `getDailyCategoryDetailUsage({ day, category })` para obtener el detalle real de una categoria concreta.
- La funcion reutiliza la misma clasificacion por tramos de `getDailyCategoryUsage`:
- prioridad `web -> app -> Otros`
- sin doble conteo
- El detalle por categoria devuelve items mezclando fuentes `website` y `application`, con duracion y porcentaje relativo dentro de la categoria.

## 23) Reglas editables de categorizacion (DATA-08-FIX)

- `getDailyCategoryUsage` y `getDailyCategoryDetailUsage` consumen reglas editables por categoria desde `localStorage`.
- Si no hay reglas persistidas validas, se usa fallback a reglas por defecto del proyecto.
- Estructura de reglas por categoria:
- `domains[]`
- `applications[]`
- Esta capa mantiene la clasificacion por tramos ya validada (prioridad `web -> app -> Otros`, sin doble conteo).

## 24) DATA-09 (detalle por franja horaria)

- Nueva capacidad de datos: detalle real por barra horaria mediante `getHourlyUsageDetail({ day, hourIndex })`.
- Base de calculo:
- eventos activos canonicos del dia ActivityWatch
- recorte estricto al intervalo de una hora (`hourIndex`)
- prioridad web por solapamiento temporal con eventos de navegador
- fallback a app para tiempo remanente
- sin doble conteo
- Salida orientada a UI:
- `intervalLabel`
- `totalSeconds` / `formattedTotal`
- items ordenados por duracion (`website` + `application`) con porcentaje relativo
- Criterio de coherencia:
- el total del detalle horario debe coincidir con el total de la barra correspondiente (tolerancia operativa <= 2s por redondeo flotante).

## 25) NAV-DATE-01 (navegacion diaria)

- El dashboard ya no usa dia fijo y pasa `day` dinamico (`selectedDay`) a:
- `getDailyActiveUsage({ day })`
- `getHourlyActiveUsage({ day })`
- `getDailyCategoryUsage({ day })`
- `getDailyCategoryDetailUsage({ day, category })`
- `getHourlyUsageDetail({ day, hourIndex })`
- La capa de datos mantiene la misma semantica ActivityWatch por dia:
- `startOfDay` leido desde settings
- construccion de `timeperiod` local para el dia solicitado
- Al cambiar `day`, solo cambia la entrada del calculo; no cambia la estrategia canonica de actividad.

## 26) RANGE-WEEK-01 (agregacion semanal)

- Se anadio capa reutilizable por rango de dias (base para semana y futuro mes):
- `getRangeActiveUsage({ startDay, endDay })`
- `getRangeDailyUsageSeries({ startDay, endDay })`
- `getRangeCategoryUsage({ startDay, endDay })`
- `getRangeCategoryDetailUsage({ startDay, endDay, category })`
- Estrategia aplicada:
- el resumen semanal se construye agregando resultados diarios ya canonicos, manteniendo:
- `startOfDay` por dia
- buckets dinamicos por host
- prioridad web -> app donde corresponda
- sin doble conteo relevante
- Coherencia esperada del modo semanal:
- total semanal ~= suma de 7 barras diarias (tolerancia <= 2s por flotantes)
- total semanal ~= suma de categorias semanales (tolerancia <= 2s por flotantes)

## 27) RANGE-WEEK-01-FIX (semana calendario)

- El modo `Semana` se interpreta como semana natural lunes-domingo.
- Para semana actual, los dias futuros se presentan a `0` en UI para mantener 7 columnas fijas y coherencia visual de calendario.
- El KPI semanal y categorias semanales siguen agregacion por rango completo lunes-domingo.
- El clic en barra semanal (si no es futura) mantiene el modo `Semana`, selecciona ese dia y usa `getDailyCategoryUsage({ day })` para mostrar categorias del dia seleccionado dentro del contexto semanal.
- Si se vuelve a pulsar la misma barra seleccionada, se limpia la seleccion y se recupera el agregado semanal de categorias.
- El eje vertical del grafico semanal debe expresarse en horas dinamicas (`xh`) segun el maximo diario visible del rango.
- La seleccion de dia semanal no debe recargar KPI semanal ni serie de 7 barras: solo recarga la tarjeta de categorias en contexto diario.
- La media diaria semanal se calcula sobre dias considerados:
- semana actual: dias transcurridos desde lunes hasta hoy (inclusive)
- semanas cerradas: 7 dias
- En UX semanal, la seleccion de un dia no invalida el resumen semanal completo: KPI y serie de 7 dias se preservan desde cache; solo cambia la consulta/contexto de categorias.
- Se usa cache de sesion en memoria para alternancia `Dia`/`Semana` y para contexto de categorias semanal vs dia seleccionado.
- El switch visual `Semana | Dia` del grafico semanal no cambia la capa de datos: solo refleja/gestiona `selectedWeekDay` para alternar entre categorias agregadas semanales y categorias del dia seleccionado.

## 28) RANGE-MONTH-01 (resumen mensual simple)

- El modo `Mes` usa mes natural (`dia 1` -> `ultimo dia`) y reutiliza consultas de rango ya existentes.
- KPI mensual: `getRangeActiveUsage({ startDay, endDay })`.
- Serie mensual para grafico por semanas: `getRangeDailyUsageSeries({ startDay, endDay })` y agregacion frontend en bloques `S1..Sn` por tramos de 7 dias dentro del mes.
- Categorias mensuales: `getRangeCategoryUsage({ startDay, endDay })`.
- Si el mes es actual, los dias futuros se consideran `0` para evitar inflar barras/totales.
- La vista mensual se mantiene intencionalmente simple (sin detalle interactivo por semana/dia en esta fase).
