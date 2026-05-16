# activityUI

Frontend independiente para visualizar de forma moderna los datos locales de
ActivityWatch. Esta aplicacion no sustituye a ActivityWatch: solo consumira su
API REST local y presentara los datos con una interfaz mas cuidada.

## Stack

- React
- JavaScript
- Vite
- Tailwind CSS

## Requisitos

- Node.js 24 o superior
- ActivityWatch ejecutandose en local cuando se implementen las consultas reales

## Entorno recomendado

- Este proyecto se esta desarrollando dentro de Ubuntu/WSL.
- Ejecuta los comandos `npm` desde la terminal de Ubuntu/WSL situada en la carpeta del proyecto.

## Desarrollo

Instalar dependencias:

```bash
npm install
```

Arrancar el servidor de desarrollo:

```bash
npm run dev
```

La aplicacion quedara disponible en la URL que muestre Vite, normalmente en:

```bash
http://127.0.0.1:5173
```

## Estructura inicial

```text
src/
  app/                # Punto de entrada de la aplicacion
  components/         # Componentes reutilizables
  features/           # Modulos por dominio
  lib/                # Utilidades y clientes compartidos
  pages/              # Paginas o pantallas principales
```

## Estado actual

- Proyecto inicializado y funcionando con React + Vite.
- Tailwind CSS configurado.
- Pagina inicial de comprobacion creada.
- Sin integracion real todavia con la API de ActivityWatch.
