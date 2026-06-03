# activityUI

UI local para visualizar de forma moderna los datos de ActivityWatch.

Este proyecto no sustituye a ActivityWatch ni envia datos a servidores externos.
Es un frontend local que consume la API REST de ActivityWatch en la maquina del
usuario y presenta:

- resumen semanal, diario y mensual
- categorias editables
- detalle por categoria
- detalle por hora

## Estado actual

- MVP local estable.
- Pensado para uso y demo en local.
- Sin deploy publico todavia.
- Sin backend propio.

## Stack

- React
- JavaScript
- Vite
- Tailwind CSS

## Requisitos

- Node.js y npm
- Entorno recomendado: Ubuntu/WSL para ejecutar los comandos del proyecto
- ActivityWatch abierto en Windows o en la misma maquina donde expone su API
- API local disponible en:
  - `http://localhost:5600/api/0`

## Instalacion

Instalar dependencias:

```bash
npm install
```

## Desarrollo local

Arrancar la app en desarrollo:

```bash
npm run dev
```

Abrir despues:

```text
http://127.0.0.1:5173
```

## Scripts principales

- `npm run dev`
  - arranca la app en desarrollo
- `npm run lint`
  - valida el codigo y la configuracion actual
- `npm run build`
  - intenta generar build de produccion

## ActivityWatch y CORS

Para que el frontend en `http://127.0.0.1:5173` pueda consultar la API local,
`aw-server` debe permitir ese origen.

Ruta habitual del archivo de configuracion en Windows:

```text
C:\Users\tomas\AppData\Local\activitywatch\activitywatch\aw-server\aw-server.toml
```

En la seccion `[server]`:

```toml
cors_origins = "http://127.0.0.1:5173"
```

Despues de cambiarlo, reinicia ActivityWatch.

## Si ActivityWatch no conecta

Comprueba lo siguiente:

1. ActivityWatch esta abierto.
2. La URL `http://localhost:5600/api/0/info` responde.
3. El origen `http://127.0.0.1:5173` esta permitido en `aw-server.toml`.
4. No hay extensiones del navegador interfiriendo con la consola o con las
   requests.

Si ActivityWatch no esta disponible:

- la app no deberia romperse
- se mantendran estados neutros o mensajes de no disponible
- pueden aparecer `warnings` controlados en consola

## Problema conocido de build con rolldown

El flujo principal validado ahora mismo es:

- `npm run dev`
- `npm run lint`

`npm run build` puede fallar en entornos mezclados Windows/WSL por el binding
nativo de rolldown, con errores del tipo:

- `Cannot find native binding`
- `@rolldown/binding-win32-x64-msvc`

Esto no se considera un fallo funcional de la app.

Antes de preparar un release real o un deploy, habra que resolver ese build en
un entorno limpio y consistente.

## Uso recomendado para demo local

Consulta tambien:

- [DEMO_LOCAL.md](/\\wsl.localhost\Ubuntu\home\tomas\USAL%20LINUX\activityUI\DEMO_LOCAL.md)
- [SMOKE_TEST.md](/\\wsl.localhost\Ubuntu\home\tomas\USAL%20LINUX\activityUI\SMOKE_TEST.md)
- [QA_CHECKLIST.md](/\\wsl.localhost\Ubuntu\home\tomas\USAL%20LINUX\activityUI\QA_CHECKLIST.md)

## Estructura del proyecto

```text
src/
  app/
  features/
  lib/
  mocks/
  components/
  pages/
scripts/
docs/
```
