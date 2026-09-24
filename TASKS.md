# TASKS

## Fase 0: Base tecnica y reglas del proyecto

- [x] Inicializar proyecto desde cero en esta carpeta
- [x] Configurar React + Vite + Tailwind CSS
- [x] Crear estructura base de carpetas
- [x] Crear README inicial
- [x] Verificar build, lint y servidor local
- [x] Definir reglas generales del proyecto
- [x] Registrar roadmap inicial
- [x] Registrar decisiones tecnicas iniciales
- [x] Documentar el estado actual de implementacion

## Fase 1: Implementar UI de Figma con datos mock

- [x] Analizar la estructura visual de Figma
- [ ] Replicar layout, componentes y jerarquia visual
- [ ] Crear datos mock representativos para las pantallas
- [ ] Conectar la UI unicamente a datos mock
- [ ] Validar estados base de navegacion y visualizacion
- UI-01 completada: base visual del dashboard principal implementada con mocks estaticos.
- UI-01 refinamiento visual completado: ajuste de proporciones en selector de rango, selector de fecha y bloque KPI para mayor fidelidad con Figma.
- UI-01 refinamiento de layout completado: correccion de alineacion vertical para posicionar el bloque principal mas arriba.
- UI-02 completada: tarjetas "Uso por horas" y resumen por categorias implementadas con datos mock estaticos.
- UI-03 completada: panel lateral de configuracion mock con overlay, blur y cierre por X/overlay.
- UI-04 completada: modal de detalle de categoria mock sobre el panel lateral, con lista de items, duraciones y barras de progreso.
- UI-05 completada: modal de edicion de categoria mock con input visual, boton "+", Cancelar y Guardar cambios.
- UI-06 completada: revision integral del flujo mock y consolidacion ligera del estado de interfaz.

## Fase 2: Analizar y mapear datos de ActivityWatch

- [x] Revisar endpoints utiles de la API local de ActivityWatch
- [x] Identificar buckets, eventos y estructuras relevantes
- [x] Mapear datos crudos a modelos utiles para la UI
- [x] Detectar limites, lagunas y decisiones pendientes del modelo de datos
- DATA-01 completada: investigacion de API local y mapeo tecnico documentado en `docs/ACTIVITYWATCH_DATA_MAPPING.md`.
- [x] Implementar descubrimiento dinamico de buckets y validacion basica de disponibilidad
- DATA-02 completada: capa API para detectar buckets window/afk/web sin hardcodear hostname y con manejo de ausencia/errores.
- [x] Crear comprobacion manual de desarrollo para discovery de buckets
- DATA-02-VERIFY completada: script `check:activitywatch-buckets` para validar en terminal el resultado real de `discoverActivityWatchBuckets()`.

## Fase 3: Conectar datos reales de ActivityWatch

