# IMPLEMENTATION_REPORT

## Resumen de lo creado hasta ahora

- Se inicializo un proyecto frontend desde cero con React, Vite y Tailwind CSS.
- Se dejo una estructura base de carpetas preparada para crecer por paginas, componentes, features y utilidades compartidas.
- Se creo una pagina inicial simple para confirmar que la app funciona.
- Se anadio un README con instrucciones de arranque y contexto del proyecto.
- Se preparo una base minima para la futura integracion con ActivityWatch sin activar todavia llamadas reales.
- Se anadio `UI_IMPLEMENTATION_PLAN.md` en la raiz con el plan detallado para la primera iteracion de UI basada en mocks.
- Se implemento la tarea UI-01 con la base visual del dashboard principal usando mocks estaticos y sin activar todavia tarjetas, paneles o modales.
- Se realizo un refinamiento visual de UI-01 para acercar proporciones del header del dashboard, selector de fecha y bloque KPI a la referencia de Figma.
- Se corrigio la alineacion vertical de UI-01 para subir el bloque principal y dejar espacio natural inferior para las futuras tarjetas.
- Se aplico un microajuste final de UI-01 reduciendo los espacios verticales internos entre tabs, fecha y KPI para una composicion mas compacta y fiel al Figma.
- Se implemento UI-02 anadiendo las dos tarjetas principales del dashboard con datos mock estaticos: "Uso por horas" (barras verticales) y resumen por categorias (barras horizontales).
- Se implemento UI-03 con panel lateral de configuracion mock, apertura desde boton flotante, overlay con atenuacion y blur, y cierre por boton X o click sobre overlay.
- Se implemento UI-04 con modal centrado de detalle de categoria sobre el panel lateral, usando datos mock de aplicaciones, duraciones y barras de progreso.
- Se implemento UI-05 con modal de edicion de categoria mock, abierto desde una accion "Editar" en el modal de detalle y cierre por X o boton Cancelar.
- Se completo UI-06 revisando el flujo entero y aplicando un refactor ligero del estado de interfaz para consolidar panel y modales sin cambios visuales.
- Se completo DATA-01 con analisis tecnico de la API local de ActivityWatch sobre la instalacion real y documentacion de mapeo en `docs/ACTIVITYWATCH_DATA_MAPPING.md`.
- Se completo DATA-02 con una capa de descubrimiento dinamico de buckets y validacion basica de disponibilidad en `src/lib/api/activitywatch.js`, sin conectar todavia datos a la UI.
- Se completo DATA-02-VERIFY con un script manual de terminal para comprobar el discovery de buckets contra ActivityWatch local.
- Se documento y valido la configuracion CORS para desarrollo local, confirmando comunicacion navegador (`127.0.0.1:5173`) -> ActivityWatch (`localhost:5600`).
- Se completo DATA-03 conectando el KPI central de "Tiempo total de uso" a dato real de ActivityWatch (fecha fija `2026-05-16`) con calculo canonico `window + AFK not-afk`.
- Se completo DATA-03-DEBUG para investigar discrepancia entre KPI de la app y "Time active" oficial de ActivityWatch.
- Se completo DATA-03-FIX corrigiendo rango diario y query para alinear el KPI con ActivityWatch oficial.
- Se inicio DATA-03-FIX-DEBUG: logs temporales de diagnostico en navegador para comprobar ejecucion real del KPI y aislar discrepancia restante.
- Se completo DATA-03-FIX-DEBUG-2 comparando la query canonica con ambos buckets web disponibles para aislar el efecto del bucket seleccionado.
- Se completo DATA-03-FIX-2 corrigiendo la seleccion de bucket web para priorizar el bucket del host activo.
- Se completo DATA-03-CLOSE retirando logs temporales de depuracion del KPI y dejando solo warnings de fallo real.
- Se completo DATA-04 conectando la tarjeta "Uso por horas" con datos reales canónicos agrupados en 24 franjas horarias.
- Se completo DATA-04-VERIFY validando coherencia exacta entre KPI diario y suma horaria (diferencia `0s` para `2026-05-16`).
- Se completo DATA-04-CLOSE retirando logs temporales de verificacion horaria y manteniendo solo warnings utiles de fallo real.
- Se completo DATA-05 creando funciones reutilizables para desglose diario real por aplicaciones y sitios web, sin conectarlas todavia a la UI.
- Se inicio DATA-05-VERIFY-BROWSER con logs temporales en consola del navegador para validar DATA-05 en el entorno real (CORS navegador -> ActivityWatch).
- Se inicio DATA-05-WEB-DEBUG para comparar websites Variante A (actual) vs Variante B (estilo ActivityWatch Browser) sin modificar todavia la logica final.
- Se completo DATA-05-WEB-FIX: websites migrado a logica Browser Style validada y retirada toda la instrumentacion temporal de debug.
- Se implemento DATA-06 con primera capa real de categorizacion diaria sin doble conteo, manteniendo UI visual intacta.

## Archivos y carpetas principales actuales

### Raiz del proyecto

- `package.json`: scripts y dependencias del proyecto.
- `package-lock.json`: lockfile de npm.
- `vite.config.js`: configuracion de Vite con React y Tailwind.
- `eslint.config.js`: configuracion de lint.
- `index.html`: entrada HTML principal.
- `README.md`: guia de arranque y contexto general.
- `scripts/`: utilidades de ejecucion para Vite en este entorno.
- `scripts/check-activitywatch-buckets.mjs`: comprobacion manual de desarrollo para validar `discoverActivityWatchBuckets()`.
- `scripts/check-activitywatch-usage.mjs`: comprobacion manual para validar desglose diario real por aplicaciones y sitios web.
- `public/`: assets publicos.
- `src/`: codigo fuente principal.

### Estructura de src

- `src/main.jsx`: punto de entrada de React.
- `src/index.css`: estilos globales y carga de Tailwind.
- `src/app/App.jsx`: composicion principal de la app.
- `src/pages/HomePage.jsx`: pagina inicial actual.
- `src/components/layout/AppShell.jsx`: contenedor visual base.
- `src/features/dashboard/components/WelcomeHero.jsx`: base visual actual del dashboard principal.
- `src/mocks/dashboard.js`: mocks estaticos para el estado visual inicial del dashboard.
- `src/features/dashboard/components/WelcomeHero.jsx`: incluye ahora tambien las dos tarjetas principales de UI-02.
- `src/mocks/dashboard.js`: ampliado con mocks de uso por horas, etiquetas horarias y categorias resumen.
- `src/features/dashboard/components/WelcomeHero.jsx`: incorpora tambien la logica visual de UI-03 para mostrar y ocultar el panel lateral de configuracion.
- `src/mocks/dashboard.js`: ampliado con `appCount` para renderizar numero de aplicaciones por categoria en el panel.
- `src/features/dashboard/components/WelcomeHero.jsx`: incorpora tambien la apertura y cierre del modal de detalle de categoria sobre el panel lateral.
- `src/mocks/dashboard.js`: ampliado con datos `categoryDetail` para el modal (items, duraciones y progreso).
- `src/features/dashboard/components/WelcomeHero.jsx`: incorpora tambien el modal de edicion visual con input mock y acciones Cancelar/Guardar.
- `src/mocks/dashboard.js`: ampliado con datos `categoryEdit` para encabezado, texto explicativo, lista y placeholder.
- `src/lib/api/activitywatch.js`: punto base para centralizar la futura integracion con ActivityWatch.
- `src/lib/api/activitywatch.js`: ahora incluye descubrimiento dinamico de buckets (`window`, `afk`, `web`) y manejo normalizado de errores/ausencias.
- `src/lib/api/activitywatch.js`: ahora incluye tambien `getDailyActiveUsage({ day })` y `formatUsageFromSeconds(...)` para obtener y formatear el KPI real diario.
- `src/lib/api/activitywatch.js`: ahora incluye lectura de `/settings`, construccion de timeperiod segun `startOfDay` y query canonica con soporte de `audible_events`.
- `src/lib/api/activitywatch.js`: ahora incluye lectura de `/info` para priorizar bucket web `web.tab.current` coincidente con `_${hostname}`.
- `src/lib/api/activitywatch.js`: ahora incluye `getHourlyActiveUsage({ day })` con agregacion horaria y reparto de eventos que cruzan limites de hora.
- `src/lib/api/activitywatch.js`: ahora incluye `getDailyApplicationUsage({ day })` y `getDailyWebsiteUsage({ day })` para preparar la futura capa de categorias.
- `src/lib/api/activitywatch.js`: ahora incluye `getDailyCategoryUsage({ day })` y reglas iniciales de clasificacion por dominio/app con fallback a `Otros`.
- `src/features/dashboard/components/WelcomeHero.jsx`: el KPI usa dato real de ActivityWatch con fallback al valor mock si falla la carga.
- `src/features/dashboard/components/WelcomeHero.jsx`: la grafica "Uso por horas" ahora consume estado real horario con fallback a mocks.
- `docs/ACTIVITYWATCH_DATA_MAPPING.md`: mapeo tecnico de buckets, eventos, endpoints y estrategia de integracion real (sin sustituir mocks aun).
- `src/assets/`: recursos graficos del scaffold inicial.

