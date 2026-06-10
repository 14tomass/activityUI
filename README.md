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
- Plan de desktop release documentado en `RELEASE_DESKTOP_PLAN.md`.

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

## Entorno recomendado para instalar y construir

Trabaja desde la ruta Linux real del proyecto dentro de WSL:

```bash
cd "/home/tomas/USAL LINUX/activityUI"
```

No uses para instalar o construir:

- PowerShell en Windows
- `cmd.exe`
- rutas UNC como `\\wsl.localhost\...`

Antes de ejecutar `npm`, activa el runtime Node Linux local del proyecto:

```bash
source scripts/use-local-node-wsl.sh
```

Ese script descarga si hace falta un Node Linux local en `.local-tools/` y lo
pone primero en `PATH` para la shell actual.

## Instalacion

Instalar dependencias desde WSL:

```bash
source scripts/use-local-node-wsl.sh
npm install
```

## Desarrollo local

Arrancar la app en desarrollo:

```bash
source scripts/use-local-node-wsl.sh
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
  - genera build de produccion
- `npm run preview`
  - sirve localmente el build generado para revisar el resultado final
- `npm run tauri:dev`
  - arranca la shell minima de Tauri sobre el frontend actual
- `npm run tauri:build`
  - prepara el build desktop de Tauri
- `npm run tauri:info`
  - muestra diagnostico del entorno Tauri y prerequisitos faltantes

## Shell Tauri MVP

El repositorio ya incluye una integracion minima de Tauri en `src-tauri/`.

Configuracion actual:

- desarrollo Tauri contra Vite en `http://127.0.0.1:1420`
- build Tauri contra `dist/`
- sin cambios en la logica funcional del frontend
- la app sigue intentando conectar con ActivityWatch en
  `http://localhost:5600/api/0`

Para ejecutar `npm run tauri:dev` hace falta un entorno con prerequisitos
Tauri completos.

En Linux/WSL eso incluye Rust y dependencias nativas como `webkit2gtk`.
Para validar ventana real de escritorio en este proyecto, el entorno
recomendado sigue siendo Windows nativo con la toolchain indicada en
`RELEASE_DESKTOP_PLAN.md`.

## Tauri en Windows

Para Tauri e instalador Windows, usa Windows nativo y una ruta Windows normal,
no `\\wsl.localhost\...`.

Guia detallada:

- [docs/TAURI_SETUP.md](/C:/Users/tomas/OneDrive/Documentos/activity/activityUI/docs/TAURI_SETUP.md)

Notas practicas validadas:

- `tauri:info` detecta correctamente WebView2 y MSVC en Windows nativo
- si PowerShell bloquea `npm.ps1`, usa `npm.cmd`
- Rust/Cargo deben instalarse con `rustup`
- el repo necesita `src-tauri/icons/icon.ico` para que `tauri:dev` compile en
  Windows

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

## Build y rolldown: causa del fallo anterior

El error de build con `rolldown` no venia de la app, sino de un entorno mixto:

- el proyecto se ejecutaba desde WSL
- pero `npm`/`node` venian de Windows
- `rolldown` acababa buscando el binding `win32` sobre una instalacion
  preparada para Linux o usando `cmd.exe` sobre una ruta UNC

Flujo validado ahora:

```bash
cd "/home/tomas/USAL LINUX/activityUI"
source scripts/use-local-node-wsl.sh
npm install
npm run lint
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

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
