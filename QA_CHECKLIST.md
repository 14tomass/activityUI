# QA_CHECKLIST

## QA-FUNCTIONAL-01

Checklist manual guiada para validar el estado estable posterior a `RANGE-NAV-AND-MONTH-PLAN-01`, sin prefetch ni optimizaciones experimentales activas.

## Alcance

- Vista `Semana`
- Vista `Dia`
- Vista `Mes`
- Navegacion con limites
- Categorias y detalles
- Configuracion
- Estados de carga y error
- Consola del navegador

## Preparacion previa

- [ ] Confirmar que ActivityWatch esta arrancado en local.
- [ ] Confirmar que la app se abre en desarrollo.
- [ ] Abrir DevTools del navegador antes de empezar.
- [ ] Tener visible la pestaña `Console`.
- [ ] Tener visible la pestaña `Network` si hace falta revisar fallos reales.

## Entorno recomendado

- App local: `npm run dev`
- URL esperada: `http://127.0.0.1:5173`
- API ActivityWatch esperada: `http://localhost:5600/api/0/`

## Evidencia a guardar si algo falla

- Captura completa de la pantalla con el estado visible.
- Captura de la consola si hay error o warning.
- Texto del rango activo (`Semana`, `Dia` o `Mes`) y fecha/rango visible.
- Descripcion exacta del paso donde falla.
- Si aplica, captura de `Network` con la request fallida a ActivityWatch.

## Resultado global

| Bloque | Estado | Notas |
| --- | --- | --- |
| Semana | `[ ] OK [ ] FAIL` | |
| Dia | `[ ] OK [ ] FAIL` | |
| Mes | `[ ] OK [ ] FAIL` | |
| Navegacion y limites | `[ ] OK [ ] FAIL` | |
| Categorias y detalles | `[ ] OK [ ] FAIL` | |
| Configuracion | `[ ] OK [ ] FAIL` | |
| Estados de carga/error | `[ ] OK [ ] FAIL` | |
| Consola limpia | `[ ] OK [ ] FAIL` | |

## A. Semana

### A.1 Entrada inicial

| Paso | Resultado esperado | Estado | Notas |
| --- | --- | --- | --- |
| Abrir la app por primera vez | La app arranca en la vista `Semana` | `[ ] OK [ ] FAIL` | |
| Observar tabs superiores | El orden visible es `Semana | Dia | Mes` | `[ ] OK [ ] FAIL` | |
| Observar rango visible | Se muestra una semana natural lunes-domingo coherente con el dia actual de ActivityWatch | `[ ] OK [ ] FAIL` | |

### A.2 KPI y grafico

| Paso | Resultado esperado | Estado | Notas |
| --- | --- | --- | --- |
| Esperar carga inicial | El KPI semanal deja el placeholder y muestra tiempo real | `[ ] OK [ ] FAIL` | |
| Revisar subtitulo/KPI secundario | Aparece `Media diaria` en contexto semanal | `[ ] OK [ ] FAIL` | |
| Revisar grafico semanal | Se ven 7 barras/dias y el eje no aparece roto o desbordado | `[ ] OK [ ] FAIL` | |
| Validar escala semanal | La barra mas alta no comunica un valor falso; el valor seleccionado coincide con la proporcion visual | `[ ] OK [ ] FAIL` | |
| Revisar dias futuros si es semana actual | Los dias futuros aparecen a `0` y no parecen interactivos | `[ ] OK [ ] FAIL` | |

### A.3 Categorias y seleccion de dia

| Paso | Resultado esperado | Estado | Notas |
| --- | --- | --- | --- |
| Esperar carga de categorias | Las categorias semanales muestran duracion y progreso | `[ ] OK [ ] FAIL` | |
| Pulsar un dia no futuro del grafico semanal | El modo sigue siendo `Semana` y no navega al tab `Dia` | `[ ] OK [ ] FAIL` | |
| Revisar bloque inferior tras seleccionar dia | Si la funcionalidad sigue activa, las categorias cambian al contexto del dia seleccionado | `[ ] OK [ ] FAIL` | |
| Pulsar el mismo dia otra vez | Se limpia la seleccion y vuelven las categorias semanales | `[ ] OK [ ] FAIL` | |
| Probar switch `Semana | Dia` si aparece | `Dia` refleja contexto de dia seleccionado y `Semana` restaura el agregado semanal | `[ ] OK [ ] FAIL` | |