## Verificaciones tecnicas superadas

- Build de produccion completada correctamente.
- Lint ejecutado sin errores.
- Servidor local de desarrollo arrancado y comprobado en local.
- La base visual de la home se ajusto al primer estado del dashboard de Figma con mocks estaticos.
- UI-01 recibio un ajuste fino de escala tipografica y compactacion de controles sin ampliar alcance funcional.
- UI-01 tambien recibio un ajuste de posicionamiento vertical del bloque principal, manteniendo intacta su escala visual.
- UI-01 quedo refinada con menor separacion vertical entre bloques principales, sin cambios de estructura ni alcance funcional.
- UI-02 quedo implementada visualmente con tarjetas y graficos basados en HTML/CSS/Tailwind sin librerias externas.
- UI-03 quedo implementada visualmente con drawer lateral y overlay de fondo, sin modales ni integracion real de categorias.
- UI-04 quedo implementada visualmente con modal de detalle mock, sin editar datos ni logica de guardado.
- UI-05 quedo implementada visualmente con modal de edicion mock, sin persistencia ni validaciones de formulario.
- UI-06 dejo el flujo consolidado y sin estado duplicado de modales.
- Validacion manual en entorno Ubuntu/WSL confirmada:
- `npm run lint` -> OK
- `npm run build` -> OK
- El error previo con `@rolldown/binding-win32-x64-msvc` se debia al entorno de ejecucion Windows sobre ruta montada, no al codigo del proyecto.
- DATA-01 validada contra API local real (`http://localhost:5600/api/0/`) con respuestas de buckets, eventos y queries agregadas.
- DATA-02 validada con lint tras introducir capa de descubrimiento API sin impacto visual en la UI.
- Build de DATA-02 pendiente de revalidacion en un shell Ubuntu/WSL con `npm` disponible en PATH (en esta sesion `npm` no estaba disponible dentro de `wsl.exe`).
- DATA-02-VERIFY anade una validacion manual reproducible desde terminal via `npm run check:activitywatch-buckets`.
- Comunicacion navegador -> ActivityWatch validada manualmente desde `http://127.0.0.1:5173` con `fetch("http://localhost:5600/api/0/info")` devolviendo `hostname: LenovoTomy` y `version: v0.13.2`.
- DATA-03 implementada con manejo de fallback: si discovery/query falla, se conserva el valor mock del KPI y se registra warning controlado en consola.

## Funcion actual de src/lib/api/activitywatch.js

- Expone la URL base de la API local de ActivityWatch.
- Incorpora `discoverActivityWatchBuckets()` para consultar `GET /api/0/buckets/` y detectar dinamicamente buckets de:
- actividad de ventana/apps (`currentwindow` / `aw-watcher-window*`)
- AFK (`afkstatus` / `aw-watcher-afk*`)
- web (`web.tab.current` / `aw-watcher-web-*`)
- Devuelve una respuesta estable con:
- `ok`
- `buckets` (`window`, `afk`, `web`)
- `missing`
- `warnings`
- `error`
- Maneja explicitamente ActivityWatch no disponible y ausencia parcial de buckets sin romper la UI.

## DATA-02: Descubrimiento dinamico de buckets

- Se evito hardcodear ids con hostname en la capa API.
- La deteccion prioriza `type` de bucket y usa fallback por prefijo de `id`.
- Se definio semantica de disponibilidad:
- falta `window`: warning critico (impacta KPI y base de uso)
- falta `afk`: warning no bloqueante (sin filtro canonico not-afk)
- falta `web`: warning no bloqueante (sin desglose de sitios)
- No se conecto todavia esta capa al dashboard ni se sustituyeron mocks.

