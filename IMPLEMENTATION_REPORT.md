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
- Se completo DATA-06-VERIFY validando coherencia para `2026-05-16` (KPI `24126.820s`, categorizado `24128.158s`, diferencia `1.338s`, `OK`).
- Se completo DATA-06-CLOSE retirando logs temporales de depuracion de categorias y manteniendo solo warnings utiles en caso de fallo real.
- Se implemento DATA-07 conectando la tarjeta visual de categorias del dashboard a datos reales de `getDailyCategoryUsage({ day: "2026-05-16" })` con fallback mock seguro.
- Se completo DATA-07-VERIFY con validacion `OK` en navegador (datos recibidos y representados correctamente en tarjeta de categorias).
- Se completo DATA-07-CLOSE retirando logs temporales de verificacion UI y manteniendo solo warnings de fallo real en carga de categorias.
- Se acordo ampliacion funcional del roadmap antes de nuevas implementaciones:
- DATA-08 para conectar el modal de detalle de categoria a desglose real por apps/sitios.
- DATA-09 para inspeccion por clic de barras en "Uso por horas" con desglose real por franja.
- Se implemento DATA-08 conectando el modal de detalle de categoria a datos reales por apps/sitios para la categoria seleccionada y el dia `2026-05-16`.
- Se implemento DATA-08-FIX corrigiendo interaccion y UX del detalle por categoria, y habilitando edicion real de reglas con persistencia local.
- Se corrigio DATA-08-FIX-INTERACTION para que el acceso principal al detalle funcione desde la tarjeta de categorias del Home, no solo desde Configuracion.

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

## DATA-06-CLOSE: limpieza de depuracion

- Se elimino del flujo normal el bloque temporal:
- `[DATA-06-VERIFY] Category usage consistency`
- Se retiraron logs temporales de:
- total diario KPI en segundos
- total categorizado en segundos
- diferencia en segundos
- listado de categorias
- validacion `OK / MISMATCH`
- Se mantiene intacta la logica funcional de DATA-06:
- `getDailyCategoryUsage({ day })`
- prioridad `web -> app -> Otros`
- reglas iniciales de clasificacion
- suma sin doble conteo relevante
- Se mantienen warnings utiles solo ante errores reales de carga/categorizacion.

## DATA-07: tarjeta visual de categorias conectada a datos reales

- Se conecto la tarjeta de categorias del dashboard a `getDailyCategoryUsage({ day: "2026-05-16" })`.
- Se mantuvo intacto el diseno visual:
- orden fijo: `Estudio`, `Entretenimiento`, `Productividad`, `Otros`
- color por categoria sin cambios
- duracion a la derecha y barra horizontal por porcentaje real
- Estrategia de carga/fallo:
- mientras carga, se conserva el mock existente para evitar parpadeo brusco
- si falla la carga, se mantiene fallback mock y se emite warning controlado en consola
- Verificacion temporal activa:
- bloque `[DATA-07-VERIFY] Category card UI data` con:
- categorias recibidas desde API
- categorias enviadas al render visual
- tiempos formateados por categoria
- porcentajes usados en barras
- estado `validation: OK / MISMATCH`

## DATA-07-CLOSE: limpieza de depuracion

- Se elimino del flujo normal el bloque temporal:
- `[DATA-07-VERIFY] Category card UI data`
- Se retiraron logs temporales de:
- categorias recibidas desde `getDailyCategoryUsage()`
- categorias enviadas al componente visual
- tiempos formateados por categoria
- porcentajes usados para las barras
- `validation: OK / MISMATCH`
- Se mantiene intacta la logica funcional ya validada:
- carga real de `getDailyCategoryUsage({ day })`
- tiempos y porcentajes reales en la tarjeta
- orden visual fijo de categorias
- Se mantiene `console.warn` solo ante fallo real al cargar categorias.

## Roadmap ampliado tras DATA-07

- **DATA-08 (pendiente)**:
- Conectar el modal de detalle de categoria (actualmente mock) a datos reales del dia seleccionado para listar apps/sitios y sus duraciones dentro de cada categoria.
- **DATA-09 (pendiente)**:
- Anadir interaccion de clic en barras de "Uso por horas" para mostrar detalle real de consumo por apps/sitios dentro de la franja seleccionada.

## DATA-08: modal de detalle de categoria con datos reales

- Se anadio `getDailyCategoryDetailUsage({ day, category })` en `src/lib/api/activitywatch.js`.
- La funcion reutiliza la misma arquitectura validada en DATA-06:
- prioridad `web -> app -> Otros`
- clasificacion por tramos
- sin doble conteo
- Devuelve:
- `category`
- `totalSeconds`
- `formattedTotal`
- `items[]` con `label`, `sourceType`, `seconds`, `formattedDuration`, `percentage`
- Se conecto el modal de detalle en `WelcomeHero`:
- al pulsar categoria en tarjeta del dashboard se abre el modal con esa categoria seleccionada
- al pulsar categoria en drawer tambien abre detalle real de esa categoria
- titulo y total del modal ahora son dinamicos
- lista del modal mezcla websites/apps segun composicion real de la categoria
- si falla la carga del detalle real, se mantiene fallback mock y warning controlado

## DATA-08-FIX-INTERACTION: flujo Home -> detalle

- Bug detectado:
- el modal estaba montado dentro del bloque condicional de `isSettingsOpen`, por lo que solo se renderizaba cuando el panel de Configuracion estaba abierto.
- Fix aplicado:
- las filas de la tarjeta de categorias del Home son clicables y abren detalle real de la categoria seleccionada.
- el modal de detalle ahora se renderiza de forma independiente al estado del panel lateral.
- el acceso desde Configuracion se mantiene como flujo secundario sin romper comportamiento.
- Verificacion temporal activa:
- bloque de consola `[DATA-08-FIX-VERIFY] Dashboard category click` con fuente, categoria pulsada, apertura de modal y validacion `OK/MISMATCH`.

## DATA-08-FIX: UX de detalle y edicion real