### A.4 Navegacion semanal

| Paso | Resultado esperado | Estado | Notas |
| --- | --- | --- | --- |
| Pulsar flecha izquierda varias veces | Retrocede semana a semana sin romper KPI, grafico ni categorias | `[ ] OK [ ] FAIL` | |
| Intentar superar 5 semanas atras | La navegacion izquierda queda bloqueada en el limite | `[ ] OK [ ] FAIL` | |
| Volver hacia delante | La flecha derecha avanza hasta la semana actual | `[ ] OK [ ] FAIL` | |
| Intentar avanzar desde la semana actual | La flecha derecha queda bloqueada | `[ ] OK [ ] FAIL` | |
| Cambiar a `Dia` o `Mes` y volver a `Semana` | Si esa semana ya se vio en la sesion, reaparece sin recarga completa visible | `[ ] OK [ ] FAIL` | |

## B. Dia

### B.1 Entrada y carga

| Paso | Resultado esperado | Estado | Notas |
| --- | --- | --- | --- |
| Entrar en el tab `Dia` | El tab cambia correctamente sin errores visuales | `[ ] OK [ ] FAIL` | |
| Revisar fecha visible | La fecha mostrada es coherente con el dia seleccionado | `[ ] OK [ ] FAIL` | |
| Esperar carga del KPI | El KPI diario deja el placeholder y muestra tiempo real | `[ ] OK [ ] FAIL` | |
| Revisar grafico horario | Se muestran 24 franjas `00-23` sin overflow | `[ ] OK [ ] FAIL` | |
| Revisar categorias diarias | Las categorias muestran datos diarios reales | `[ ] OK [ ] FAIL` | |
| Cambiar a `Semana` o `Mes` y volver a `Dia` | Si ese dia ya se vio en la sesion, KPI/grafico/categorias reaparecen inmediatamente | `[ ] OK [ ] FAIL` | |

### B.2 Detalles

| Paso | Resultado esperado | Estado | Notas |
| --- | --- | --- | --- |
| Pulsar una barra horaria con uso | Se abre modal con detalle real de esa hora | `[ ] OK [ ] FAIL` | |
| Revisar modal horario | Muestra total, items y cierre usable | `[ ] OK [ ] FAIL` | |
| Cerrar modal horario | El modal se cierra sin dejar overlay roto | `[ ] OK [ ] FAIL` | |
| Pulsar una categoria del dashboard | Se abre modal con detalle real de esa categoria | `[ ] OK [ ] FAIL` | |
| Revisar modal de categoria | Muestra total, items y estado coherente con la categoria | `[ ] OK [ ] FAIL` | |
| Cerrar modal de categoria | El modal se cierra correctamente | `[ ] OK [ ] FAIL` | |

### B.3 Navegacion diaria

| Paso | Resultado esperado | Estado | Notas |
| --- | --- | --- | --- |
| Pulsar flecha izquierda varias veces | Retrocede dia a dia manteniendo carga correcta | `[ ] OK [ ] FAIL` | |
| Intentar superar 15 dias atras | La flecha izquierda queda bloqueada en el limite | `[ ] OK [ ] FAIL` | |
| Volver hacia delante | La flecha derecha avanza hasta el dia actual de ActivityWatch | `[ ] OK [ ] FAIL` | |
| Intentar avanzar a futuro | La flecha derecha queda bloqueada | `[ ] OK [ ] FAIL` | |

## C. Mes

### C.1 Entrada y carga