- [ ] Sustituir mocks por lectura real de la API local
- [ ] Implementar capa de acceso a datos del frontend
- [ ] Gestionar carga, errores y ausencia de datos
- [ ] Validar que la app sigue siendo solo frontend local
- DATA-03 completada: KPI de tiempo total diario conectado a ActivityWatch con Query API (`window + AFK not-afk`) para la fecha fija `2026-05-16`, manteniendo el resto del dashboard en mock.
- DATA-03-DEBUG completada: investigada discrepancia con ActivityWatch oficial; se detecta que falta aplicar query canonica (audible browser -> not-afk) y respetar `startOfDay` configurado en ActivityWatch.
- DATA-03 queda conectado pero pendiente de correccion (DATA-03-FIX) por discrepancia de calculo frente a ActivityWatch oficial.
- DATA-03-FIX completada: KPI diario corregido con query canonica + `startOfDay` desde `/settings`, quedando alineado con ActivityWatch oficial para `2026-05-16` (~`6h 28m`).
- DATA-03-FIX-DEBUG en curso: se anadieron logs de diagnostico en navegador para verificar ejecucion real (day, startOfDay, timeperiod, buckets, query, respuesta cruda, segundos interpretados, texto KPI y fallback).
- DATA-03-FIX queda pendiente de aprobacion final hasta validar evidencia de consola en entorno real.
- DATA-03-FIX-DEBUG-2 completada: comparativa A/B de query canonica con buckets web `aw-watcher-web-chrome` vs `aw-watcher-web-chrome_LenovoTomy`; se confirma impacto fuerte en KPI y se propone ajustar la regla de seleccion de bucket web por hostname.
- DATA-03-FIX-2 completada: `discoverActivityWatchBuckets()` prioriza bucket web `web.tab.current` con sufijo `_${hostname}` (via `/api/0/info`) y mantiene fallback seguro a la regla previa.
- DATA-03-CLOSE completada: eliminados logs temporales de depuracion de KPI; DATA-03 queda cerrada con KPI real alineado y sin ruido de consola en funcionamiento normal.
- DATA-04 completada: tarjeta "Uso por horas" conectada a datos reales canÃ³nicos de ActivityWatch para `2026-05-16`, con 24 barras horarias y fallback mock si falla la carga.
- DATA-04-VERIFY completada: coherencia validada para `2026-05-16` (KPI diario y suma de 24 franjas coinciden, diferencia `0s`).
- DATA-04-CLOSE completada: eliminados logs temporales de verificacion horaria; DATA-04 queda cerrada sin ruido de debug en consola.
- DATA-05 implementada: capa de datos reutilizable para desglose diario por aplicaciones y sitios web.
- DATA-05-VERIFY-BROWSER en curso: validacion temporal movida al navegador porque `check:activitywatch-usage` en WSL no alcanza `http://localhost:5600` (ActivityWatch corre en Windows).
- DATA-05-WEB-DEBUG completada: comparacion A/B valida que la Variante B (Browser Style) reproduce ActivityWatch Browser con diferencias sub-segundo.
- DATA-05-WEB-FIX completada: `getDailyWebsiteUsage({ day })` usa logica Browser Style; logs temporales de debug retirados.
- Estado DATA-05 cerrado: aplicaciones aprobadas y websites aprobados.

## Fase 4: Sistema de categorias

