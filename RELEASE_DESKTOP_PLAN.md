# RELEASE_DESKTOP_PLAN

## Resumen ejecutivo

ActivityUI ya tiene un MVP local estable como frontend React/Vite que consume
la API local de ActivityWatch en `http://localhost:5600/api/0`.

La recomendacion para la primera version instalable es:

- usar **Tauri** como camino principal de empaquetado
- mantener **ActivityWatch separado** en `v0.1`
- distribuir primero por **GitHub Releases**
- dejar **Microsoft Store** y cualquier integracion profunda con
  ActivityWatch para mas adelante

La app de escritorio debe centrarse en empaquetar la UI actual, detectar si
ActivityWatch no esta disponible y guiar al usuario con instrucciones claras,
sin intentar instalar servicios ni modificar el sistema.

## Estado actual del MVP

- `npm install`: OK en entorno WSL recomendado
- `npm run lint`: OK
- `npm run build`: OK
- `npm run preview`: OK
- `Semana`, `Dia` y `Mes` funcionan correctamente
- `Configuracion` funciona correctamente
- categorias dinamicas validadas
- creacion, edicion y eliminacion de categorias validadas
- ActivityWatch sigue siendo dependencia local en `localhost:5600`
- no hay backend propio
- el proyecto esta listo para planificar shell de escritorio

## Comparativa de opciones

### Opcion A: Web publica / PWA

**Ventajas**

- reutiliza al maximo el frontend existente
- instalacion ligera o incluso sin instalacion
- una sola base de codigo web

**Desventajas**

- el producto depende de un servicio local (`ActivityWatch`) en
  `localhost:5600`
- la experiencia de instalacion no queda tan clara como una app de escritorio
- hay mas friccion para explicar permisos, CORS y dependencia local
- no resuelve bien el objetivo principal de distribuir una app local para
  Windows

**Conclusión**

Como soporte secundario o demo puede ser valido, pero no parece la opcion ideal
como formato principal del producto porque ActivityUI no es una app web
independiente: depende de un servicio local ya instalado por el usuario.

### Opcion B: Tauri

**Ventajas**

- encaja muy bien con el frontend actual de React/Vite
- permite reutilizar la UI existente sin redisenar la app
- genera app de escritorio e instaladores Windows
- es mas ligero que Electron al apoyarse en WebView2
- deja la puerta abierta a mejoras futuras de shell de escritorio sin cambiar
  el MVP funcional

**Desventajas**

- introduce toolchain adicional
- para Windows requiere preparar entorno nativo de build
- hay que validar con cuidado acceso a `localhost:5600`, CSP y UX cuando
  ActivityWatch no responde
- en Windows sin firma de codigo puede aparecer aviso de SmartScreen

**Requisitos**

- Node.js y npm para el frontend
- Rust toolchain
- en Windows: Microsoft C++ Build Tools
- en Windows: Microsoft Edge WebView2 Runtime

**Encaje con ActivityUI**

Es la mejor opcion para `v0.1` porque empaqueta la app actual sin obligar a
replantear arquitectura, backend o modelo de datos.

### Opcion C: Electron

**Ventajas**

- ecosistema maduro
- mucha documentacion y ejemplos
- menos dependencia del WebView del sistema porque embebe Chromium

**Desventajas**

- binarios y consumo mas pesados
- mayor huella de distribucion para un producto local relativamente simple
- introduce una base desktop mas grande de la necesaria para este MVP

**Cuándo tendria sentido**

Solo tendria sentido elegir Electron si Tauri bloquea de forma real algun punto
critico del producto, por ejemplo el acceso estable a `localhost`, el bundling
Windows o algun requisito de integracion de sistema que resulte inviable o muy
costoso en Tauri.

### Opcion D: Microsoft Store

**Ventajas**

- canal de distribucion mas formal
- visibilidad y flujo de instalacion mas familiar para usuarios Windows
- opcion futura si se quiere profesionalizar la distribucion

**Desventajas**

- requiere cuenta y proceso de publicacion/certificacion
- complica la primera salida a usuarios
- anade trabajo extra de packaging, politicas y mantenimiento
- no aporta valor suficiente en la primera iteracion frente a GitHub Releases

**Conclusión**

No conviene como primera distribucion. Tiene sentido dejarlo como opcion
futura, cuando el instalador de escritorio ya este estabilizado y el flujo con
ActivityWatch este mejor pulido.

## Decision recomendada

Se recomienda confirmar esta estrategia:

1. **Tauri como camino principal**.
2. **Electron solo como plan B** si aparece un bloqueo real.
3. **GitHub Releases** como primer canal de distribucion.
4. **Sin Microsoft Store en `v0.1`**.
5. **Sin integrar ActivityWatch dentro del instalador en `v0.1`**.

### Ajuste importante a la estrategia inicial

Se mantiene **WSL/Ubuntu como entorno recomendado para desarrollo del
frontend**, pero la recomendacion para **generar el instalador Windows de
Tauri** es hacerlo en **Windows nativo** con la toolchain de Windows
preparada.

Esto no contradice el flujo actual del proyecto:

- desarrollo diario del frontend: WSL
- build web del MVP: WSL
- build de instalador Windows con Tauri: Windows nativo recomendado

Esta recomendacion es una inferencia tecnica basada en los requisitos oficiales
de Tauri para Windows.

## Alcance de la version instalable `v0.1`

