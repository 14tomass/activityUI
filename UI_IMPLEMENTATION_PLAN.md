# Plan de implementacion inicial de UI con datos mock

## Resumen

El proyecto ya tiene la base tecnica cerrada con React, JavaScript, Vite y Tailwind, una estructura inicial de `src/` y una home placeholder. La primera iteracion de UI debe sustituir esa portada por una unica experiencia de dashboard con tres capas visuales: vista principal, panel lateral de configuracion y modales centrados de categoria, todo alimentado por mocks y sin tocar todavia ActivityWatch.

## Analisis de pantallas

- **`dashboard-home.png`**: pantalla principal limpia y muy centrada, con fondo gris claro, selector de rango arriba, selector de fecha debajo, gran KPI central, tarjeta de barras por horas y tarjeta de categorias con barras horizontales. Hay un boton flotante de menu a la derecha que actua como entrada al panel de configuracion.
- **`settings-pannel.png`**: el dashboard queda desenfocado y atenuado, y aparece un panel lateral derecho con titulo, boton cerrar, descripcion corta, lista de categorias y CTA para crear nueva categoria. Cada categoria se representa como fila clicable con punto de color, nombre, contador de aplicaciones y chevron.
- **`category-detail-modal.png`**: modal centrado sobre overlay oscuro con el detalle de una categoria, total acumulado y lista de apps/sitios con barra de progreso individual y duracion. Parece una vista de solo lectura.
- **`category-edit-modal.png`**: modal centrado con el mismo tono visual, encabezado de categoria, descripcion, lista editable de apps/sitios, input para agregar nuevo item y dos acciones principales: cancelar y guardar cambios. Visualmente comparte gran parte del armazon con el modal de detalle.

## Estructura de UI propuesta

- Mantener una sola pagina principal `HomePage` como contenedor de estado de interfaz.
- Separar la UI en tres niveles:
  - `DashboardScreen`: layout principal con filtros, KPI, grafica por horas y resumen por categorias.
  - `SettingsDrawer`: panel lateral derecho que se monta sobre overlay.
  - `CategoryModal`: shell comun de modal, reutilizado por detalle y edicion.
- Organizar por feature:
  - `src/features/dashboard/` para la vista principal.
  - `src/features/categories/` para drawer, modales y listas de categorias.
  - `src/components/ui/` para primitives reutilizables visuales.
  - `src/mocks/` para datos simulados de dashboard y categorias.

## Componentes React recomendados

- `DashboardPage` o reutilizar `HomePage` como pagina ensambladora.
- `DashboardLayout` para centrar y espaciar la composicion general.
- `TimeRangeTabs` para Hoy / Ultima semana / Ultimo mes.
- `DateNavigator` para fecha actual con flechas.
- `TotalUsageHero` para KPI principal y subtitulo.
- `UsageByHourCard` para la tarjeta del grafico horario.
- `HourlyBarChart` para barras mock simples en divs, sin libreria externa.
- `CategorySummaryCard` para la tarjeta de categorias.
- `CategorySummaryList` para las filas de categoria con barra y duracion.
- `SettingsFab` para el boton flotante de apertura.
- `SettingsDrawer` para el lateral de configuracion.
- `CategoryListItem` reutilizable en drawer y listas.
- `Overlay` reutilizable para drawer y modales.
- `ModalShell` reutilizable para detalle y edicion.
- `CategoryDetailModal` para vista de solo lectura.
- `CategoryEditModal` para vista editable.
- `AppSiteList` para renderizar apps/sitios dentro de modales.
- `ProgressRow` para item con icono, nombre, barra y duracion.
- `TextInputRow` para el alta mock de app/sitio en edicion.
- `PrimaryButton`, `SecondaryButton`, `IconButton`, `Card`, `PillTabs` como primitives reutilizables.

## Archivos o carpetas a tocar en implementacion

- Actualizar:
  - `src/pages/HomePage.jsx`
  - `src/components/layout/AppShell.jsx`
  - `src/index.css`
- Crear o ampliar:
  - `src/features/dashboard/components/`
  - `src/features/categories/components/`
  - `src/components/ui/`
  - `src/mocks/`
  - `src/lib/` solo si hace falta una pequena capa de transformacion de mocks, no de API real
- Sustituir o retirar el placeholder actual de `src/features/dashboard/components/WelcomeHero.jsx` al incorporar la UI nueva.

## Datos mock necesarios

- **Estado de dashboard**:
  - rango seleccionado: `today | week | month`
  - fecha seleccionada: texto visible y claves de navegacion mock
  - total de uso visible en grande
- **Uso por horas**:
  - array de 24 bloques con `hour`, `minutes`, `isHighlighted`
- **Categorias resumen**:
  - id, nombre, color, totalMinutes, displayDuration, itemCount, percentage
- **Detalle de categoria**:
  - id de categoria
  - totalMinutes
  - lista de items con `id`, `label`, `type`, `iconKind`, `minutes`, `displayDuration`, `share`
- **Edicion de categoria**:
  - nombre
  - color
  - items existentes
  - campo temporal para nuevo item mock
- **UI state**:
  - `isSettingsOpen`
  - `activeCategoryId`
  - `activeModal`: `null | detail | edit`

## Interacciones que deben funcionar desde el inicio

- Abrir panel de configuracion desde el boton flotante.
- Cerrar panel de configuracion desde el boton cerrar.
- Abrir modal de detalle desde una categoria del panel.
- Cerrar modal de detalle desde el boton cerrar.
- Abrir modal de edicion desde el modal de detalle o desde una accion explicita de categoria.
- Cerrar modal de edicion desde cancelar y desde el boton cerrar.
- Mantener una sola capa activa por nivel:
  - dashboard base
  - drawer abierto opcionalmente
  - modal sobre drawer cuando corresponda