- [ ] Definir el modelo de categorias para agrupar actividad
- [ ] Disenar reglas base de clasificacion
- [ ] Implementar configuracion local de categorias
- [ ] Reflejar categorias en graficas, listas y resumenes
- DATA-06 implementada: primera capa real de categorizacion diaria sin doble conteo (`Estudio`, `Entretenimiento`, `Productividad`, `Otros`) con prioridad web->app y fallback a `Otros`.
- DATA-06-VERIFY completada: coherencia validada para `2026-05-16` (KPI diario `24126.820s`, total categorizado `24128.158s`, diferencia `1.338s`, `OK`).
- DATA-06-CLOSE completada: eliminados logs temporales `[DATA-06-VERIFY]` y mantenidos solo warnings utiles ante fallo real.
- DATA-07 implementada: tarjeta visual de categorias conectada a `getDailyCategoryUsage({ day: "2026-05-16" })` manteniendo orden/colores del diseno y fallback mock ante fallo.
- DATA-07-VERIFY completada: validado en navegador que la UI recibe y representa correctamente duraciones/porcentajes reales (`validation: OK`).
- DATA-07-CLOSE completada: retirado bloque temporal `[DATA-07-VERIFY]` y mantenidos solo warnings utiles ante fallo real de carga.
- DATA-08 implementada: modal de detalle de categoria conectado a desglose real por apps/sitios del dia (`2026-05-16`) usando la misma clasificacion por tramos de DATA-06 (sin doble conteo).
- DATA-08-VERIFY pendiente: validar en navegador que el total del modal coincide con la tarjeta y que los items muestran mezcla real website/application.
- DATA-08-FIX-INTERACTION implementada: clic en filas de categorias del Home abre correctamente el modal real de detalle, con limpieza inmediata de contenido previo y estado de carga visible.
- DATA-08-FIX-INTERACTION implementada: en Configuracion, clic en categoria abre modal de edicion (no detalle analitico).
- DATA-08-FIX-EDITING implementada: modal de edicion usa reglas reales por categoria, permite anadir/eliminar reglas y guardar con persistencia en `localStorage`.
- DATA-08-FIX-ENGINE implementada: motor de categorias y detalle usa reglas persistidas editables con fallback a defaults.
- DATA-08-UX-FIX implementada: detalle limita a top 7 + fila agregada `Otras webs y apps`, con scroll interno y cabecera/X siempre visibles.
- DATA-08-UX-FIX implementada: modal de detalle de Home sin boton `Editar`; edicion solo desde Configuracion.
- DATA-08-UX-FIX implementada: eliminacion de boton `+` en edicion; `Guardar cambios` procesa input pendiente y persiste.
- DATA-08-UX-FIX implementada: Home arranca con loading states neutros (sin mocks realistas en KPI, horas y categorias).
- DATA-08-FIX-VERIFY en curso: logs temporales `[DATA-08-FIX-VERIFY]` y `[CONFIG-CATEGORIES-VERIFY]` para validar interaccion, persistencia y uso de reglas en motor.
- DATA-08-UX-FIX-2 implementada: corregido ciclo de carga del detalle real (sin loading infinito), con salida a estado neutro si falla.
- DATA-08-UX-FIX-2 implementada: `Guardar cambios` en edicion persiste reglas y mantiene el modal abierto.
- DATA-08-UX-FIX-2 implementada: placeholders de carga simplificados a `-` en Home y detalle.
- DATA-08-UX-FIX-2 implementada: grafico horario ajustado para contener 24 barras dentro de tarjeta y mostrar rango hasta `23`.
- DATA-08-UX-FIX-2 en verificacion: logs temporales `[DATA-08-DETAIL-LOADING-DEBUG]` y `[CONFIG-SAVE-STAYS-OPEN-VERIFY]`.
- CONFIG-CATEGORIES-FIX-3 implementada: `Guardar cambios` ahora cierra solo con input vacio; con input con texto guarda/anade regla y mantiene el modal abierto.
- CONFIG-CATEGORIES-FIX-3 implementada: inferencia de reglas corregida (`.exe` => `application`) con normalizacion `trim + case-insensitive`.
- CONFIG-CATEGORIES-FIX-3 implementada: migracion segura en lectura/sanitizado para reglas `.exe` que hubieran quedado guardadas en `domains`.
- CONFIG-CATEGORIES-FIX-3-CLOSE completada: retirados logs temporales de validacion de guardado/inferencia/impacto, manteniendo solo warnings utiles ante errores reales.
- DATA-08-CLOSE-FINAL completada: retirados logs temporales de loading/interaccion/truncado en Home y detalle de categoria; se mantienen solo warnings de error real.
- UI-LAYOUT-FIX-01 completada: boton de configuracion anclado arriba-derecha del viewport y panel lateral con altura/scroll interno para evitar contenido inaccesible.
- CONFIG-CATEGORIES-CREATE-01 completada: creacion real de categorias desde Configuracion con validaciones de nombre, persistencia local y render dinamico en Settings/Home.
- CONFIG-CATEGORIES-CREATE-01 completada: categorias nuevas integradas en el motor de categorizacion y editables con el flujo existente de reglas.
- CONFIG-CATEGORIES-CREATE-01 en verificacion: logs temporales `[CONFIG-CATEGORY-CREATE-VERIFY]` y `[CONFIG-CATEGORY-CREATE-ENGINE-VERIFY]`.
- CONFIG-CATEGORIES-CREATE-01-CLOSE completada: retirados logs temporales de creacion/engine y mantenidos solo warnings utiles ante errores reales.
- Mejora futura no bloqueante: permitir eliminar categorias creadas por usuario.
- Mejora futura no bloqueante: permitir renombrar categorias.
- Mejora futura no bloqueante: permitir personalizar color de categorias.
- DATA-09 implementada: clic en barra de "Uso por horas" abre modal con detalle real por franja (apps/webs), ordenado por duracion y sin doble conteo.
- DATA-09 implementada: modal horario con loading robusto, estado vacio, top 7 + fila agregada `Otras webs y apps`.
- DATA-09-CLOSE completada: retirado log temporal `[DATA-09-VERIFY]` y mantenidos solo warnings utiles ante fallos reales.
- NAV-DATE-01 implementada: selector de fecha diario funcional con estado central `selectedDay`, recarga real de KPI/horas/categorias por dia y bloqueo de navegacion a fechas futuras del dia ActivityWatch.
- NAV-DATE-01-CLOSE completada: eliminado log temporal `[NAV-DATE-01-VERIFY]` y retirado ruido de debug en navegacion diaria.
- RANGE-WEEK-01 implementada: tab `Ultima semana` funcional con rango movil de 7 dias, navegacion por bloques semanales y recarga real de KPI, grafico por dias, categorias y detalle por categoria.
- RANGE-WEEK-01-FIX implementada: modo `Semana` corregido a semana natural lunes-domingo, dias futuros de semana actual mostrados a `0`, y navegacion bloqueada en semana actual.
- RANGE-WEEK-01-FIX implementada: eje vertical semanal corregido a unidades de horas dinamicas (`1h`, `2h`, ...), sin etiquetas incoherentes de minutos.
- RANGE-WEEK-01-FIX implementada: clic en barra semanal (dia no futuro) mantiene modo `Semana`, muestra total del dia sobre la barra y filtra la tarjeta de categorias al dia seleccionado.
- RANGE-WEEK-01-FIX implementada: clic repetido sobre el mismo dia semanal deselecciona y vuelve al agregado semanal de categorias.
- RANGE-WEEK-01-FIX implementada: seleccion de dia semanal ya no dispara recarga global de Semana; solo recarga la tarjeta de categorias (KPI y grafico permanecen visibles).
- RANGE-WEEK-01-FIX implementada: tooltip hover en barras semanales con dia/fecha corta y total diario formateado.
- RANGE-WEEK-01-FIX implementada: KPI semanal muestra tambien `Media diaria` (semana actual: divide por dias transcurridos; semanas cerradas: divide por 7).
- RANGE-WEEK-UX-FIX-02 implementada: hover tooltip semanal retirado; el grafico mantiene solo interaccion por clic.
- RANGE-WEEK-UX-FIX-02 implementada: al seleccionar dia en `Semana` se preservan KPI+grafico y solo recarga la tarjeta de categorias; se anade resumen intermedio del dia seleccionado.
- RANGE-WEEK-UX-FIX-02 implementada: regla de resaltado azul ajustada (sin seleccion: hoy en semana actual / mayor uso en semanas pasadas; con seleccion: barra seleccionada).
- RANGE-WEEK-SWITCH-01 implementada: switch `Semana | Dia` anadido junto a `Uso por dias` dentro de la tarjeta semanal.
- RANGE-WEEK-SWITCH-01 implementada: clic en barra semanal activa automaticamente estado `Dia` del switch (sin salir del tab Semana).
- RANGE-WEEK-SWITCH-01 implementada: accion `Semana` del switch limpia seleccion y restaura `Categorias de la semana`.
- RANGE-WEEK-CLOSE completada: eliminados los logs temporales de verificacion de Semana y mantenida intacta la logica funcional del modo semanal.
- RANGE-NAV-AND-MONTH-PLAN-01 implementada: vista inicial y orden de tabs cambiados a `Semana | Dia | Mes`.
- RANGE-NAV-AND-MONTH-PLAN-01 implementada: limites historicos aplicados (Dia: 15 dias, Semana: 5 semanas, Mes: 3 meses) con bloqueo funcional en navegacion.
- RANGE-NAV-AND-MONTH-PLAN-01 implementada: modo `Mes` simple con KPI total mensual, media diaria mensual, grafico por semanas (`S1..Sn`) y categorias agregadas del mes.
- RANGE-NAV-AND-MONTH-PLAN-01 consolidada: retirados logs temporales de verificacion y mantenido `Mes` en version simple.
- SYNC-ROLLBACK-STATE-01 completada: codigo y documentacion sincronizados con el estado estable posterior a `RANGE-NAV-AND-MONTH-PLAN-01`.
- SYNC-ROLLBACK-STATE-01 completada: confirmada ausencia de prefetch de dias/semanas y de carga en segundo plano no deseada.
- SYNC-ROLLBACK-STATE-01 completada: descartadas por ahora las lineas de trabajo de prefetch/rendimiento experimental; no se continuara con `PERFORMANCE-PREFETCH-01` ni `PERFORMANCE-CRITICAL-FIX-01`.

## Fase 5: Calidad, seguridad, estados de error y pulido

- [ ] Ejecutar QA funcional manual del estado estable posterior a `RANGE-NAV-AND-MONTH-PLAN-01`
- [ ] Revisar accesibilidad y consistencia visual
- [ ] Mejorar mensajes de error y estados vacios
- [ ] Revisar privacidad y no salida de datos
- [ ] Limpiar codigo, documentacion y estructura final del MVP
- [ ] Preparar checklist final de entrega
- QA-FUNCTIONAL-01 completada: creada `QA_CHECKLIST.md` con validacion manual guiada para `Semana`, `Dia`, `Mes`, limites, categorias, detalles, Configuracion, estados de carga/error y consola.
- QA-FUNCTIONAL-01 completada y validada manualmente: `Semana`, `Dia`, `Mes` y `Configuracion` quedan funcionalmente correctos tras el rollback.
- QA-FIX-01 completada: corregida la grafica semanal para no comunicar valores falsos y mantenidas barras proporcionales al uso real sin volver a prefetch agresivo.
- QA-FIX-01 completada: restaurada cache minima de sesion para `Dia`, `Semana` y `Mes`, solo con datos ya vistos explicitamente por el usuario.
- QA-FIX-01 completada: priorizado el KPI diario para renderizar antes que grafico/categorias cuando no hay cache.
- QA-FIX-01 completada: las reglas pasan a ser unicas entre categorias; al reasignar una regla se mueve automaticamente.
- QA-FIX-01 completada: anadida eliminacion de categorias creadas por usuario y bloqueado el borrado de categorias base.
- QA-FIX-CATEGORY-MODAL-SCROLL-01 completada: modal de edicion de categorias reorganizado con scroll interno, cabecera visible y acciones de cierre/guardado accesibles aunque haya varias reglas.
- QA-FIX-CATEGORY-MODAL-SCROLL-01 validada: el modal de edicion mantiene scroll correcto y usabilidad con `3+` reglas.
- QA-FIX-CATEGORY-MODAL-ACTIONS-01 completada: crear categoria valida ahora cierra el modal de alta inmediatamente; si hay error de nombre, el modal permanece abierto.
- QA-FIX-CATEGORY-MODAL-ACTIONS-01 completada: eliminar categoria custom ahora cierra siempre el modal de edicion de forma inmediata tras el borrado valido.
- QA-FIX-CLOSE-01 completada: eliminados los logs temporales `QA-FIX-*` y cerrada la fase de correcciones QA sin cambios funcionales adicionales.
- QA-FIX-CLOSE-01 verificada: no quedan referencias activas a logs `QA-FIX-*` en el codigo de la app; la consola esperada vuelve a quedar limpia salvo warnings/errores reales.
- UX-POLISH-01 completada: pulidos copy, estados vacios, aviso discreto de ActivityWatch no disponible, espaciados menores y accesibilidad basica sin tocar calculos ni reglas.
- UX-POLISH-01 validada: `Semana`, `Dia`, `Mes`, `Configuracion`, ActivityWatch cerrado y consola limpia quedan aprobados.
- UX-POLISH-01-CLOSE completada: confirmado cierre sin logs temporales ni debug propio; los errores de consola observados se verifican como externos al navegador al desaparecer en modo incognito.
- QA-FIX-WEEK-SELECTED-DAY-CATEGORY-DETAIL-01 completada: el modal de detalle de categoria en `Semana` ya respeta el mismo contexto que la tarjeta inferior (`dia` si hay `selectedWeekDay`, `semana` si no lo hay).
- QA-FIX-WEEK-SELECTED-DAY-CATEGORY-DETAIL-CLOSE completada: retirado el log temporal de verificacion del contexto semana/dia y cerrada la correccion sin cambios funcionales adicionales.
- MVP-RELEASE-CHECKLIST-01 completada: README revisado, guia de demo local creada, smoke test corto creado y documentado el estado de pre-entrega sin anadir nuevas funcionalidades.

