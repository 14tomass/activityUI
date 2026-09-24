# Guía de Inicio Rápido — Activity UI

Bienvenido a **Activity UI**, una interfaz de escritorio moderna, visual y privada diseñada para consultar tus estadísticas de uso de tiempo recopiladas por [ActivityWatch](https://activitywatch.net/).

Esta guía te acompañará paso a paso desde la descarga e instalación hasta la configuración de tus categorías y la resolución de dudas o incidencias frecuentes.

---

## 📋 1. Antes de empezar: Prerrequisitos

Para utilizar Activity UI necesitas dos elementos en tu ordenador:

### A. ActivityWatch en ejecución (Imprescindible)
Activity UI no recopila datos por sí misma; actúa como un visualizador para el motor de telemetría local de **ActivityWatch**.
1. Si aún no tienes ActivityWatch instalado, descárgalo gratis desde su web oficial:
   👉 **[https://activitywatch.net/downloads/](https://activitywatch.net/downloads/)**
2. Inicia ActivityWatch. Verás su icono en la bandeja del sistema de Windows (junto al reloj).
3. Asegúrate de que el servidor local está activo en:
   ```text
   http://localhost:5600
   ```
   *(Puedes comprobarlo abriendo `http://localhost:5600/api/0/info` en tu navegador habitual; debe devolver un texto con la versión).*

### B. Sistema Operativo Windows
- Compatible con **Windows 10 y Windows 11 (64 bits)**.
- Requiere **Microsoft Edge WebView2 Runtime** (viene preinstalado de serie en Windows 10/11; si usas una edición especial donde se haya desinstalado, Windows te ofrecerá descargarlo automáticamente o puedes obtenerlo desde la web de Microsoft).

---

## 💾 2. Descarga e Instalación

Dirígete a la página de **[Releases oficiales en GitHub](https://github.com/14tomass/activityUI/releases)** y elige el método que mejor se adapte a tus necesidades:

```
├── Opción A: ActivityUI_v0.1.0_x64-setup.exe         (Instalador recomendado)
└── Opción B: ActivityUI_v0.1.0_windows_x64_portable.zip  (Versión portable sin instalación)
```

### Opción A: Instalador Asistido (`.exe`) — Recomendado
1. Descarga el archivo ejecutable `ActivityUI_v0.1.0_x64-setup.exe`.
2. Haz doble clic sobre el archivo descargado.
3. Si aparece la ventana de advertencia de SmartScreen, consulta la sección [Aviso de Microsoft Defender SmartScreen](#-3-aviso-de-microsoft-defender-smartscreen-en-windows) más abajo.
4. El asistente instalará la aplicación en tu perfil de usuario (`AppData\Local\Programs\ActivityUI`) sin solicitar permisos de administrador.
5. Al finalizar, encontrarás Activity UI en tu **Menú Inicio** y con un acceso directo en tu **Escritorio**.

### Opción B: Versión Portable (`.zip`)
1. Descarga el archivo comprimido `ActivityUI_v0.1.0_windows_x64_portable.zip`.
2. Haz clic derecho sobre el archivo `.zip` y selecciona **Extraer todo...**.
3. Elige la carpeta donde desees guardar la aplicación (por ejemplo, en tus Documentos o en un pendrive USB).
4. Entra en la carpeta extraída y haz doble clic directamente en `ActivityUI.exe`.

---

## 🛡️ 3. Aviso de Microsoft Defender SmartScreen en Windows

Al abrir por primera vez el instalador o el ejecutable portable, es muy probable que Windows muestre la siguiente advertencia:

> **Windows protegió su PC**  
> *Microsoft Defender SmartScreen impidió el inicio de una aplicación no reconocida. Si ejecuta esta aplicación, podría poner en riesgo el equipo.*

### ¿Por qué aparece este aviso?
**Activity UI es un software 100% de código abierto, seguro y transparente.**  
Esta pantalla no significa que la aplicación contenga virus o malware. Aparece de forma automática en Windows para cualquier programa nuevo que no disponga de un certificado de firma digital corporativo (cuyo coste comercial ronda los cientos o miles de dólares anuales) y que aún esté acumulando reputación en los servidores de Microsoft.

### Cómo continuar de forma segura:
1. En la ventana azul de SmartScreen, haz clic en el texto subrayado **"Más información"** (*More info*).
2. La ventana se expandirá mostrando el nombre de la aplicación (`ActivityUI.exe`) y aparecerá un nuevo botón abajo a la derecha: **"Ejecutar de todas formas"** (*Run anyway*).
3. Haz clic en **"Ejecutar de todas formas"**.
4. ¡Listo! La aplicación o instalador se iniciará con total normalidad y Windows recordará tu elección para futuras ejecuciones.

---

## 🎯 4. Primeros pasos con la aplicación

Una vez abierta la aplicación con ActivityWatch en marcha, la interfaz se sincronizará automáticamente:

### Vista "Semana" (Vista Principal)
- Muestra el tiempo acumulado de la semana en curso (de lunes a domingo) y la **Media diaria**.
- En el gráfico central verás 7 barras correspondientes a cada día de la semana.
- **Interacción por día**: Haz clic en cualquier barra de un día transcurrido. La tarjeta inferior de categorías se filtrará inmediatamente para mostrarte en qué invertiste el tiempo en ese día concreto, sin abandonar la vista semanal. Si haces clic de nuevo en el mismo día, volverás a ver el resumen acumulado de toda la semana.

### Vista "Día"
- Te ofrece una radiografía precisa de las **24 horas del día** (00:00 a 23:00).
- Cada barra representa el volumen de tiempo activo en esa franja horaria.
- **Detalle horario por clic**: Haz clic sobre cualquier barra horaria con uso para abrir una ventana emergente que desglosa exactamente qué aplicaciones y páginas web utilizaste durante esa hora en específico.

### Vista "Mes"
- Te proporciona una perspectiva macro de tu actividad a lo largo de las semanas (`S1`, `S2`, `S3`, `S4`) que componen el mes seleccionado.

### Navegación en el tiempo
- Usa las **flechas izquierda (←) y derecha (→)** situadas junto al rango de fechas para retroceder en el tiempo:
  - En *Día*: hasta 15 días atrás.
  - En *Semana*: hasta 5 semanas atrás.
  - En *Mes*: hasta 3 meses atrás.
- La navegación hacia el futuro está bloqueada de forma natural al alcanzar el día actual.

---

## ⚙️ 5. Personalización de Categorías y Reglas

Activity UI clasifica tu actividad sin doble conteo según las siguientes prioridades: **Dominio web activo** → **Aplicación en primer plano** → **Otros**.

Para personalizar o añadir nuevas categorías:
1. Haz clic en el **botón circular de Configuración** (icono de engranaje) situado en la esquina superior derecha.
2. Se desplegará el panel lateral de configuración.
3. Para crear una nueva categoría:
   - Pulsa **"Crear nueva categoría"**.
   - Escribe un nombre identificativo (ej. *Diseño*, *Gaming*, *Programación*) y pulsa Guardar.
4. Para editar las reglas de una categoría:
   - Haz clic sobre la categoría deseada en la lista.
   - En el campo de texto, introduce una regla y pulsa **Guardar cambios**:
     - **Sitios web**: introduce el dominio (ej. `github.com`, `youtube.com`, `stackoverflow.com`).
     - **Aplicaciones**: introduce el nombre del ejecutable o programa (ej. `code.exe`, `photoshop.exe`, `spotify.exe`).
   - Puedes eliminar reglas existentes pulsando en el icono de papelera junto a cada una.
   - *Nota*: Las reglas son exclusivas. Si asignas una regla a una categoría que ya existía en otra, se moverá automáticamente a la nueva.

---

## ❓ 6. Preguntas e Incidencias Frecuentes (FAQ)

### 1. La aplicación muestra guiones (`-`) o todo en 0h 0m
- **Causa**: ActivityWatch no está abierto en segundo plano o se acaba de instalar y aún no tiene registros de actividad.
- **Solución**:
  1. Comprueba que el icono de ActivityWatch está en la bandeja del sistema.
  2. Abre `http://localhost:5600` en tu navegador web para confirmar que la interfaz oficial de ActivityWatch funciona.
  3. Utiliza tu ordenador unos minutos para que se generen los primeros eventos y vuelve a Activity UI.

### 2. Solo veo aplicaciones (ej. `chrome.exe`), pero no los nombres de las páginas web
- **Causa**: No tienes instalada la extensión de navegador de ActivityWatch.
- **Solución**: ActivityWatch necesita una extensión ligera para registrar los títulos y dominios web. Instálala desde la tienda de complementos de tu navegador habitual:
  - [aw-watcher-web para Chrome / Edge / Brave](https://chromewebstore.google.com/detail/activitywatch-web-watcher/nglaklhklhcoackbeahamapaocmkdhog)
  - [aw-watcher-web para Firefox](https://addons.mozilla.org/es/firefox/addon/aw-watcher-web/)

### 3. ¿Dónde se guardan mis categorías y preferencias?
- Tus categorías y reglas personalizadas se guardan de forma local en el almacenamiento persistente (`localStorage`) de la shell de la aplicación en tu propio equipo. Si reinstalas la aplicación en el mismo usuario, tus preferencias se conservarán.

### 4. ¿Cómo desinstalar Activity UI?
- **Si usaste el Instalador**: Abre el menú *Inicio > Configuración > Aplicaciones > Aplicaciones instaladas*, busca **ActivityUI** y haz clic en *Desinstalar*. El asistente eliminará todos los archivos del programa de forma limpia.
- **Si usaste la versión Portable**: Simplemente borra la carpeta donde extrajiste los archivos. No deja restos en el registro ni en el sistema.

---

## 🔗 Enlaces y Recursos

- 🌐 [Sitio Web del Proyecto](https://14tomass.github.io/activityUI/)
- 📦 [Descargas en GitHub Releases](https://github.com/14tomass/activityUI/releases)
- 🐛 [Reportar un problema o sugerencia](https://github.com/14tomass/activityUI/issues)
- 📖 [Sitio Oficial de ActivityWatch](https://activitywatch.net/)
