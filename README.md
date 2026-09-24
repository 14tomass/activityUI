# Activity UI

<div align="center">

[![Release](https://img.shields.io/badge/release-v0.1.0-blue.svg?style=flat-square)](https://github.com/TomasCaceresIO/activityUI/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/platform-Windows%20x64-0078D6.svg?style=flat-square&logo=windows&logoColor=white)]()
[![Web](https://img.shields.io/badge/website-GitHub%20Pages-24292e.svg?style=flat-square&logo=github)](https://TomasCaceresIO.github.io/activityUI/)

**Interfaz de escritorio moderna, visual y privada para ActivityWatch.**

[Sitio Web Oficial](https://TomasCaceresIO.github.io/activityUI/) • [Descargar Releases](https://github.com/TomasCaceresIO/activityUI/releases) • [Guía de Inicio Rápido](docs/GETTING_STARTED.md) • [Documentación](docs/)

</div>

---

## 📌 ¿Qué es Activity UI?

**Activity UI** es una aplicación de escritorio nativa diseñada como una interfaz moderna, limpia e intuitiva para consultar y analizar tus métricas locales registradas por [ActivityWatch](https://activitywatch.net/).

A diferencia de los paneles tradicionales, Activity UI se centra en ofrecer:
- **Resumen temporal multinivel**: vistas agregadas por **Semana** (lunes a domingo), **Día** (con desglose 24h) y **Mes**.
- **Categorización inteligente y personalizable**: clasifica el tiempo en categorías base (*Estudio*, *Entretenimiento*, *Productividad*, *Otros*) o crea tus propias categorías con reglas personalizadas por aplicación (`.exe`) o dominio web.
- **Sin doble conteo**: lógica canónica con intersección temporal estricta para evitar duplicidades entre ventanas activas, eventos web y estado AFK.
- **Desglose en profundidad**: inspección por franjas horarias y detalle analítico por aplicación y sitio web.
- **Privacidad total por diseño**: funciona al 100% en tu ordenador. No envía telemetría ni datos a servidores externos, ni almacena tus actividades en la nube.

---

## ⚠️ Requisito previo fundamental: ActivityWatch

> [!IMPORTANT]
> **Activity UI no sustituye ni recopila datos por sí misma.**
> Es un cliente visual que consume la API REST local de **ActivityWatch**. Para que Activity UI pueda mostrar información de tu actividad, **ActivityWatch debe estar instalado y en ejecución en tu equipo**.

1. Asegúrate de tener instalado [ActivityWatch](https://activitywatch.net/downloads/).
2. Comprueba que el servicio local (`aw-server`) está activo en su puerto predeterminado:
   ```text
   http://localhost:5600
   ```
3. Puedes verificar rápidamente que la API responde abriendo en tu navegador:
   ```text
   http://localhost:5600/api/0/info
   ```
   *(Debería responder un JSON con la versión y el nombre de tu equipo).*

Si ActivityWatch no está iniciado al abrir Activity UI, la aplicación mostrará estados neutros informativos (`-`) sin bloquearse ni cerrarse. Al arrancar ActivityWatch, tus datos se sincronizarán al navegar o recargar.

---

## 🚀 Descarga e Instalación (v0.1.0 para Windows)

Las versiones oficiales compiladas para Windows x64 están disponibles en la sección de [Releases de GitHub](https://github.com/TomasCaceresIO/activityUI/releases).

Dispones de dos modalidades de descarga según tus preferencias:

### 1. Instalador Asistido (`Setup .exe`) — Recomendado
- **Archivo**: `ActivityUI_v0.1.0_x64-setup.exe`
- **Características**:
  - Instalador guiado basado en NSIS configurado en modo usuario (`currentUser`).
  - **No requiere permisos de administrador**.
  - Crea accesos directos en el Menú Inicio y en el Escritorio.
  - Ofrece desinstalación limpia y automática desde *Configuración de Windows > Aplicaciones*.
- **Uso**: Descarga el archivo, ejecútalo y sigue las instrucciones del asistente en pantalla.

### 2. Versión Portable (`.zip`)
- **Archivo**: `ActivityUI_v0.1.0_windows_x64_portable.zip`
- **Características**:
  - Sin asistente ni modificaciones en el registro de Windows.
  - Ideal para probar la aplicación rápidamente o llevarla en una unidad USB.
- **Uso**: Descarga el archivo `.zip`, descomprímelo en la carpeta que prefieras y ejecuta directamente `ActivityUI.exe`.

> [!TIP]
> **¿Aparece el aviso de Microsoft Defender SmartScreen?**
> Al tratarse de un proyecto de código abierto reciente sin certificado de firma comercial de pago, Windows puede mostrar la pantalla azul informativa *"Windows protegió su PC"*.
> Solo tienes que hacer clic en **"Más información"** y luego en **"Ejecutar de todas formas"**.
> 
> Consulta los pasos detallados e imágenes en nuestra [Guía de Inicio (docs/GETTING_STARTED.md)](docs/GETTING_STARTED.md).

---

## 🌐 Sitio Web y Demo

Visita la web oficial del proyecto en GitHub Pages para conocer las características visuales y novedades:
👉 **[https://TomasCaceresIO.github.io/activityUI/](https://TomasCaceresIO.github.io/activityUI/)**

---

## 🛠️ Stack Tecnológico

- **Frontend Core**: [React 19](https://react.dev/) + JavaScript.
- **Bundler & Tooling**: [Vite 8](https://vite.dev/).
- **Estilos**: [Tailwind CSS v4](https://tailwindcss.com/).
- **Desktop Shell**: [Tauri v2](https://v2.tauri.app/) con motor nativo Microsoft Edge WebView2 (consumo ultraligero de memoria).
- **Integración API**: REST Client contra `aw-server` (`localhost:5600/api/0`).

---

## 💻 Desarrollo Local

Si deseas contribuir al desarrollo o compilar el proyecto por tu cuenta, sigue estas instrucciones:

### Prerrequisitos de Desarrollo
- Node.js (v20 o superior recomendado).
- Git.
- Para compilar el binario de escritorio (Tauri):
  - Rust y Cargo (instalados mediante `rustup`).
  - Build Tools de C++ (Visual Studio MSVC en Windows).
  - WebView2 Runtime.
  - Consulta [docs/TAURI_SETUP.md](docs/TAURI_SETUP.md) para la configuración paso a paso de Tauri en Windows.

### Entorno recomendado para desarrollo web (WSL / Ubuntu)
El desarrollo y validación web del frontend se realiza preferentemente desde WSL/Linux:

```bash
# 1. Clonar el repositorio
git clone https://github.com/TomasCaceresIO/activityUI.git
cd activityUI

# 2. Activar Node local del entorno WSL (si aplica)
source scripts/use-local-node-wsl.sh

# 3. Instalar dependencias
npm install

# 4. Iniciar servidor de desarrollo web
npm run dev
```

Abre en tu navegador `http://127.0.0.1:5173`.

### Configuración de CORS en ActivityWatch (Solo para desarrollo web)
Cuando ejecutas el frontend web en `http://127.0.0.1:5173`, el servidor `aw-server` debe autorizar dicho origen.

Edita el archivo `aw-server.toml` (en Windows: `%LOCALAPPDATA%\activitywatch\activitywatch\aw-server\aw-server.toml`):
```toml
[server]
cors_origins = "http://127.0.0.1:5173"
```
*Nota: La versión de escritorio Tauri no requiere configurar CORS gracias a sus políticas de seguridad locales (CSP).*

### Scripts Disponibles

| Script | Descripción |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo web en `http://127.0.0.1:5173` |
| `npm run build` | Genera el bundle web optimizado de producción en `dist/` |
| `npm run lint` | Ejecuta ESLint sobre el código fuente |
| `npm run validate` | Ejecuta comprobación combinada de linting y build |
| `npm run preview` | Sirve localmente los archivos compilados de `dist/` |
| `npm run tauri:dev` | Arranca la aplicación de escritorio Tauri en modo desarrollo |
| `npm run tauri:build` | Compila el ejecutable nativo e instalador de escritorio |
| `npm run tauri:info` | Muestra diagnóstico del entorno y dependencias de Tauri |
| `npm run check:activitywatch-buckets` | Valida el descubrimiento de buckets locales en terminal |

---

## 📂 Estructura del Repositorio

```text
activityUI/
├── .github/workflows/       # Pipelines CI/CD (Release automática de Windows)
├── docs/                    # Documentación técnica y de usuario
│   ├── GETTING_STARTED.md   # Guía paso a paso de bienvenida y resolución de problemas
│   ├── TAURI_SETUP.md       # Configuración y requisitos de compilación nativa en Windows
│   └── ACTIVITYWATCH_DATA_MAPPING.md # Mapeo técnico de buckets y queries canónicas
├── public/                  # Assets estáticos y favicon
├── scripts/                 # Utilidades de entorno y comprobación
├── src/                     # Código fuente de la interfaz React
│   ├── app/                 # Configuración principal y enrutado de la app
│   ├── components/          # Componentes visuales genéricos y layout
│   ├── features/dashboard/  # Vistas del dashboard, tarjetas, modales y lógica de estado
│   ├── lib/api/             # Capa de integración con la API REST de ActivityWatch
│   └── mocks/               # Datos simulados para desarrollo aislado
├── src-tauri/               # Shell nativa de Tauri v2 (Rust, CSP, iconos y configuración de bundle)
├── QA_CHECKLIST.md          # Protocolo de pruebas manuales y checklist de calidad
└── README.md                # Presentación general del proyecto
```

---

## 📚 Documentación Adicional

- [Guía de Inicio y Preguntas Frecuentes](docs/GETTING_STARTED.md)
- [Protocolo de QA y Verificación Manual](QA_CHECKLIST.md)
- [Configuración de Entorno Tauri en Windows](docs/TAURI_SETUP.md)
- [Mapeo de Datos de ActivityWatch](docs/ACTIVITYWATCH_DATA_MAPPING.md)
- [Plan de Lanzamiento de Escritorio](RELEASE_DESKTOP_PLAN.md)

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo de licencia para más información. ActivityWatch es un proyecto independiente desarrollado por la comunidad de ActivityWatch bajo licencia MPL-2.0.
