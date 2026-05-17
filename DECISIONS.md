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

### Estrategia de implementacion

- Antes de conectar datos reales, se replicara la UI de Figma con datos mock.

### Privacidad

- Se prioriza privacidad: los datos no saldran del ordenador.
