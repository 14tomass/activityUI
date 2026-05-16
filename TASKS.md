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

## Fase 4: Sistema de categorias

- [ ] Definir el modelo de categorias para agrupar actividad
- [ ] Disenar reglas base de clasificacion
- [ ] Implementar configuracion local de categorias
- [ ] Reflejar categorias en graficas, listas y resumenes

## Fase 5: Calidad, seguridad, estados de error y pulido

- [ ] Revisar accesibilidad y consistencia visual
- [ ] Mejorar mensajes de error y estados vacios
- [ ] Revisar privacidad y no salida de datos
- [ ] Limpiar codigo, documentacion y estructura final del MVP
- [ ] Preparar checklist final de entrega