## DATA-02-VERIFY: Comprobacion manual desde terminal

- Se anadio un script tecnico para validar el resultado de discovery sin tocar la UI:
- `npm run check:activitywatch-buckets`
- El script imprime un resumen legible con:
- disponibilidad de ActivityWatch (`ok`)
- bucket detectado para `window`, `afk` y `web`
- lista `missing`
- lista `warnings`
- `error` detallado si existe

## DATA-03: KPI real de tiempo total diario

- Se anadio una consulta reutilizable `getDailyActiveUsage({ day })` en capa API.
- Flujo tecnico aplicado:
- discovery dinamico de buckets (`window` y `afk`)
- construccion de `timeperiods` ISO para el dia solicitado
- `POST /api/0/query/` con interseccion de ventana contra AFK `not-afk`
- suma total con `sum_durations(window)`
- El KPI central ahora se hidrata en `WelcomeHero` al montar el componente.
- Decision de estado de carga/fallo en esta iteracion:
- se mantiene inicialmente el valor mock para evitar parpadeos bruscos
- al resolver correctamente, se reemplaza por valor real formateado (`Xh Ym`)
- si falla, no se rompe UI y queda fallback con log en consola

## DATA-03-DEBUG: discrepancia con ActivityWatch oficial

- Problema observado para `2026-05-16`:
- KPI app: `5h 18m` (19092.114s)
- ActivityWatch oficial: `6h 28m 43s` (23323.868s)
- Query actual implementada en `getDailyActiveUsage`:
- `afk = flood(...)` + filtro `not-afk`
- `window = flood(...)`
- `filter_period_intersect(window, afk)`
- `sum_durations(window)`
- Timeperiod enviado actualmente por la app:
- `2026-05-16T00:00:00+00:00/2026-05-16T23:59:59+00:00`
- Hallazgo clave 1 (query):
- La UI oficial usa logica canonica mas completa: incluye `browser_events` y hace `period_union(not_afk, audible_events)` cuando hay bucket web.
- Hallazgo clave 2 (rango temporal):
- En `GET /api/0/settings` la instalacion tiene `startOfDay: "07:00"`.
- Al evaluar query canonica con intervalo alineado a ese inicio de dia (`2026-05-16T07:00:00+02:00/2026-05-17T06:59:59+02:00`) el resultado coincide con la UI oficial: `23323.868s` (`6h 28m 43s`).
- Conclusión:
- La discrepancia no viene solo de timezone; viene de ambos factores: query simplificada y corte de dia diferente al configurado en ActivityWatch.
- Estado:
- DATA-03 queda funcional pero pendiente de correccion (DATA-03-FIX) para alinearse al calculo oficial.

## DATA-03-FIX: alineacion con ActivityWatch oficial

- Se incorporo `getActivityWatchSettings()` para leer `GET /api/0/settings`.
- El intervalo diario ya no asume medianoche UTC; se construye con `startOfDay` en hora local del sistema.
- Para `day=2026-05-16` y `startOfDay=07:00`, el periodo aplicado queda:
- `2026-05-16T07:00:00+02:00/2026-05-17T06:59:59+02:00`
- `getDailyActiveUsage` ahora usa query canonica equivalente a ActivityWatch web UI:
- `events = flood(window)`
- `not_afk = flood(afk)` + filtro `status = not-afk`
- si existe bucket web: construccion de `browser_events`, calculo de `audible_events`, y `period_union(not_afk, audible_events)`
- `events = filter_period_intersect(events, not_afk)`
- `RETURN = sum_durations(events)`
- Fallback y resiliencia:
- si `/settings` falla, se usa `startOfDay=00:00` y se agrega warning no bloqueante
- si falla discovery/query o faltan buckets esenciales, se mantiene comportamiento seguro existente (sin romper UI)
- Resultado esperado tras el fix para `2026-05-16`: KPI aproximado `6h 28m`, alineado con ActivityWatch oficial.

## DATA-03-FIX-DEBUG: evidencia en consola

- Se anadio salida de diagnostico temporal al cargar el dashboard en `WelcomeHero` con un bloque:
- `[DATA-03-FIX-DEBUG] Daily KPI diagnostics`
- El bloque imprime:
- dia solicitado
- `startOfDay` leido desde settings
- `timeperiod` final construido
- buckets detectados (`window`, `afk`, `web`)
- query exacta enviada a `/api/0/query/`
- respuesta cruda de query
- segundos interpretados por `getDailyActiveUsage`
- texto final enviado al KPI
- estado de fallback (si se activa, motivo + valor mostrado)
- Tambien se amplio `getDailyActiveUsage` para devolver metadatos `debug` estructurados sin alterar la UI visual.
- Estado actual: DATA-03-FIX sigue en depuracion hasta validar este bloque con evidencia real del navegador.

## DATA-03-FIX-DEBUG-2: comparativa de buckets web

- Contexto confirmado por diagnostico:
- `startOfDay = 00:00` (correcto en la instalacion actual), por lo que la discrepancia no viene del rango diario.
- Intervalo usado para la comparativa:
- `2026-05-16T00:00:00+02:00/2026-05-16T23:59:59+02:00`
- Buckets existentes de tipo `web.tab.current`:
- `aw-watcher-web-chrome`
- `aw-watcher-web-chrome_LenovoTomy`
- Resultado de query canonica variante A (bucket web sin sufijo):
- `19064.837s` => `5h 17m 45s`
- Resultado de query canonica variante B (bucket web con sufijo `_LenovoTomy`):
- `24126.820s` => `7h 42m 7s`
- Referencia oficial ActivityWatch para 2026-05-16:
- `6h 42m 6s` (`24126s`)
- Lectura tecnica:
- La seleccion del bucket web afecta de forma critica el KPI.
- `discoverActivityWatchBuckets()` selecciona actualmente el bucket sin sufijo porque toma el primer `web.tab.current` segun orden de `/buckets/`.
- Regla de correccion propuesta para siguiente paso (DATA-03-FIX-2):
- si hay multiples buckets web candidatos, preferir el bucket cuyo id termine en `_${hostname}` obtenido desde `/api/0/info` (ej. `_LenovoTomy`); si no existe, fallback a la regla actual.

## DATA-03-FIX-2: seleccion de bucket web por host activo

- Se ajusto `discoverActivityWatchBuckets()` para:
- consultar `/api/0/info` y leer `hostname`
- cuando hay multiples buckets `web.tab.current`, priorizar el que termina en `_${hostname}`
- si no hay coincidencia por hostname, mantener fallback a la seleccion previa (primer bucket `web.tab.current`, luego prefijo `aw-watcher-web-`)
- Se mantuvo intacta la logica de deteccion de buckets `window` y `afk`.
- Se mantuvieron los logs temporales de DATA-03-FIX-DEBUG para validar en navegador el bucket web seleccionado y el KPI final.

## DATA-03-CLOSE: limpieza de depuracion

- Se elimino del flujo normal el bloque de consola:
- `[DATA-03-FIX-DEBUG] Daily KPI diagnostics`
- Se retiraron logs informativos temporales de:
- dia solicitado
- `startOfDay`
- `timeperiod`
- buckets detectados
- query enviada
- respuesta cruda
- segundos interpretados
- texto enviado al KPI
- estado de fallback detallado de debug
- Se mantuvo el warning util en caso de fallo real:
- `console.warn('No se pudo cargar KPI real de ActivityWatch...', ...)`
- Estado final de DATA-03:
- KPI real conectado, alineado con ActivityWatch oficial, y sin ruido de debug en condiciones normales.

## DATA-04: Uso por horas real

- Se reutilizo la misma base canónica validada en DATA-03 (window + afk + web/audible + startOfDay).
- Se implemento `getHourlyActiveUsage({ day })` en capa API:
- ejecuta query canónica con `RETURN = events`
- construye el rango ActivityWatch del dia (`startOfDay` + 24h)
- agrega duracion activa en 24 bins horarios consecutivos
- prorratea eventos cuando cruzan limites de hora
- normaliza barras al maximo horario para render visual proporcional
- Se mantuvo el diseño visual existente de la tarjeta.
- Decisión de resaltado:
- la barra azul es la hora con mayor actividad real del dia.
- Criterio de etiquetas:
- se mantienen las etiquetas UI actuales (`00, 03, 06, 09, 12, 15, 18, 21`) para preservar consistencia visual en esta iteracion.
- Manejo de fallos:
- si falla carga horaria o faltan buckets, se conserva fallback mock y se emite warning controlado en consola.

## DATA-04-VERIFY: coherencia KPI diario vs suma horaria

- Se anadio un bloque temporal de diagnostico en consola al cargar dashboard para `2026-05-16`:
- `[DATA-04-VERIFY] Hourly usage consistency`
- El bloque imprime:
- total diario real (segundos) usado por KPI
- total horario agregado (segundos) usado por barras
- diferencia absoluta en segundos
- ambos totales formateados (`Xh Ym`)
- validacion final `OK` o `MISMATCH`
- Criterio de validacion:
- `OK` si la diferencia es <= 2 segundos (tolerancia por redondeo/prorrateo flotante).
- Resultado validado:
- `daily KPI total seconds = 24126.82`
- `hourly bars total seconds = 24126.82`
- `difference seconds = 0`
- `validation = OK`

## DATA-04-CLOSE: limpieza de depuracion

- Se elimino del flujo normal el bloque temporal:
- `[DATA-04-VERIFY] Hourly usage consistency`
- Se retiraron estos logs temporales:
- `daily KPI total seconds`
- `hourly bars total seconds`
- `difference seconds`
- `daily KPI formatted`
- `hourly sum formatted`
- `validation: OK / MISMATCH`
- Se mantiene intacta la logica funcional de DATA-04:
- `getHourlyActiveUsage({ day })`
- agregacion por solapamiento en 24 franjas
- coherencia con KPI diario
- barra azul para la hora de mayor uso
- Se mantienen warnings utiles solo ante fallos reales de carga.

## DATA-05: capa de datos para apps y sitios

- Se implementaron dos funciones reutilizables en `src/lib/api/activitywatch.js`:
- `getDailyApplicationUsage({ day })`
- `getDailyWebsiteUsage({ day })`
- Ambas reutilizan:
- discovery dinamico de buckets
- lectura de `startOfDay` desde settings
- rango diario ActivityWatch coherente con el KPI
- selecciÃ³n de bucket web por hostname activo
- Estructura devuelta preparada para categorizacion futura:
- aplicaciones: `app`, `seconds`, `formattedDuration`, `classificationHints`
- sitios: `domain`, `seconds`, `formattedDuration`, `sampleUrl`, `classificationHints`
- DecisiÃ³n para websites:
- agrupacion por dominio (`hostname` sin `www.`), no por URL completa.
- Se anadio validacion manual sin UI:
- `npm run check:activitywatch-usage`
- salida esperada: bloque `[DATA-05-VERIFY] Daily application and website usage` con top apps y top domains.
- Limitacion de entorno detectada:
- en este proyecto, la comprobacion por script Node en WSL no alcanza `http://localhost:5600` porque ActivityWatch corre en Windows; la validacion fiable para DATA-05 se hace temporalmente desde consola del navegador.
- Verificacion temporal activa en frontend:
- `WelcomeHero` imprime bloque `[DATA-05-VERIFY] Daily application and website usage (TEMP)` al cargar la pantalla para `2026-05-16`, mostrando top 10 de apps y top 10 de dominios.

## DATA-05-WEB-DEBUG: discrepancia websites

- Estado validado manualmente:
- `getDailyApplicationUsage({ day })` aprobado (coincide con ActivityWatch oficial).
- `getDailyWebsiteUsage({ day })` pendiente (discrepancia en Browser, especialmente `chatgpt.com`).
- Se anadio comparacion temporal A/B en navegador:
- bloque de consola `[DATA-05-WEB-DEBUG] Website usage comparison`.
- Variante A:
- calculo actual de `getDailyWebsiteUsage` (eventos web crudos agrupados por dominio).
- Variante B:
- calculo estilo Browser de ActivityWatch:
- web events intersectados con ventanas activas de navegador
- `split_url_events(...)`
- agrupacion por dominio.
- El bloque imprime:
- top domains de A
- top domains de B
- comparacion contra valores oficiales de referencia
- conclusion de coincidencia relativa (A vs B).

## DATA-05-WEB-FIX: websites alineado con ActivityWatch Browser

- Queda demostrado por validacion manual que la Variante B reproduce ActivityWatch Browser con diferencias sub-segundo para `2026-05-16`.
- Implementacion final aplicada:
- `getDailyWebsiteUsage({ day })` ahora usa la pipeline Browser Style:
- eventos web del bucket correcto
- interseccion con ventanas activas de navegador
- `split_url_events(...)`
- agrupacion por dominio
- contrato de salida mantenido:
- `domain`
- `seconds`
- `formattedDuration`
- `sampleUrl`
- `classificationHints`
- Limpieza aplicada:
- eliminado bloque temporal `[DATA-05-WEB-DEBUG] Website usage comparison` de consola en frontend.
- eliminado uso de funciones auxiliares de debug en UI.
- Estado de DATA-05:
- aplicaciones aprobadas
- websites aprobados
- DATA-05 cerrada.

## DATA-06: primera capa de categorizacion real

- Se implemento `getDailyCategoryUsage({ day })` en capa API.
- Criterios aplicados:
- prioridad dominio web cuando hay navegacion activa asociada
- fallback a aplicacion activa cuando no hay dominio asociado
- fallback final a `Otros`
- Sin doble conteo:
- cada tramo activo se asigna a una sola categoria usando solapamiento temporal en eventos de navegador.
- Categorias iniciales:
- `Estudio`
- `Entretenimiento`
- `Productividad`
- `Otros`
- Se anadio bloque temporal de verificacion en navegador:
- `[DATA-06-VERIFY] Category usage consistency`
- muestra KPI diario vs total categorizado, diferencia y validacion `OK/MISMATCH`.

## Pendiente antes de empezar la UI real

- Dejar cerradas las reglas de trabajo y documentacion del proyecto.
- Consolidar microajustes de responsive y accesibilidad en la UI mock.
- Mantener la app sin integracion real con ActivityWatch hasta completar la fase de UI mock.

## DATA-01: Analisis tecnico de ActivityWatch

- Se detectaron buckets reales de ventana, AFK y web en la instalacion local:
- `aw-watcher-window_LenovoTomy`
- `aw-watcher-afk_LenovoTomy`
- `aw-watcher-web-chrome_LenovoTomy` (y variante `aw-watcher-web-chrome`)
- Se verifico el esquema real de eventos:
- ventana: `data.app`, `data.title`, `duration`, `timestamp`
- afk: `data.status`, `duration`, `timestamp`
- web: `data.url`, `data.title`, `duration`, `timestamp`
- Se verifico `POST /api/0/query/` con formato correcto de `timeperiods` en intervalos ISO (`inicio/fin`) para agregados reales.
- Quedo documentado que:
- KPI total diario puede conectarse directamente con ventana intersectada con AFK `not-afk`.
- uso por horas requiere transformacion adicional por franja en frontend.
- categorias requieren reglas locales de clasificacion (app/url -> categoria).

## Flujo actual de UI mock

- Apertura de panel: el boton flotante del dashboard activa `isSettingsOpen`.
- Cierre de panel: se puede cerrar con la `X` del panel o pulsando el overlay de fondo.
- Apertura de modal de detalle: al pulsar una categoria del panel se activa `activeModal = 'detail'`.
- Cierre de modal de detalle: se cierra con su `X` y vuelve a `activeModal = null`.
- Apertura de modal de edicion: desde la accion `Editar` dentro del modal de detalle se cambia a `activeModal = 'edit'`.
- Cierre de modal de edicion: se cierra con su `X`, con `Cancelar` y tambien con `Guardar cambios` (solo cierre visual, sin persistencia).

## Estado de interfaz y mocks

- El estado de interfaz vive en `src/features/dashboard/components/WelcomeHero.jsx`.
- `isSettingsOpen` controla el drawer lateral.
- `activeModal` controla si hay modal activo (`null`, `detail`, `edit`).
- Los datos siguen siendo 100% mock en `src/mocks/dashboard.js`:
- resumen principal (`timeRanges`, fecha, total)
- grafico horario (`hourlyUsage`, `hourLabels`)
- categorias (`categories`, `appCount`)
- detalle de categoria (`categoryDetail`)
- edicion de categoria (`categoryEdit`)