- Se corrigio la latencia percibida en cambio de categoria:
- al cambiar categoria se limpia inmediatamente el contenido anterior
- se activa estado de carga visible en el modal
- no se mantiene contenido obsoleto mientras llega la nueva respuesta
- En el estado estable actual ya no se conserva cache en memoria por categoria; el detalle se vuelve a cargar al abrirse.
- Flujo de Configuracion ajustado:
- clic en categoria dentro del panel abre modal de edicion (no detalle analitico).
- Modal de edicion funcional:
- carga reglas reales de la categoria seleccionada
- permite anadir reglas (heuristica simple: texto con `.` => dominio, resto => aplicacion)
- permite eliminar reglas existentes
- `Guardar cambios` persiste reglas en `localStorage`
- `Cancelar` descarta cambios no guardados
- Ajustes UX adicionales:
- modal de detalle limita el contenido visible a top 7 por duracion y agrega el resto en una fila `Otras webs y apps`
- el modal de detalle tiene altura maxima y scroll interno para evitar perder la `X` de cierre
- el modal de detalle abierto desde Home ya no muestra boton `Editar`
- en edicion de Configuracion se elimino el boton `+`; `Guardar cambios` procesa tambien el input pendiente
- Motor de categorias actualizado:
- `getDailyCategoryUsage` y `getDailyCategoryDetailUsage` consumen reglas persistidas editables
- fallback automatico a reglas por defecto si no existe persistencia
- Verificacion temporal activa:
- `[DATA-08-FIX-VERIFY] Category detail interaction`
- `[CONFIG-CATEGORIES-VERIFY] Category rules editing`
- `[CONFIG-CATEGORIES-VERIFY-2] Save input rule directly`
- `[DATA-08-UX-VERIFY] Category detail truncation`
- `[HOME-LOADING-VERIFY] Initial dashboard loading state`

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

## DATA-08-UX-FIX-2

- Se corrigio el loading infinito del modal de detalle por categoria con un ciclo de request robusto basado en token (`useRef`) y salida garantizada de estado de carga.
- Si la carga falla, el modal deja de cargar y muestra mensaje neutro de no disponible (sin bloquear cierre ni interaccion).
- `Guardar cambios` en modal de edicion ahora persiste reglas y mantiene el modal abierto; el cierre queda reservado a `X` y `Cancelar`.
- Placeholders de carga simplificados a `-` en KPI, total de detalle y duraciones de categorias durante carga.
- La tarjeta "Uso por horas" ahora renderiza 24 barras dentro del contenedor sin overflow horizontal y eje compacto que llega explicitamente a `23`.
- Verificacion temporal activa:
- `[DATA-08-DETAIL-LOADING-DEBUG] Category detail request lifecycle`
- `[CONFIG-SAVE-STAYS-OPEN-VERIFY] Category edit save behavior`

## CONFIG-CATEGORIES-FIX-3

- Comportamiento de `Guardar cambios` ajustado por caso:
- input vacio: guarda/persiste y cierra modal.
- input con texto: guarda/anade regla/persiste y mantiene modal abierto.
- Regla de inferencia corregida:
- entradas terminadas en `.exe` se clasifican como `application`.
- `http://` o `https://` y dominios validos se clasifican como `website`.
- resto de texto se clasifica como `application`.
- Normalizacion aplicada en reglas y matching:
- `trim` y comparacion case-insensitive.
- normalizacion de dominio sin `www.`.
- Migracion segura incluida:
- si una regla `.exe` estaba guardada por error en `domains`, el sanitizado la mueve automaticamente a `applications` al leer/guardar reglas.
- Bloques de verificacion temporal activos:
- `[CONFIG-SAVE-EMPTY-CLOSE-VERIFY] Save with empty input closes modal`
- `[CONFIG-SAVE-WITH-INPUT-STAYS-OPEN-VERIFY] Save with pending rule stays open`
- `[CONFIG-APP-RULE-TYPE-VERIFY] Executable app rule classification`
- `[CONFIG-CATEGORY-ENGINE-VERIFY] Saved rule affects category totals`

## CONFIG-CATEGORIES-FIX-3-CLOSE

- Se retiraron los logs temporales de validacion funcional del flujo de guardado y clasificacion:
- `[CONFIG-CATEGORIES-VERIFY-2] Save input rule directly`
- `[CONFIG-SAVE-WITH-INPUT-STAYS-OPEN-VERIFY] Save with pending rule stays open`
- `[CONFIG-APP-RULE-TYPE-VERIFY] Executable app rule classification`
- `[CONFIG-CATEGORY-ENGINE-VERIFY] Saved rule affects category totals`
- `[CONFIG-SAVE-EMPTY-CLOSE-VERIFY] Save with empty input closes modal`
- Se mantiene intacta la logica funcional validada:
- `X` cierra modal
- `Guardar` con input vacio guarda y cierra
- `Guardar` con input con texto anade/guarda y mantiene abierto
- `.exe` inferido como `application`
- normalizacion robusta (`trim` + case-insensitive) y migracion segura de reglas `.exe` mal tipadas

## DATA-08-CLOSE-FINAL

- Se retiraron los logs temporales de depuracion/validacion restantes de DATA-08:
- `[HOME-LOADING-VERIFY] Initial dashboard loading state`
- `[DATA-08-DETAIL-LOADING-DEBUG] Category detail request lifecycle`
- `[DATA-08-FIX-VERIFY] Category detail interaction`
- `[DATA-08-UX-VERIFY] Category detail truncation`
- `[CONFIG-SAVE-STAYS-OPEN-VERIFY] Category edit save behavior` (ya no presente en flujo actual)
- Se mantiene intacta la funcionalidad validada de Home->detalle real, edicion en Configuracion, truncado top 7 + agregado, placeholders neutros y grafica horaria 00-23 sin overflow.
- En funcionamiento normal quedan solo `console.warn` utiles ante fallos reales de carga/API.

## UI-LAYOUT-FIX-01

- Se recoloco el boton flotante de Configuracion para anclarlo al viewport con `position: fixed` en la zona superior derecha, evitando desplazamiento hacia el centro en pantallas anchas.
- Se mantuvo el estilo visual del boton (circulo blanco, sombra e icono centrado), ajustando solo posicion y jerarquia.
- Se corrigio el layout del panel lateral para altura completa usable:
- contenedor del panel con `h-screen` y soporte `100dvh`
- cabecera superior en posicion `sticky` para mantener titulo y `X` siempre visibles
- bloque de contenido con `overflow-y-auto` para scroll interno cuando hay mas contenido
- Resultado: categorias inferiores y boton "Crear nueva categoria" quedan accesibles sin recortes.

## CONFIG-CATEGORIES-CREATE-01

- Se implemento creacion real de categorias desde el panel lateral de Configuracion.
- Flujo nuevo:
- click en `Crear nueva categoria` abre modal de creacion
- validacion de nombre (`trim`, no vacio, sin duplicados case-insensitive)
- `Guardar` crea categoria, persiste en `localStorage` y actualiza Settings/Home
- Se adapto la capa de categorias para soportar categorias dinamicas:
- reglas ya no dependen solo de lista fija; se conservan categorias base y se anaden categorias de usuario
- persistencia incluye metadatos de orden/colores para categorias nuevas
- Integracion en UI:
- categorias nuevas aparecen en lista de Configuracion (editables) y en tarjeta del Home
- categorias sin uso muestran valor neutro (`0h 0m`) y barra vacia
- detalle de categoria desde Home funciona tambien para categorias nuevas (estado vacio limpio si no hay uso)
- Integracion en motor:
- el clasificador y agregador usan lista dinamica de categorias
- si una regla se asigna a categoria nueva, el uso pasa a esa categoria y deja de computarse en fallback previo
- Criterio de color:
- categoria nueva recibe color automatico de una paleta corta predefinida; si se agota, fallback neutro.
- Verificacion temporal activa:
- `[CONFIG-CATEGORY-CREATE-VERIFY] New category creation`
- `[CONFIG-CATEGORY-CREATE-ENGINE-VERIFY] New category participates in engine`

## CONFIG-CATEGORIES-CREATE-01-CLOSE

- Se retiraron los logs temporales de validacion:
- `[CONFIG-CATEGORY-CREATE-VERIFY] New category creation`
- `[CONFIG-CATEGORY-CREATE-ENGINE-VERIFY] New category participates in engine`
- Se mantiene intacta la funcionalidad aprobada:
- creacion real de categorias con validaciones
- persistencia en `localStorage`
- aparicion en Configuracion y Home
- edicion de reglas sobre categorias nuevas
- participacion en motor de categorizacion dinamico
- Mejoras futuras no bloqueantes registradas:
- eliminar categorias
- renombrar categorias
- personalizar color de categorias

## DATA-09

- Se implemento detalle real por franja horaria al hacer clic en barras de "Uso por horas".
- Nueva funcion de capa API: `getHourlyUsageDetail({ day, hourIndex })`.
- Retorno estructurado:
- `hourIndex`
- `intervalLabel`
- `totalSeconds`
- `formattedTotal`
- `items[]` con `label`, `sourceType`, `seconds`, `formattedDuration`, `percentage`
- Criterio de calculo:
- base de eventos activos canonicos por dia ActivityWatch
- prioridad web por solapamiento temporal con eventos de navegador
- fallback a aplicacion para tiempo remanente
- sin doble conteo
- Integracion en UI:
- las 24 barras son clicables
- al pulsar, se abre modal inmediatamente con loading y se limpia estado previo
- control robusto de clicks rapidos con token de request para evitar respuestas viejas
- Manejo visual:
- top 7 items + fila agregada `Otras webs y apps` cuando aplica
- estado vacio limpio para franjas sin actividad
- mensaje neutro y `console.warn` en caso de fallo real de carga
- Verificacion temporal activa:
- `[DATA-09-VERIFY] Hourly bar detail consistency` (coherencia entre total de barra y total del modal, tolerancia <= 2s)

## DATA-09-CLOSE

- Se retiro el bloque temporal de consola `[DATA-09-VERIFY] Hourly bar detail consistency`.
- Se mantuvo intacta la logica funcional validada del detalle por franja (clic en barra, total coherente, top 7 + agregado, loading robusto y estado vacio).
- En funcionamiento normal se conservan solo warnings utiles ante fallos reales de ActivityWatch.

## NAV-DATE-01

- El dashboard deja de depender de la fecha fija `2026-05-16` y usa estado central `selectedDay`.
- Se inicializa el dia seleccionado con el dia ActivityWatch actual, leyendo `startOfDay` desde `/api/0/settings` (fallback `00:00`).
- La fecha del selector superior ahora es dinamica y se actualiza con flechas:
- flecha izquierda: dia anterior
- flecha derecha: dia siguiente, bloqueada al llegar al dia ActivityWatch actual (sin navegar a futuro)
- Al cambiar de dia:
- se cierra cualquier modal/panel abierto para evitar contexto desactualizado
- KPI, grafico por horas y tarjeta de categorias entran en loading neutro (`-` y placeholders)
- se recargan con datos reales para el nuevo dia
- se evita mostrar datos anteriores como si fueran del nuevo dia durante la carga
- NAV-DATE-01-CLOSE: retirado el bloque temporal `[NAV-DATE-01-VERIFY] Daily date navigation` tras la aprobacion funcional.
- En navegacion diaria normal quedan solo warnings utiles ante fallos reales de carga.

## RANGE-WEEK-01

- Se implemento el tab `Ultima semana` con rango movil de 7 dias consecutivos.
- Definicion aplicada:
- al entrar en modo semanal, se toma la semana que termina en el dia ActivityWatch actual
- flecha izquierda: mueve al bloque semanal anterior (7 dias)
- flecha derecha: mueve al bloque semanal siguiente y se bloquea cuando el rango ya termina en el dia actual
- El selector superior muestra rango semanal dinamico:
- ejemplo `11–17 may`
- cruce de mes: `28 abr – 4 may`
- KPI semanal real:
- suma de uso activo de los 7 dias del rango
- subtitulo adaptado a contexto semanal
- Grafico semanal real:
- la tarjeta pasa a `Uso por dias`
- 7 barras cronologicas (una por dia), con etiqueta compacta `L M X J V S D`
- barra azul = dia con mayor uso del rango
- Categorias semanales reales:
- agregacion real por categoria para todo el rango, manteniendo categorias dinamicas y reglas editables
- porcentajes recalculados contra total semanal
- Detalle semanal por categoria:
- desde Home se abre modal con desglose acumulado de la categoria en la semana
- mantiene top 7 + `Otras webs y apps`, scroll interno y cierre usable
- Capa tecnica reutilizable por rango en `activitywatch.js`:
- `getRangeActiveUsage({ startDay, endDay })`
- `getRangeDailyUsageSeries({ startDay, endDay })`
- `getRangeCategoryUsage({ startDay, endDay })`
- `getRangeCategoryDetailUsage({ startDay, endDay, category })`
- Se evita duplicar logica de clasificacion/consistencia porque cada agregado semanal reutiliza la capa diaria ya validada.
- Verificacion temporal retirada: limpiado el bloque `[RANGE-WEEK-01-VERIFY]` tras validar consistencia semanal.

