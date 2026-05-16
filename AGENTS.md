# AGENTS

## Protocolo obligatorio para trabajar en este repositorio

Antes de realizar cualquier tarea en este repositorio, hay que leer y respetar
estos documentos:

- `PROJECT_RULES.md`
- `TASKS.md`
- `DECISIONS.md`
- `IMPLEMENTATION_REPORT.md`

## 1. Antes de implementar

- Leer los cuatro documentos anteriores.
- Resumir brevemente el estado actual del proyecto.
- Explicar que tarea se va a realizar.
- Indicar que archivos o carpetas se planea tocar.
- Senalar riesgos, ambiguedades o decisiones tecnicas relevantes si existen.

## 2. Durante la implementacion

- Hacer cambios pequenos, enfocados y faciles de revisar.
- No ampliar el alcance de la tarea por iniciativa propia.
- No anadir librerias nuevas sin justificarlo expresamente.
- No conectar ActivityWatch ni tocar su configuracion salvo que la tarea lo pida.

## 3. Al finalizar

- Resumir que se ha cambiado.
- Explicar como probarlo manualmente.
- Ejecutar los comandos de verificacion relevantes si procede.
- Actualizar `IMPLEMENTATION_REPORT.md`.
- Actualizar `TASKS.md` si la tarea avanza el roadmap.
- Actualizar `DECISIONS.md` solo si se toma una decision tecnica nueva.

## 4. Comandos de verificacion actuales

- `npm run build`
- `npm run lint`
- `npm run dev`, si hace falta comprobar la vista en local.

## 5. Principios del proyecto

- React + JavaScript + Vite + Tailwind CSS.
- Frontend independiente para visualizar datos locales de ActivityWatch.
- Privacidad por defecto.
- Sin backend propio en el MVP.
- Primero UI con datos mock; despues integracion con ActivityWatch.