| Paso | Resultado esperado | Estado | Notas |
| --- | --- | --- | --- |
| Entrar en el tab `Mes` | El tab cambia correctamente sin errores visuales | `[ ] OK [ ] FAIL` | |
| Revisar mes/rango visible | El mes mostrado coincide con el seleccionado | `[ ] OK [ ] FAIL` | |
| Esperar carga del KPI mensual | El KPI deja el placeholder y muestra tiempo total mensual | `[ ] OK [ ] FAIL` | |
| Revisar media diaria mensual | La media diaria aparece en el contexto mensual | `[ ] OK [ ] FAIL` | |
| Revisar grafico mensual | Se muestran semanas `S1..Sn` sin roturas visuales | `[ ] OK [ ] FAIL` | |
| Revisar categorias mensuales | Las categorias agregadas del mes cargan correctamente | `[ ] OK [ ] FAIL` | |

### C.2 Limites y simplicidad

| Paso | Resultado esperado | Estado | Notas |
| --- | --- | --- | --- |
| Pulsar flecha izquierda varias veces | Retrocede mes a mes sin romper la vista | `[ ] OK [ ] FAIL` | |
| Intentar superar 3 meses atras | La flecha izquierda queda bloqueada en el limite | `[ ] OK [ ] FAIL` | |
| Volver hacia delante | La flecha derecha avanza hasta el mes actual | `[ ] OK [ ] FAIL` | |
| Intentar avanzar a futuro | La flecha derecha queda bloqueada | `[ ] OK [ ] FAIL` | |
| Pulsar categorias o barras mensuales | No deben aparecer interacciones complejas no previstas para `Mes` | `[ ] OK [ ] FAIL` | |
| Cambiar a `Semana` o `Dia` y volver a `Mes` | Si ese mes ya se vio en la sesion, reaparece sin recalcular todo de forma visible | `[ ] OK [ ] FAIL` | |

## D. Configuracion

### D.1 Apertura y visualizacion

| Paso | Resultado esperado | Estado | Notas |
| --- | --- | --- | --- |
| Abrir panel de Configuracion | El panel se abre con overlay y cierre usable | `[ ] OK [ ] FAIL` | |
| Revisar lista inicial | Se ven categorias por defecto y, si existen, categorias creadas por usuario | `[ ] OK [ ] FAIL` | |
| Revisar scroll del panel | El contenido inferior y el boton de crear categoria son accesibles | `[ ] OK [ ] FAIL` | |

### D.2 Crear categoria

| Paso | Resultado esperado | Estado | Notas |
| --- | --- | --- | --- |
| Pulsar `Crear nueva categoria` | Se abre modal de alta | `[ ] OK [ ] FAIL` | |
| Introducir nombre valido y guardar | La categoria se crea y aparece en Configuracion | `[ ] OK [ ] FAIL` | |
| Cerrar y reabrir panel | La nueva categoria persiste | `[ ] OK [ ] FAIL` | |
| Volver al dashboard | La nueva categoria existe tambien en el dashboard | `[ ] OK [ ] FAIL` | |

### D.3 Editar reglas

