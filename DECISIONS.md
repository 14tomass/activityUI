# DECISIONS

## Decisiones tecnicas iniciales

### Stack

- Se usa React + JavaScript + Vite + Tailwind CSS.

### Complejidad inicial

- No se usa TypeScript en esta primera version para reducir complejidad.

### Relacion con ActivityWatch

- No se hara un fork de ActivityWatch en esta etapa.
- La app sera un frontend independiente que leera la API local de ActivityWatch.
- En discovery de buckets web, se priorizara el bucket `web.tab.current` que coincida con el host activo (`_${hostname}` via `/api/0/info`) para alinearse con la telemetria local real.
- Para DATA-05, el desglose de sitios web se agrupa por dominio (`hostname` sin prefijo `www.`) en lugar de URL completa para facilitar la futura clasificacion por categorias.
- Para DATA-05, el calculo de websites sigue logica Browser Style de ActivityWatch: interseccion de eventos web con ventanas activas de navegador + `split_url_events`, antes de agrupar por dominio.
- Para DATA-06, la categorizacion de tiempo activo sigue prioridad estable: dominio web (si existe) -> aplicacion activa -> `Otros`.
- Para DATA-06, no se permite doble conteo: cada tramo temporal activo se asigna a una unica categoria.
- Para la edicion de categorias (DATA-08+), las reglas de clasificacion se mantienen en almacenamiento local del navegador (`localStorage`) con fallback automatico a reglas por defecto si no hay persistencia.
- En detalle analitico de categoria se mostraran como maximo los 7 items principales por duracion y el resto se agrupara en una fila `Otras webs y apps`.
- El detalle analitico del Home no incluye accion de edicion; la edicion de reglas queda reservada al panel de Configuracion.
- En carga inicial del Home se usan placeholders neutros y nunca valores mock realistas que puedan confundirse con datos reales.
- En reglas editables, entradas que terminan en `.exe` se clasifican siempre como `application` (aunque contengan punto) para evitar tratarlas como dominio web.
- El sistema de categorias soporta categorias dinamicas de usuario persistidas en `localStorage`, manteniendo como base `Estudio`, `Entretenimiento`, `Productividad` y `Otros`.
- Las categorias creadas por usuario reciben color automatico desde una paleta corta predefinida; si no hay color libre, fallback neutro.
- El detalle por franja horaria (DATA-09) sigue la misma regla anti-doble-conteo del proyecto: prioridad web por solapamiento temporal y fallback a aplicacion para tiempo remanente.

### Estrategia de implementacion

- Antes de conectar datos reales, se replicara la UI de Figma con datos mock.

### Privacidad

- Se prioriza privacidad: los datos no saldran del ordenador.
