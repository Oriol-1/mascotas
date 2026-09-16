# Widget de chat

Esta carpeta está reservada para los archivos del widget de chat que entregue el proveedor. Conserva aquí sus archivos locales y su estructura original. Si el proveedor utiliza una URL externa, documenta esa URL en este archivo y no copies recursos innecesarios.

Antes de integrarlo, aplica los requisitos visuales, responsive y de accesibilidad de `../README.md`.

## Puntos de integración

- Contenedor de montaje: `#chat-widget-root`, al final de `index.html`.
- Activadores: todos los elementos con `data-widget-trigger="chat"`.
- Activadores actuales: «Chatea para calcular tu precio» en el hero y la tarjeta «Chat» de la sección de ayuda.
- Alternativa provisional: diálogo `#chat-help-dialog`.

## Integración

1. Coloca en esta carpeta los archivos locales proporcionados para el widget.
2. Enlaza sus hojas de estilo desde `<head>` y sus scripts al final de `index.html`, junto a los comentarios de integración.
3. Inicializa el widget en `#chat-widget-root` y conecta sus aperturas a `[data-widget-trigger="chat"]` siguiendo la API del proveedor.
4. Haz que la capa del chat cubra todo el viewport. En escritorio, limita el panel inicial a 490 px; hasta 820 px, el chat ocupa el ancho completo y puede usar toda la altura dinámica disponible.
5. Mantén siempre visibles la cabecera del chat, el botón de cierre, el historial desplazable y el campo de escritura, también cuando aparece el teclado virtual.
6. Comprueba que mensajes largos, adjuntos y estados de escritura no produzcan scroll horizontal.
7. Cuando el widget esté operativo, elimina `data-contact-dialog="chat-help-dialog"` de sus activadores, retira únicamente `#chat-help-dialog` y elimina su apertura provisional de `assets/js/site.js`.

No se incluye código de ejemplo porque la API y los archivos definitivos todavía no están disponibles.