| Paso | Resultado esperado | Estado | Notas |
| --- | --- | --- | --- |
| Pulsar una categoria en Configuracion | Se abre modal de edicion, no de detalle analitico | `[ ] OK [ ] FAIL` | |
| Anadir una regla de dominio | La regla se acepta y se mantiene en la categoria tras guardar | `[ ] OK [ ] FAIL` | |
| Anadir una regla de aplicacion `.exe` | La regla se acepta como aplicacion y se mantiene tras guardar | `[ ] OK [ ] FAIL` | |
| Reutilizar una regla existente en otra categoria | La regla se mueve automaticamente y deja de existir en la categoria anterior | `[ ] OK [ ] FAIL` | |
| Guardar con input con texto | Se guarda/anade la regla y el modal puede permanecer abierto | `[ ] OK [ ] FAIL` | |
| Guardar con input vacio | Se guarda y cierra el modal | `[ ] OK [ ] FAIL` | |
| Reabrir la misma categoria | Las reglas persisten correctamente | `[ ] OK [ ] FAIL` | |
| Revisar texto de ayuda del modal | Aparece el consejo sobre `.exe` y dominios con estilo secundario | `[ ] OK [ ] FAIL` | |
| Abrir categoria con `3+` reglas | El modal respeta el viewport y no queda desbordado | `[ ] OK [ ] FAIL` | |
| Hacer scroll dentro del modal de edicion | La zona central se desplaza sin perder acceso al contenido | `[ ] OK [ ] FAIL` | |
| Revisar boton `X` con el modal cargado | Sigue visible y accesible sin necesidad de recolocar la ventana | `[ ] OK [ ] FAIL` | |
| Revisar `Guardar cambios` con muchas reglas | El boton sigue visible y accesible aunque el cuerpo tenga scroll | `[ ] OK [ ] FAIL` | |
| Cerrar modal tras hacer scroll | Se puede cerrar con `X` o `Cancelar` sin que el overlay quede bloqueado | `[ ] OK [ ] FAIL` | |
| Volver al dashboard tras editar reglas | Los cambios se reflejan en categorias/detalles si afectan a datos reales del rango visible | `[ ] OK [ ] FAIL` | |
| Abrir categoria creada por usuario | El modal de edicion muestra accion para eliminar categoria | `[ ] OK [ ] FAIL` | |
| Eliminar categoria creada por usuario | La categoria desaparece de Configuracion y del dashboard tras confirmar | `[ ] OK [ ] FAIL` | |
| Intentar eliminar categoria base | No debe existir opcion de borrado para `Estudio`, `Entretenimiento`, `Productividad` u `Otros` | `[ ] OK [ ] FAIL` | |

## E. Estados de carga y error

| Paso | Resultado esperado | Estado | Notas |
| --- | --- | --- | --- |
| Cargar por primera vez la app | KPI, grafico y categorias muestran placeholders neutros antes del dato real | `[ ] OK [ ] FAIL` | |
| Cambiar entre `Semana`, `Dia` y `Mes` | No aparece contenido viejo como si fuese del nuevo rango durante la carga | `[ ] OK [ ] FAIL` | |
| Abrir detalle horario | Se muestra loading neutro antes del contenido real | `[ ] OK [ ] FAIL` | |
| Abrir detalle de categoria | Se muestra loading neutro antes del contenido real | `[ ] OK [ ] FAIL` | |
| Si ActivityWatch falla temporalmente | La UI no debe romperse; pueden aparecer warnings reales y estados neutros | `[ ] OK [ ] FAIL` | |

## F. Consola

| Paso | Resultado esperado | Estado | Notas |
| --- | --- | --- | --- |
| Revisar consola al cargar la app | No aparecen logs temporales antiguos | `[ ] OK [ ] FAIL` | |
| Cambiar entre `Semana`, `Dia` y `Mes` | No aparecen logs de verificacion retirados | `[ ] OK [ ] FAIL` | |
| Abrir detalles y Configuracion | No aparecen logs `PERF-*` ni trazas de prefetch | `[ ] OK [ ] FAIL` | |
| Revisar logs temporales de `QA-FIX-01` | Solo aparecen los bloques `QA-FIX-*` esperados para esta validacion | `[ ] OK [ ] FAIL` | |
| Abrir modal de edicion de categoria | Aparece el bloque `[QA-FIX-CATEGORY-MODAL-SCROLL-VERIFY]` con `validation: OK` | `[ ] OK [ ] FAIL` | |
| Provocar una situacion real de error si ocurre | Solo aparecen `warnings`/errores reales relacionados con ActivityWatch o peticiones fallidas | `[ ] OK [ ] FAIL` | |

## Formato recomendado para reportar resultados

- Fecha de prueba:
- Navegador:
- ActivityWatch activo: `Si / No`
- Resultado global:
- Bloques con `FAIL`:
- Capturas adjuntas:
- Logs de consola adjuntos:
- Observaciones adicionales:
