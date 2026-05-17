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
- DATA-04 completada: tarjeta "Uso por horas" conectada a datos reales canónicos de ActivityWatch para `2026-05-16`, con 24 barras horarias y fallback mock si falla la carga.
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
- DATA-08 pendiente: conectar el modal de detalle de categoria con desglose real por apps/sitios del dia seleccionado.
- DATA-09 pendiente: permitir inspeccionar una franja del grafico por horas al hacer clic en una barra y mostrar desglose real de apps/sitios dentro de esa hora.

## Fase 5: Calidad, seguridad, estados de error y pulido

- [ ] Revisar accesibilidad y consistencia visual
- [ ] Mejorar mensajes de error y estados vacios
- [ ] Revisar privacidad y no salida de datos
- [ ] Limpiar codigo, documentacion y estructura final del MVP
- [ ] Preparar checklist final de entrega