## RANGE-WEEK-01-FIX

- Se corrigio la semantica de `Semana` para usar semana natural de calendario (lunes-domingo), en lugar de 7 dias moviles.
- Estado semanal modelado por inicio de semana (`selectedWeekStartDay`) y rango derivado (`start + 6`).
- En semana actual:
- dias futuros se muestran explicitamente con `0`
- barras de dias futuros quedan no clicables
- navegacion derecha bloqueada al estar en la semana actual
- Eje vertical semanal corregido:
- escala dinamica en horas (`1h`, `2h`, `3h`, ...) segun maximo diario visible de la semana
- sin etiquetas incoherentes en minutos para modo `Semana`
- Clic en barra semanal (dia no futuro):
- mantiene el modo `Semana`
- selecciona/deselecciona el dia pulsado dentro de la semana
- muestra el total diario encima de la barra seleccionada
- filtra la tarjeta de categorias al dia seleccionado (si no hay seleccion, vuelve al agregado semanal)
- Tabs visibles renombrados:
- `Dia`
- `Semana`
- `Mes` (sin logica mensual aun)
- Se separo la carga semanal global de la carga de categorias filtradas por dia:
- al seleccionar un dia semanal, KPI y grafico de 7 barras permanecen visibles
- solo la tarjeta de categorias entra en loading y recarga en contexto diario seleccionado
- Se anadio tooltip de hover en barras semanales con dia/fecha breve y total diario formateado.
- Se anadio media diaria junto al KPI semanal:
- semana actual: total semanal / dias transcurridos hasta hoy (inclusive)
- semana cerrada: total semanal / 7
- Verificacion temporal retirada: limpiados los bloques `[RANGE-WEEK-01-FIX-VERIFY]`, `[RANGE-WEEK-AXIS-VERIFY]`, `[RANGE-WEEK-DAY-SELECT-VERIFY]`, `[RANGE-WEEK-DAY-FILTER-VERIFY]`, `[RANGE-WEEK-HOVER-VERIFY]` y `[RANGE-WEEK-AVERAGE-VERIFY]`.

## RANGE-WEEK-UX-FIX-02

- Se elimino el tooltip/hover del grafico semanal:
- retirado estado de hover
- retirado bloque `[RANGE-WEEK-HOVER-VERIFY] Weekly bar tooltip`
- el hover ya no abre ventanita; se mantiene solo clic de seleccion.
- En seleccion de dia semanal:
- se mantiene modo `Semana`
- KPI semanal y grafico semanal permanecen visibles
- solo recarga la tarjeta de categorias en contexto diario seleccionado
- se incorpora una seccion intermedia entre grafico y categorias con:
- fecha del dia seleccionado
- total de uso de ese dia (`xh ym de uso`)
- Regla de resaltado azul consolidada:
- sin dia seleccionado: semana actual marca dia actual; semanas cerradas marcan el dia de mayor uso
- con dia seleccionado: solo la barra seleccionada queda como resaltado principal
- Verificacion temporal retirada: limpiados los bloques `[RANGE-WEEK-CACHE-VERIFY]`, `[RANGE-WEEK-DAY-SUMMARY-VERIFY]`, `[RANGE-WEEK-BAR-HIGHLIGHT-VERIFY]` y `[RANGE-WEEK-HOVER-REMOVED-VERIFY]`.

## RANGE-WEEK-SWITCH-01

- Se anadio un switch visual `Semana | Dia` dentro de la tarjeta `Uso por dias`, junto al titulo.
- El switch se sincroniza con el estado semanal existente:
- `Semana` = sin dia seleccionado
- `Dia` = hay `selectedWeekDay`
- Interacciones:
- clic en barra semanal (dia no futuro) selecciona dia y activa automaticamente `Dia` en el switch.
- clic en `Semana` limpia la seleccion (`selectedWeekDay = null`) y restaura categorias semanales.
- Decision UX aplicada:
- `Dia` queda deshabilitado cuando no hay dia seleccionado (no fuerza seleccion automatica).
- Se mantiene intacto el flujo principal:
- no navega al tab global `Dia`
- KPI semanal y grafico semanal se preservan
- solo cambia el contexto inferior de categorias
- Verificacion temporal retirada: limpiados los bloques `[RANGE-WEEK-SWITCH-VERIFY]` y `[RANGE-WEEK-SWITCH-RESET-VERIFY]`.

## RANGE-WEEK-CLOSE

- Cierre oficial de Semana completado.
- Eliminados los logs temporales de depuracion/verificacion semanal, manteniendo intacta la logica funcional validada:
- semana natural lunes-domingo
- KPI semanal + media diaria
- grafico semanal por dias con eje en horas
- seleccion de dia dentro de Semana y switch `Semana | Dia`
- categorias semanales o diarias segun contexto de switch
- En funcionamiento normal quedan solo `console.warn` utiles ante errores reales de carga/ActivityWatch.

## RANGE-NAV-AND-MONTH-PLAN-01

- Se cambio la prioridad de vistas y la app abre por defecto en `Semana`.
- Orden visual de tabs actualizado a `Semana | Dia | Mes`.
- Se aplicaron limites historicos con bloqueo funcional de navegacion:
- `Dia`: maximo 15 dias atras desde el dia ActivityWatch actual.
- `Semana`: maximo 5 semanas atras desde la semana actual.
- `Mes`: maximo 3 meses atras desde el mes actual.
- La flecha derecha se mantiene bloqueada en el rango actual (dia/semana/mes).
- Se implemento modo `Mes` como resumen simple (sin interacciones complejas):
- KPI mensual real (mes natural).
- Media diaria mensual:
- mes actual: divide por dias transcurridos hasta hoy inclusive.
- mes pasado: divide por todos los dias del mes.
- Grafico por semanas del mes (`S1..Sn`), contando solo dias que pertenecen al mes.
- Eje vertical en horas.
- Tarjeta de categorias agregadas del mes.
- En `Mes`, categorias sin detalle por clic (desactivado por ahora para mantener alcance simple).
- En el estado estable actual no se reutiliza cache de sesion para `Dia`, `Semana` o `Mes`; se prioriza comportamiento simple y predecible.
- Verificacion temporal retirada: eliminados `[RANGE-TABS-ORDER-VERIFY]`, `[RANGE-NAV-LIMITS-VERIFY]` y `[RANGE-MONTH-01-VERIFY]`.