- Las interacciones pueden ser solo de UI state local en la primera iteracion; no hace falta persistencia real.

## Implementacion en tareas pequenas y revisables

1. **Base visual del dashboard**
   - Reemplazar la portada placeholder por el layout principal del dashboard.
   - Montar fondo claro, contenedor central, tabs, fecha, KPI y boton flotante.
2. **Tarjetas principales del dashboard**
   - Implementar tarjeta de uso por horas con barras mock.
   - Implementar tarjeta de categorias resumen con barras horizontales mock.
3. **Primitives y estilo compartido**
   - Extraer `Card`, `IconButton`, `Overlay`, `ModalShell`, `CategoryListItem`, botones y estilos de tipografia/espaciado.
4. **Panel de configuracion**
   - Implementar drawer lateral derecho con overlay, lista de categorias y CTA de crear categoria.
   - Conectar apertura y cierre.
5. **Modal de detalle de categoria**
   - Implementar modal centrado de solo lectura.
   - Conectar apertura desde el drawer y cierre.
6. **Modal de edicion de categoria**
   - Implementar modal de edicion reutilizando shell y lista base.
   - Conectar apertura y cierre.
7. **Refactor y limpieza**
   - Mover mocks a estructura estable.
   - Reducir acoplamientos y dejar naming definitivo para la iteracion 1.
8. **Validacion manual**
   - Revisar build, lint y vista local.
   - Ajustar espaciados, overlays y estados visibles para acercarse a Figma.

## Elementos que deben ser reutilizables

- Overlay comun para drawer y modales.
- Shell base de modal.
- Botones primarios, secundarios e icon buttons.
- Tarjeta base con radio, sombra y padding consistentes.
- Fila de categoria con punto de color, texto secundario y trailing action.
- Barra de progreso horizontal.
- Tabs tipo pill para filtros.
- Encabezado de seccion y contenedores de bloques.

## Partes para una segunda iteracion

- Navegacion real entre dias, semanas y meses.
- Animaciones refinadas de drawer y modales.
- Gestion real de alta, borrado o reordenacion de apps dentro de categorias.
- Conectar el modal de detalle de categoria a datos reales de ActivityWatch (desglose por apps/sitios del dia seleccionado).
- Sistema completo de iconos por aplicacion o dominio.
- Responsive fino para mobile si Figma no define explicitamente esa version.
- Estados vacios, validaciones de formulario y mensajes de error.
- Integracion con ActivityWatch y transformacion de datos reales.

## Evolucion funcional acordada tras DATA-07

- **DATA-08 (futuro)**: el modal de detalle de categoria (hoy mock) debe conectarse a datos reales para mostrar exactamente en que apps/sitios se consume el tiempo de cada categoria en el dia activo.
- **DATA-09 (implementada)**: el grafico "Uso por horas" ya incorpora clic por barra para inspeccionar una franja concreta con desglose real de apps/sitios, manteniendo top 7 + agregado y estado vacio limpio.

## Aclaracion de flujo (post DATA-08)

- El acceso principal al detalle analitico de categoria es desde Home (tarjeta de categorias del dashboard).
- El panel de Configuracion queda orientado a modificar reglas de categorias, por lo que el clic en categoria desde ese panel debe abrir el modal de edicion.
- El panel de Configuracion incluye creacion de categorias: el CTA abre modal de alta con validacion de nombre y persistencia local.
- En carga inicial del Home, los bloques analiticos deben mostrar placeholders neutros y no valores mock realistas.
- El detalle por categoria debe limpiar contenido previo al cambiar de categoria y resolver siempre a estado cargado o no disponible (sin loading infinito).
- En edicion de categorias, `Guardar cambios` tiene comportamiento condicional:
- con input vacio guarda y cierra
- con input con texto guarda/anade y se mantiene abierto para continuar editando
- `X` siempre cierra
- La grafica de horas debe mostrar 24 franjas (00-23) dentro del contenedor, sin overflow horizontal.
- El boton flotante de Configuracion debe quedar anclado al viewport en esquina superior derecha (no depender del contenedor centrado).
- El panel lateral de Configuracion debe soportar scroll interno y mantener cabecera visible para evitar contenido inferior inaccesible.

## Primera tarea recomendada

Implementar primero la **base visual del dashboard principal con mocks estaticos**, sin drawer ni modales. Es la mejor primera tarea porque fija la direccion visual, define espaciado, tipografia, contenedores y primitives, y reduce mucho el riesgo antes de montar capas interactivas encima.

## Pruebas y validacion previstas

- `npm run build`
- `npm run lint`
- `npm run dev` para comprobar:
  - dashboard principal visible
  - drawer abre y cierra
  - modal de detalle abre y cierra
  - modal de edicion abre y cierra
  - overlays y jerarquia visual correctos

## Ambiguedades detectadas y defaults propuestos

- El archivo disponible es `settings-pannel.png`; asumo que corresponde a la pantalla de configuracion solicitada.
- No se ve una accion explicita de “editar” en la vista de detalle; propongo como default que el modal de detalle incluya una accion visible para abrir el modal de edicion.
- No queda claro si “Crear nueva categoria” debe abrir el mismo modal de edicion vacio en esta iteracion; propongo dejar ese CTA visualmente presente pero sin flujo completo hasta la segunda iteracion, salvo que quieras incluirlo desde el inicio.
- No hay definicion visible de comportamiento responsive; propongo priorizar desktop-first y dejar el ajuste fino responsive para la segunda iteracion.
- En esta sesion no debo escribir archivos del repo porque seguimos en Plan Mode; el contenido anterior es el que deberia guardarse en `UI_IMPLEMENTATION_PLAN.md` cuando salgamos de modo plan.