## Fase 6: Pre-entrega / demo local

- [x] Ejecutar smoke test completo antes de demo
- [x] Verificar demo local completa con ActivityWatch abierto
- [x] Resolver el problema de build/rolldown en un entorno limpio antes de cualquier release real
- [ ] Congelar nuevas features hasta pasar el smoke test de demo local
- RELEASE-BUILD-FIX-01 completada: identificado el origen mixto Windows/WSL del fallo de `rolldown` y validado build correcto desde WSL con Node Linux local activado por `scripts/use-local-node-wsl.sh`.
- RELEASE-BUILD-FIX-01 completada: `npm install`, `npm run lint`, `npm run build` y `npm run preview` quedan funcionando en el entorno recomendado `/home/tomas/USAL LINUX/activityUI`.
- SMOKE-TEST validado: el MVP local queda estable para demo con ActivityWatch real.

## Fase 7: Planificacion de desktop release

- [x] Definir estrategia de empaquetado de escritorio
- [ ] Verificar apertura real de la ventana Tauri en entorno nativo con Rust y GUI
- [ ] Validar conectividad a ActivityWatch desde Tauri
- [x] Generar primer instalador Windows reproducible (pipeline automatizado con GitHub Actions)
- [x] Preparar primer GitHub Release descargable (instalador NSIS y portable zip)
- [x] Preparar landing simple de descarga
- LANDING-PAGES-01 completada: creada landing page estática en 'landing/index.html' con Hero, mockup del dashboard, propuesta de valor privada/local, requisitos de ActivityWatch y descarga a v0.1.0.
- LANDING-PAGES-01 completada: configurado workflow de despliegue automatizado en '.github/workflows/deploy-pages.yml' usando 'actions/deploy-pages' hacia GitHub Pages en push a 'main'.
- RELEASE-DESKTOP-PLAN-01 completada: creada `RELEASE_DESKTOP_PLAN.md` con comparativa Web/PWA vs Tauri vs Electron vs Microsoft Store.
- RELEASE-DESKTOP-PLAN-01 completada: se recomienda Tauri como camino principal, GitHub Releases como primer canal y ActivityWatch separado en `v0.1`.
- RELEASE-DESKTOP-PLAN-01 completada: se fija criterio operativo de entornos: frontend en WSL y bundling de instalador Windows en Windows nativo recomendado.
- TAURI-MVP-01 implementada en repo: anadida shell minima de Tauri (`src-tauri/`, scripts npm y configuracion base) sin tocar la logica funcional del dashboard.
- TAURI-MVP-01 verificada parcialmente: `lint`, build web y `tauri info` OK a nivel de integracion; la apertura real de ventana queda pendiente por ausencia de `cargo/rustc`, `webkit2gtk` y salida grafica en la sesion WSL actual.
- TAURI-WINDOWS-ENV-VALIDATION-01 completada a nivel de entorno Windows: `npm install`, `lint`, `build` y `tauri:info` OK en ruta Windows nativa; Rust/MSVC/WebView2 quedan preparados para Tauri.
- TAURI-WINDOWS-ENV-VALIDATION-01 completada a nivel de arranque: `tauri:dev` ya compila y levanta proceso `activityui` + Vite/WebView2 en Windows tras anadir `src-tauri/icons/icon.ico`.
- TAURI-WINDOWS-ENV-VALIDATION-01 validada parcialmente para ActivityWatch cerrado: al detener temporalmente ActivityWatch, `activityui` sigue vivo y el frontend no se cae; queda pendiente confirmacion visual manual de placeholders dentro de la ventana nativa.
- TAURI-CONFIG-01 completada: configurada CSP restrictiva permitiendo conexiÃ³n local a ActivityWatch (`localhost:5600`), generados iconos multiplataforma (`src-tauri/icons/`) a partir del SVG oficial y configurado target NSIS (`currentUser`) para Windows.
- TAURI-CONFIG-01 completada: versionado unificado a `v0.1.0` en `package.json`, `tauri.conf.json` y `Cargo.toml`, con script de validaciÃ³n `npm run validate`.
- GITHUB-ACTIONS-RELEASE-01 completada: workflow `.github/workflows/release-desktop.yml` implementado con `tauri-apps/tauri-action@v0` para construir en `windows-latest` el instalador NSIS y empaquetar la versiÃ³n portable en `.zip` ante push de tag `v*` o ejecuciÃ³n manual.

- TAURI-SYSTEM-TRAY-01 completada: se integró el System Tray nativo con Tauri v2 habilitando la ventana en segundo plano (minimize on close) y el menú contextual ('Abrir Activity UI', 'Comprobar conexión con ActivityWatch', 'Salir').
- THEME-DARK-LIGHT-01 (Planificado para v0.2.0): Añadir alternador de tema Claro / Oscuro con persistencia en localStorage, detección de prefers-color-scheme de Windows y adaptación de la paleta Tailwind.