## SYNC-ROLLBACK-STATE-01

- Se sincronizo el proyecto con el rollback manual al estado estable posterior a `RANGE-NAV-AND-MONTH-PLAN-01`.
- Se confirmo en codigo que no quedan restos de prefetch de dias o semanas, ni carga en segundo plano orientada a precalentar vistas.
- Se retiraron restos evidentes que no pertenecian a ese estado estable:
- caches de sesion en `WelcomeHero.jsx` para `Dia`, `Semana`, `Mes`, contexto semanal y detalle de categoria
- logs temporales `[RANGE-TABS-ORDER-VERIFY]`, `[RANGE-NAV-LIMITS-VERIFY]` y `[RANGE-MONTH-01-VERIFY]`
- Se mantiene intacto el comportamiento funcional objetivo:
- vista inicial `Semana`
- tabs `Semana | Dia | Mes`
- limites `Dia 15`, `Semana 5`, `Mes 3`
- modo `Mes` simple
- categorias dinamicas con creacion y edicion local
- Las lineas de trabajo `PERFORMANCE-PREFETCH-01` y `PERFORMANCE-CRITICAL-FIX-01` quedan descartadas por ahora y no forman parte del estado actual aprobado.

## QA-FUNCTIONAL-01

- Se creo `QA_CHECKLIST.md` como checklist manual guiada para validar el estado estable actual con ActivityWatch real.
- La checklist cubre:
- vista `Semana`
- vista `Dia`
- vista `Mes`
- navegacion con limites
- categorias y detalles
- Configuracion
- estados de carga/error
- consola limpia
- Cada bloque incluye:
- pasos manuales concretos
- resultado esperado
- espacio para marcar `OK / FAIL`
- notas para capturas y logs si algo falla
- Esta tarea no introduce funcionalidad nueva ni modifica UI.
- El siguiente paso aprobado del proyecto es ejecutar esta validacion manual completa antes de decidir si el estado actual esta listo para pulido visual.

## QA-FIX-01

- Se corrigio el riesgo principal de la grafica semanal: deja de mostrarse un eje Y que podia sugerir valores falsos; en `Semana` se mantienen barras proporcionales y el valor exacto del dia seleccionado en el bloque intermedio.
- Se reintrodujo cache minima de sesion sin prefetch:
- cache diaria por `YYYY-MM-DD`
- cache semanal por `weekStart`
- cache mensual por `YYYY-MM`
- cache de contexto semanal para categorias de un dia ya seleccionado
- La cache solo se llena despues de que el usuario haya visto explicitamente ese rango; no se precargan dias, semanas ni meses en background.
- Se priorizo la carga del KPI diario:
- en `Dia`, el KPI se solicita y se renderiza en cuanto responde
- grafico horario y categorias pueden completar despues
- si hay `dayCache`, el KPI reaparece de forma inmediata
- La reasignacion de reglas pasa a ser exclusiva:
- una regla de dominio o aplicacion pertenece a una sola categoria
- al anadirla en otra categoria, se elimina automaticamente de la anterior
- Se anadio borrado de categorias custom:
- solo para categorias creadas por usuario
- las categorias base (`Estudio`, `Entretenimiento`, `Productividad`, `Otros`) no muestran borrado
- al eliminar una categoria custom se borran sus reglas y se invalida la cache de dashboard
- Se anadio texto de ayuda en el modal de edicion para explicar `.exe` y dominios.
- Se mantuvo la resiliencia existente cuando ActivityWatch no esta disponible: sin pantallas infinitas ni hard-crashes, solo estados neutros y warnings controlados.
- Los logs temporales de verificacion de esta fase ya fueron retirados tras validar la correccion en QA-FIX-CLOSE-01.

## QA-FIX-CATEGORY-MODAL-SCROLL-01

- Se corrigio la usabilidad del modal de edicion de categorias cuando una categoria tiene varias reglas.
- El modal pasa a usar layout en columna con altura maxima relativa al viewport (`85vh`) y `overflow hidden` en el contenedor principal.
- La cabecera del modal permanece visible y accesible con:
- punto/color de categoria
- nombre de categoria
- boton `X`
- El cuerpo del modal ahora hace scroll vertical interno y contiene:
- descripcion
- texto de ayuda sobre `.exe` y dominios
- lista de reglas
- input para anadir regla
- accion de borrar categoria custom si aplica
- El footer queda fuera del scroll interno para mantener `Cancelar` y `Guardar cambios` accesibles incluso con listas largas.
- No se modifico logica funcional de:
- guardado
- reglas unicas
- inferencia `.exe`
- creacion/eliminacion de categorias
- motor de clasificacion
- El log temporal de verificacion de este ajuste ya fue retirado tras su validacion.

## QA-FIX-CATEGORY-MODAL-ACTIONS-01

- Se ajusto el cierre del modal de creacion de categorias:
- si el nombre es valido y la categoria se guarda correctamente, el modal se cierra inmediatamente
- si el nombre esta vacio o duplicado, el modal permanece abierto y muestra el error existente
- Se ajusto el cierre del modal de edicion al eliminar categorias custom:
- tras una eliminacion valida, el modal se cierra antes del refresco asincrono para que el cierre se sienta inmediato
- no queda abierto mostrando una categoria que ya no existe
- No se modifico logica funcional de:
- reglas unicas
- inferencia `.exe`
- scroll del modal
- motor de clasificacion
- navegacion `Semana | Dia | Mes`
- Los logs temporales de verificacion de este ajuste ya fueron retirados tras su validacion.

## QA-FIX-CLOSE-01

- Se verifico el cierre definitivo de los logs temporales de verificacion anadidos durante las correcciones QA recientes.
- En la revision final ya no quedaban presentes en codigo los bloques:
- `[QA-FIX-WEEK-CHART-VERIFY]`
- `[QA-FIX-SESSION-CACHE-VERIFY]`
- `[QA-FIX-DAY-KPI-VERIFY]`
- `[QA-FIX-UNIQUE-RULES-VERIFY]`
- `[QA-FIX-DELETE-CATEGORY-VERIFY]`
- `[QA-FIX-CATEGORY-MODAL-SCROLL-VERIFY]`
- `[QA-FIX-CREATE-CATEGORY-CLOSE-VERIFY]`
- `[QA-FIX-DELETE-CATEGORY-CLOSE-VERIFY]`
- Se mantuvo intacta la logica funcional del dashboard, categorias, modales y navegacion.
- Se sincronizo la documentacion para reflejar que la fase QA-FIX queda cerrada y sin ruido temporal en consola.

## UX-POLISH-01

- Se pulieron textos principales del dashboard para que dependan mejor del contexto visible:
- `Dia`: `Tiempo total de uso hoy` o `Tiempo total de uso del dia`
- `Semana`: `Tiempo total de uso de la semana`
- `Mes`: `Tiempo total de uso del mes`
- Se mejoro la claridad visual de estados de carga y estados vacios sin introducir datos falsos:
- placeholders neutros mantenidos en KPI, grafico y categorias
- mensajes explicitos cuando no hay actividad en el dia, semana o mes visibles
- mensajes mas claros cuando una categoria aun no tiene uso registrado
- Se anadio un aviso discreto cuando falla la conexion con ActivityWatch:
- no bloquea toda la app
- mantiene la interfaz usable
- indica que ActivityWatch debe estar disponible en `localhost:5600`
- Se pulio Configuracion:
- copy mas natural en el panel
- contador de reglas mas legible (`Sin reglas todavia`, `1 regla`, `n reglas`)
- modal de creacion con texto de ayuda corto
- modal de edicion con estado vacio cuando la categoria aun no tiene reglas
- Se reforzo accesibilidad basica y consistencia visual:
- `focus-visible` en tabs, flechas, boton de Configuracion, cierres de modal y acciones principales
- mejor feedback visual en botones deshabilitados
- espaciados ligeramente ajustados entre KPI, aviso y tarjetas
- Se mantuvo intacta la logica funcional principal:
- calculos de ActivityWatch
- queries
- categorizacion
- reglas
- limites historicos
- cache minima de sesion

## UX-POLISH-01-CLOSE

- Se verifico el cierre definitivo de `UX-POLISH-01` sin cambios funcionales adicionales.
- No se detectaron logs temporales propios de `UX-POLISH-01`.
- No quedan `console.log`, `console.group` ni `console.groupEnd` de debug en `src`; se mantienen solo `console.warn` controlados para fallos reales de ActivityWatch o de la API local.
- La validacion final confirma que:
- `Semana`, `Dia` y `Mes` funcionan correctamente
- `Configuracion` funciona correctamente
- los estados de carga, vacios y error son estables
- ActivityWatch cerrado no rompe la app
- Los errores de consola observados inicialmente se confirmaron como externos al navegador al desaparecer en modo incognito; no pertenecen a la app.
- El proyecto queda en estado MVP local estable y listo para continuar con la siguiente fase.

## QA-FIX-WEEK-SELECTED-DAY-CATEGORY-DETAIL-01

- Se corrigio el contexto del modal de detalle de categoria cuando el usuario esta en `Semana` con un dia seleccionado.
- Antes del fix:
- la tarjeta inferior mostraba categorias del dia seleccionado
- pero el modal seguia consultando el detalle de toda la semana
- Ahora el modal y la tarjeta quedan sincronizados:
- `Semana` sin dia seleccionado -> detalle semanal (`getRangeCategoryDetailUsage`)
- `Semana` con dia seleccionado -> detalle diario de ese dia (`getDailyCategoryDetailUsage`)
- `Dia` -> se mantiene detalle diario como hasta ahora
- `Mes` -> no se introduce nueva logica de detalle
- Tambien se anadio un contexto visual discreto dentro del modal (`dia` o rango semanal visible) para evitar ambiguedad al leer el detalle.

## QA-FIX-WEEK-SELECTED-DAY-CATEGORY-DETAIL-CLOSE

- Se elimino el log temporal `[QA-FIX-WEEK-CATEGORY-DETAIL-CONTEXT-VERIFY] Week selected day category detail context`.
- No se modifico la logica funcional validada:
- `Semana` sin dia seleccionado -> detalle semanal
- `Semana` con dia seleccionado -> detalle diario de ese dia
- `Dia` -> detalle diario
- `Mes` -> sin cambios
- La correccion queda cerrada y la consola vuelve a quedar limpia en funcionamiento normal, salvo warnings/errores reales.

## MVP-RELEASE-CHECKLIST-01

- Se reviso y actualizo `README.md` para reflejar el estado real del proyecto:
- UI local para ActivityWatch
- requisitos de ejecucion
- comandos principales (`dev`, `lint`, `build`)
- URL local esperada
- configuracion CORS
- que hacer si ActivityWatch no conecta
- nota clara sobre el problema conocido de `rolldown` en build
- Se creo `DEMO_LOCAL.md` con una guia paso a paso para ensenar el MVP en local.
- Se creo `SMOKE_TEST.md` con una checklist corta previa a demo.
- Se actualizo la documentacion de estado del proyecto para dejar claro que:
- el MVP local esta estable
- el proyecto entra en fase de pre-entrega/demo local
- no se anadiran nuevas features antes del smoke test
- No se modifico logica funcional de la app.

## RELEASE-BUILD-FIX-01

- Se diagnostico la causa real del fallo de `npm run build`:
- el proyecto se ejecutaba desde WSL
- pero `npm`/`node` resolvian al runtime de Windows
- `scripts/vite.mjs` usa `process.execPath`, asi que Vite/Rolldown heredaban Node de Windows
- eso provocaba dos sintomas segun el punto de entrada:
- busqueda del binding `@rolldown/binding-win32-x64-msvc`
- o ejecucion de `cmd.exe` sobre ruta UNC `\\wsl.localhost\...`
- Se confirmo que en WSL no habia `node` nativo instalado y que `npm` entraba desde `/mnt/c/Program Files/nodejs/npm`.
- Se verifico que la instalacion del proyecto en `node_modules` podia quedar mezclada entre Linux y Windows segun como se ejecutaran los comandos.
- Solucion aplicada sin tocar la logica de la app:
- instalacion de un Node Linux local de workspace en `.local-tools/`
- script `scripts/use-local-node-wsl.sh` para descargar/activar ese runtime en WSL
- limpieza de `node_modules` y `package-lock.json`
- reinstalacion completa desde WSL con Node Linux real
- Se anadio `.local-tools/` a `.gitignore` para no contaminar el repo con el runtime local.
- Verificacion final en WSL:
- `npm install` OK
- `npm run lint` OK
- `npm run build` OK
- `npm run preview` OK (respuesta HTTP 200 en `127.0.0.1:4173`)
- Documentacion actualizada:
- `README.md`
- `DEMO_LOCAL.md`
- `TASKS.md`
- `IMPLEMENTATION_REPORT.md`

## RELEASE-DESKTOP-PLAN-01

- Se documento la estrategia tecnica de empaquetado en
  `RELEASE_DESKTOP_PLAN.md`.
- Se compararon cuatro caminos de release:
- Web/PWA
- Tauri
- Electron
- Microsoft Store
- Recomendacion final:
- usar Tauri como shell principal
- mantener Electron solo como plan B
- distribuir primero por GitHub Releases
- dejar Microsoft Store para una fase posterior
- mantener ActivityWatch separado en `v0.1`
- Se dejo explicitado el alcance de la primera version instalable:
- app de escritorio Windows
- reutilizando el dashboard actual validado
- con mensaje claro si ActivityWatch no esta disponible
- sin auto-updater, sin firma de codigo y sin instalador conjunto
- Se anadio una distincion operativa importante:
- frontend y build web del MVP: WSL
- bundling del instalador Windows de Tauri: Windows nativo recomendado
- No se modifico logica funcional de la app ni UI.

## TAURI-MVP-01

- Se anadio la integracion minima de Tauri sobre el frontend actual sin tocar
  la logica funcional de ActivityUI.
- Cambios de repo realizados:
- `package.json`
  - scripts `tauri`, `tauri:frontend-dev`, `tauri:dev`, `tauri:build`,
    `tauri:info`
- `src-tauri/`
  - `Cargo.toml`
  - `build.rs`
  - `tauri.conf.json`
  - `capabilities/default.json`
  - `src/main.rs`
  - `src/lib.rs`
- `.gitignore`
  - anadido `src-tauri/target`
- Configuracion MVP aplicada:
- Tauri usa Vite en desarrollo sobre `127.0.0.1:1420`
- Tauri usa `dist/` en build
- la shell no altera la API actual ni la persistencia local
- el frontend sigue apuntando a `http://localhost:5600/api/0`
- Verificaciones completadas:
- `npm run lint` OK
- `npm run build` OK
- `npm run tauri:info` OK como diagnostico de integracion
- Limitacion detectada al intentar `npm run tauri:dev` en esta sesion:
- falta `cargo`
- falta `rustc`
- faltan dependencias Linux de Tauri como `webkit2gtk`
- la sesion WSL actual no expone `DISPLAY`/GUI
- Conclusión:
- la integracion minima de codigo queda lista
- la apertura real de ventana Tauri queda pendiente de validacion en entorno
  nativo preparado, preferiblemente Windows con Rust/toolchain completos

## TAURI-WINDOWS-ENV-VALIDATION-01

- Se valido el entorno Windows nativo real para ejecutar la shell Tauri del
  proyecto.
- Ruta utilizada:
  - `C:\Users\tomas\OneDrive\Documentos\activity\activityUI`
- Comprobaciones de entorno:
  - `node -v` -> `v24.15.0`
  - `npm.cmd -v` -> `11.12.1`
  - WebView2 detectado -> `149.0.4022.52`
  - MSVC detectado -> `Visual Studio Community 2026`
- Incidencia inicial detectada:
  - en PowerShell, `npm -v` fallaba por politica de ejecucion sobre
    `npm.ps1`
  - solucion operativa documentada: usar `npm.cmd`
- Incidencia estructural detectada en Tauri:
  - `tauri:dev` fallaba porque faltaba `src-tauri/icons/icon.ico`
  - se anadio un icono minimo en `src-tauri/icons/icon.ico` para permitir la
    generacion del recurso Windows
- Preparacion de toolchain:
  - se instalo Rust con `rustup`
  - `tauri:info` pasa ya con Rust, Cargo, MSVC y WebView2 detectados
- Verificaciones ejecutadas en Windows:
  - `npm.cmd install` -> OK
  - `npm.cmd run lint` -> OK
  - `npm.cmd run build` -> OK
  - `npm.cmd run tauri:info` -> OK
  - `npm.cmd run tauri:dev` -> OK a nivel de arranque del stack: Vite en
    `127.0.0.1:1420`, compilacion Rust completada y proceso `activityui`
    levantado
- Evidencia tecnica de arranque:
  - proceso `activityui` vivo
  - proceso `cargo` watcher vivo durante `tauri:dev`
  - `127.0.0.1:1420` respondiendo `200`
  - procesos `msedgewebview2` asociados activos
- Validacion de ActivityWatch abierto:
  - `http://localhost:5600/api/0/info` responde con `hostname` y `version`
    reales
  - la app Tauri arranca en ese contexto sin caida de proceso
- Validacion de ActivityWatch cerrado:
  - se detuvo temporalmente ActivityWatch
  - `localhost:5600` dejo de responder
  - `activityui` siguio vivo
  - el frontend siguio sirviendo en `1420`
  - ActivityWatch se restauro correctamente despues de la prueba
- Limitacion de esta validacion:
  - desde la automatizacion se pudo validar arranque de proceso y entorno
    nativo, pero no inspeccionar visualmente el contenido exacto de la ventana
    en el escritorio del usuario
- Documentacion actualizada:
  - `README.md`
  - `RELEASE_DESKTOP_PLAN.md`
  - `TASKS.md`
  - `docs/TAURI_SETUP.md`

## TAURI-CONFIG-01