### Incluye

- app de escritorio ActivityUI
- instalador Windows descargable
- `Semana` como vista inicial
- `Dia`
- `Mes` simple
- `Configuracion`
- categorias dinamicas
- crear, editar y eliminar categorias
- reglas por dominio y por `.exe`
- persistencia local
- mensaje claro si ActivityWatch no esta abierto o no responde
- documentacion de instalacion

### No incluye

- Microsoft Store
- auto-updater
- firma de codigo
- instalador conjunto con ActivityWatch
- sincronizacion
- backend
- cuenta de usuario
- multi-dispositivo
- export/import de configuracion
- renombrar categorias
- personalizar colores
- empaquetado macOS/Linux
- integracion avanzada con servicios del sistema

## Estrategia con ActivityWatch

### `v0.1`

ActivityUI y ActivityWatch se distribuyen por separado.

El usuario instala:

1. ActivityWatch desde su fuente oficial.
2. ActivityUI desde nuestro instalador.

ActivityUI debe:

- intentar conectar con `http://localhost:5600/api/0`
- detectar si ActivityWatch no esta disponible
- mostrar un mensaje claro y discreto
- explicar que ActivityWatch debe estar abierto y disponible en `localhost:5600`

ActivityUI no debe en `v0.1`:

- instalar ActivityWatch
- empaquetar binarios de ActivityWatch
- modificar servicios del sistema
- tocar configuracion avanzada del usuario

### Futuro posible

- detectar si ActivityWatch esta instalado
- abrir ActivityWatch si ya existe en el sistema
- ayudar con configuracion de CORS si hace falta
- estudiar instalador conjunto
- estudiar integracion mas profunda

## Estrategia de distribucion

### `v0.1`

- distribuir por GitHub Releases
- adjuntar instalador Windows
- mantener `README.md`, `DEMO_LOCAL.md` y `SMOKE_TEST.md`
- documentar con claridad que ActivityWatch se instala aparte

### Fase posterior

- crear landing sencilla con descripcion, capturas, descarga y guia de
  instalacion
- mantener enlace visible a ActivityWatch oficial

### Microsoft Store

Queda explicitamente fuera de la primera salida.

## Requisitos tecnicos para Tauri

### Base del proyecto

- frontend React/Vite ya validado
- build web del MVP ya resuelto en WSL
- scripts actuales de desarrollo/build ya estabilizados

### Toolchain esperada

- Node.js y npm
- Rust toolchain
- Tauri CLI y configuracion `src-tauri/`
- en Windows: Microsoft C++ Build Tools
- en Windows: WebView2 Runtime

### Entornos recomendados

**Desarrollo frontend**

- WSL/Ubuntu
- ruta Linux real del proyecto:
  - `/home/tomas/USAL LINUX/activityUI`

**Build del instalador Windows**

- Windows nativo
- evitar PowerShell/UNC mezclados con `node_modules` de WSL
- preparar Rust + MSVC + WebView2 antes de intentar bundling

### Puntos a validar en `TAURI-MVP-01`

- arranque de la shell Tauri sobre el frontend actual
- configuracion correcta de `devUrl` y build frontend
- carga de la app sin romper la UI validada
- permisos/CSP para consultar `localhost:5600`
- gestion clara del estado "ActivityWatch no disponible"

## Riesgos principales

1. Instalar ActivityWatch por separado genera friccion inicial.
2. CORS o conectividad a `localhost:5600` pueden fallar segun entorno.
3. Tauri exige toolchain adicional para Windows.
4. SmartScreen puede mostrar aviso mientras no haya firma de codigo.
5. Microsoft Store anadiria trabajo de publicacion y certificacion demasiado
   pronto.
6. Integrar ActivityWatch en un instalador unico requerira revisar licencias,
   actualizaciones y conflictos con instalaciones existentes.
7. El build debe hacerse en el entorno correcto y bien documentado para evitar
   repetir problemas de mezcla WSL/Windows.

## Roadmap recomendado

### Etapa actual

- `RELEASE-DESKTOP-PLAN-01`
  - documentar la estrategia y cerrar la decision principal

### Siguiente bloque

- `TAURI-MVP-01`
  - crear shell minima Tauri sin tocar la logica funcional del dashboard
- `TAURI-ACTIVITYWATCH-CHECK-01`
  - validar conectividad real a `localhost:5600` desde la app Tauri y cerrar UX
    de no disponible
- `RELEASE-WINDOWS-INSTALLER-01`
  - generar primer instalador Windows reproducible
- `GITHUB-RELEASE-01`
  - preparar primer release descargable desde GitHub Releases
- `LANDING-01`
  - pagina simple con descripcion, capturas y enlaces de descarga

### Futuro

- integracion mas profunda con ActivityWatch
- instalador conjunto
- Microsoft Store
- auto-updates
- firma de codigo

## Fuentes oficiales consultadas

- Tauri prerequisites:
  - https://v2.tauri.app/start/prerequisites/
- Tauri Windows Installer:
  - https://v2.tauri.app/distribute/windows-installer/
- Tauri Microsoft Store:
  - https://v2.tauri.app/distribute/microsoft-store/
- Electron docs:
  - https://www.electronjs.org/docs/latest/
- Microsoft Store publishing:
  - https://learn.microsoft.com/en-us/windows/apps/publish/
- MDN Progressive Web Apps:
  - https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps
