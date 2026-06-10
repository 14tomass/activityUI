# TAURI_SETUP

Guia practica para preparar y validar ActivityUI con Tauri en Windows nativo.

## Objetivo

Usar Windows nativo para:

- `npm run tauri:dev`
- `npm run tauri:build`
- generacion de instalador Windows

Seguir usando WSL para:

- desarrollo frontend web
- `npm run lint`
- `npm run build`
- pruebas web del MVP

## Ruta recomendada

No ejecutar Tauri desde rutas UNC como `\\wsl.localhost\...`.

Usar una ruta Windows normal, por ejemplo:

```text
C:\Users\<usuario>\Projects\activityUI
```

La validacion actual tambien funciona desde una ruta Windows normal dentro de
OneDrive:

```text
C:\Users\tomas\OneDrive\Documentos\activity\activityUI
```

## Prerrequisitos Windows

1. Node.js y npm instalados en Windows.
2. Rust y Cargo instalados con `rustup`.
3. MSVC disponible desde Visual Studio / Build Tools.
4. Microsoft Edge WebView2 Runtime instalado.
5. Acceso al repo desde ruta Windows normal.

## Comprobaciones rapidas

En PowerShell o CMD:

```powershell
node -v
npm.cmd -v
rustup -V
npm.cmd run tauri:info
```

Nota para PowerShell:

- si `npm -v` falla por politica de ejecucion de `npm.ps1`, usar `npm.cmd`
- alternativa temporal: abrir `cmd.exe` o usar una sesion con policy menos
  restrictiva

## Instalacion de Rust

Si `tauri:info` indica que faltan `rustc` o `cargo`, instalar Rust con
`rustup` para el target MSVC:

```powershell
Invoke-WebRequest https://win.rustup.rs/x86_64 -OutFile "$env:TEMP\rustup-init.exe"
& "$env:TEMP\rustup-init.exe" -y --default-toolchain stable-x86_64-pc-windows-msvc
```

Despues, abrir una shell nueva o anadir temporalmente:

```powershell
$env:PATH = "$env:USERPROFILE\.cargo\bin;$env:PATH"
```

## Flujo recomendado

```powershell
cd C:\ruta\al\repo
npm.cmd install
npm.cmd run lint
npm.cmd run build
npm.cmd run tauri:info
npm.cmd run tauri:dev
```

## Resultado validado en esta tarea

Entorno validado:

- Windows `10.0.26200`
- `node v24.15.0`
- `npm 11.12.1`
- `rustup 1.29.0`
- toolchain Rust estable MSVC instalada
- WebView2 `149.0.4022.52`
- MSVC detectado desde Visual Studio Community 2026

Comandos validados:

- `npm.cmd install` -> OK
- `npm.cmd run lint` -> OK
- `npm.cmd run build` -> OK
- `npm.cmd run tauri:info` -> OK
- `npm.cmd run tauri:dev` -> arranca Vite, compila Rust y levanta proceso
  `activityui`

## Error real detectado y corregido

Durante la primera validacion de `tauri:dev`, Tauri fallaba con:

```text
`icons/icon.ico` not found; required for generating a Windows Resource file during tauri-build
```

Se corrigio anadiendo un icono minimo en:

```text
src-tauri/icons/icon.ico
```

## Errores comunes

### `npm.ps1` bloqueado en PowerShell

Sintoma:

```text
No se puede cargar ...\npm.ps1 porque la ejecucion de scripts esta deshabilitada
```

Solucion rapida:

- usar `npm.cmd`
- o ejecutar los comandos desde `cmd.exe`

### `rustc` / `cargo` no encontrados

Sintoma:

- `tauri:info` marca Rust como no instalado

Solucion:

- instalar `rustup`
- abrir una shell nueva

### Ruta UNC / mezcla WSL-Windows

Sintoma:

- comandos Tauri o Vite ejecutados desde `\\wsl.localhost\...`
- fallos raros de toolchain o bundling

Solucion:

- mover o clonar el repo a una ruta Windows normal para Tauri

### Primer arranque lento de Tauri

Sintoma:

- `tauri:dev` tarda varios minutos la primera vez

Causa:

- descarga y compilacion inicial de crates de Rust

### Icono faltante en `src-tauri/icons`

Sintoma:

- fallo de `tauri-build` al generar recursos Windows

Solucion:

- mantener `src-tauri/icons/icon.ico` en el repo

## Que queda pendiente

- confirmacion visual manual del contenido exacto de la ventana Tauri en un
  escritorio interactivo
- validacion manual de `Semana`, `Dia`, `Mes` y `Configuracion` dentro de la
  ventana nativa
- validacion manual de placeholders/estado visual cuando ActivityWatch esta
  cerrado
- `npm run tauri:build` e instalador Windows reproducible
