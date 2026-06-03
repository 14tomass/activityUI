# DEMO_LOCAL

Guia practica para preparar y ensenar el MVP local de `activityUI`.

## Antes de la demo

1. Abrir ActivityWatch.
2. Verificar que responde:
   - `http://localhost:5600/api/0/info`
3. Entrar en la carpeta del proyecto.
4. Arrancar la app:

```bash
npm run dev
```

5. Abrir:
   - `http://127.0.0.1:5173`
6. Si la consola muestra errores externos del navegador o extensiones:
   - usar una ventana de incognito
   - o desactivar extensiones temporalmente

## Flujo de demo recomendado

1. Mostrar que la vista inicial es `Semana`.
2. Explicar el KPI semanal.
3. Explicar la media diaria semanal.
4. Mostrar el grafico semanal por dias.
5. Seleccionar un dia dentro de `Semana`.
6. Mostrar que las categorias pasan al contexto de ese dia.
7. Abrir el detalle de una categoria desde `Semana` con dia seleccionado.
8. Cambiar al tab `Dia`.
9. Mostrar el KPI diario.
10. Mostrar el grafico por horas.
11. Abrir el detalle de una hora.
12. Abrir el detalle de una categoria diaria.
13. Cambiar al tab `Mes`.
14. Mostrar el resumen mensual simple:
   - total mensual
   - media diaria
   - grafico por semanas
   - categorias agregadas
15. Abrir `Configuracion`.
16. Crear una categoria nueva.
17. Anadir una regla.
18. Explicar la diferencia entre:
   - dominios web
   - aplicaciones `.exe`
19. Mostrar que la configuracion se persiste localmente.

## Puntos clave a remarcar en la demo

- La app es local y consume ActivityWatch en la propia maquina.
- No hay backend propio.
- No se envian datos fuera.
- `Semana`, `Dia` y `Mes` ya estan funcionales.
- Las categorias son editables y dinamicas.
- ActivityWatch cerrado no rompe la UI.

## Que no esta incluido todavia

- Deploy publico
- Instalador de escritorio
- Sincronizacion entre dispositivos
- Optimizacion avanzada de rendimiento
- Renombrar categorias
- Personalizar colores de categorias
- Exportar o importar configuracion

## Consejos para una demo limpia

- Usar navegador con consola limpia.
- Tener ActivityWatch abierto unos minutos antes para asegurar datos recientes.
- Evitar tocar el build durante la demo: el flujo validado es `npm run dev`.
- Si algo falla con ActivityWatch, ensenar que la app se mantiene estable y no
  se rompe.