- Se consolido la configuracion de Tauri v2 en `src-tauri/tauri.conf.json` para distribucion v0.1:
  - Definida politica CSP estricta que autoriza expresamente la comunicacion local con ActivityWatch (`http://localhost:5600`, `http://127.0.0.1:5600` y WebSockets locales), asegurando que el WebView2 pueda consultar la API sin bloqueos.
  - Generada la suite completa de iconos oficiales en `src-tauri/icons/` (`icon.ico`, `icon.png`, `32x32.png`, `128x128.png`, `128x128@2x.png`, `icon.icns`) a partir del vector SVG del proyecto (`public/favicon.svg`), asignandolos al bundle de la aplicacion.
  - Configurado target de empaquetado Windows `nsis` con `installMode: "currentUser"` para una instalacion ligera en el directorio de usuario sin requerir elevacion de privilegios de administrador.
  - Anadido `#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]` en `src-tauri/src/main.rs` para suprimir la ventana de consola negra de Windows en builds de produccion.
- Actualizado `package.json`:
  - Version unificada a `0.1.0` en sincronia con `tauri.conf.json` y `Cargo.toml`.
  - Anadido script `"validate": "npm run lint && npm run build"`.

## GITHUB-ACTIONS-RELEASE-01

- Se creo el pipeline CI/CD automatizado en `.github/workflows/release-desktop.yml`:
  - Disparadores: push de tags de version `v*` (ej. `v0.1.0`) y ejecucion manual `workflow_dispatch` con parametro de version.
  - Runner nativo Windows (`windows-latest`) con Node.js 22, Rust toolchain `stable` (`x86_64-pc-windows-msvc`) y cache de dependencias con `swatinem/rust-cache@v2`.
  - Paso de validacion previa (`npm run validate`) que garantiza que lint y build web pasan en limpio antes de la compilacion de Tauri.
  - Empaquetado del instalador NSIS y publicacion directa en GitHub Releases mediante `tauri-apps/tauri-action@v0`.
  - Paso adicional automatizado para capturar el binario compilado `src-tauri/target/release/activityui.exe`, empaquetarlo en un archivo ZIP portable (`ActivityUI_${TAG}_windows_x64_portable.zip`) y subirlo a la misma GitHub Release mediante GitHub CLI (`gh release upload`).
- Verificaciones:
  - `npm run validate` ejecutado en WSL pasando con codigo 0 (lint limpio y build de produccion completado).
  - `npm run tauri:info` ejecutado verificando resolucion correcta de configuracion y CSP.

- Fixed app logo (replaced blue square with user provided image and regenerated Tauri icons)

 # #   T A U R I - S Y S T E M - T R A Y - 0 1 
 
 -   S e   h a   c o n f i g u r a d o   e l   S y s t e m   T r a y   n a t i v o   p a r a   W i n d o w s   e n   \ s r c - t a u r i \   u s a n d o   l a   A P I   d e   T a u r i   v 2 . 
 -   A c t u a l i z a d o   \ C a r g o . t o m l \   p a r a   h a b i l i t a r   l a   f e a t u r e   \ 	 r a y - i c o n \   e n   \ 	 a u r i \ . 
 -   E n   \ s r c - t a u r i / s r c / l i b . r s \   s e   h a   a � a d i d o   \ T r a y I c o n B u i l d e r \   y   \ M e n u B u i l d e r \   c o n f i g u r a n d o   l a s   s i g u i e n t e s   o p c i o n e s   d e l   m e n �   c o n t e x t u a l : 
     -   \  
 A b r i r  
 A c t i v i t y  
 U I \ :   R e s t a u r a   y   e n f o c a   l a   v e n t a n a   p r i n c i p a l . 
     -   \ C o m p r o b a r  
 c o n e x i � n  
 c o n  
 A c t i v i t y W a t c h \ :   E m i t e   l o g   e n   c o n s o l a   ( p r e p a r a d o   p a r a   f e t c h   e n   v 0 . 2 ) . 
     -   \ S a l i r \ :   C i e r r a   c o m p l e t a m e n t e   l a   a p l i c a c i � n . 
 -   C o n f i g u r a d o   e l   e v e n t o   \ 	 a u r i : : W i n d o w E v e n t : : C l o s e R e q u e s t e d \   p a r a   m i n i m i z a r / o c u l t a r   l a   v e n t a n a   a l   p u l s a r   l a   ' X ' ,   d e l e g a n d o   e l   c i e r r e   d e f i n i t i v o   a l   m e n �   d e l   S y s t e m   T r a y . 
 -   V a l i d a d a   c o m p i l a c i � n   l o c a l   ( \ c a r g o   c h e c k \ )   e x i t o s a m e n t e .  
 
## LANDING-PAGES-01

- Se ha creado una landing page moderna, ligera y estatica en `landing/index.html`:
  - Hero section visual con propuesta de valor clara: visualizacion de tiempo y productividad 100% privada y local sin almacenamiento en la nube.
  - Mockup fidedigno del dashboard de Activity UI representando la vista semanal (KPI de tiempo activo, media diaria, distribucion horaria con pico resaltado y desglose porcentual por categorias).
  - Boton de descarga destacado que apunta a la ultima release (https://github.com/14tomass/activityUI/releases/latest) con soporte para instalador guiado NSIS (.exe) y version portable (.zip) de Windows x64.
  - Seccion detallada de arquitectura local-first e integracion con ActivityWatch (http://localhost:5600).
  - Guia de requisitos de puesta en marcha (ActivityWatch en segundo plano + cliente Activity UI).
  - Tabla comparativa de privacidad entre Activity UI y soluciones de rastreo comerciales en la nube.
  - Configuracion estetica moderna usando Tailwind CSS via CDN, fuentes Plus Jakarta Sans / JetBrains Mono e iconos/assets integrados.
- Se ha creado el flujo de despliegue automatizado en `.github/workflows/deploy-pages.yml`:
  - Configurado con las acciones oficiales de GitHub Pages (`actions/configure-pages@v5`, `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4`).
  - Despliegue automatico de la carpeta `landing/` ante cada `push` a la rama `main` y soporte para ejecucion manual via `workflow_dispatch`.
  - Permisos configurados para `pages: write`, `id-token: write` y `contents: read`.

## THEME-DARK-LIGHT-01

- Implementado \ThemeContext\ con deteccion de \prefers-color-scheme\ y persistencia en \localStorage\.
- Configurado Tailwind CSS v4 para soportar \darkMode: class\ con la directiva \@variant dark (.dark &)\.
- Añadido botón de alternancia en la cabecera (junto al botón de configuración) con iconos responsivos.
- Aplicadas clases \dark:bg-...\ y \dark:text-...\ en \AppShell.jsx\ y \WelcomeHero.jsx\ para una transición fluida al modo oscuro.
