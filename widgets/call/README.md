# Widget de llamada

Esta carpeta está reservada para los archivos del widget de llamada que entregue el proveedor. Conserva aquí sus archivos locales y su estructura original. Si el proveedor utiliza una URL externa, documenta esa URL en este archivo y no copies recursos innecesarios.

Antes de integrarlo, aplica los requisitos visuales, responsive y de accesibilidad de `../README.md`.

## Puntos de integración

- Contenedor de montaje: `#call-widget-root`, al final de `index.html`.
- Activadores: todos los elementos con `data-widget-trigger="call"`.
- Activadores actuales: el botón «Te llamamos» del hero y la tarjeta «Te llamamos» de la sección de ayuda.
- Alternativa provisional: diálogo `#call-dialog` y formulario `#callback-form`.

## Integración

1. Coloca en esta carpeta los archivos locales proporcionados para el widget.
2. Enlaza sus hojas de estilo desde `<head>` y sus scripts al final de `index.html`, junto a los comentarios de integración.
3. Inicializa el widget en `#call-widget-root` y conecta sus aperturas a `[data-widget-trigger="call"]` siguiendo la API del proveedor.
4. Haz que la capa de llamada cubra todo el viewport. En escritorio, limita el formulario a 490 px; hasta 820 px, muestra el panel a ancho completo y deja 24 px de padding para los campos.
5. Comprueba que nombre, teléfono, mensajes y botón no desborden a 320 px, y que el teclado virtual no oculte la acción principal.
6. Conserva las etiquetas visibles, validación junto al campo, `aria-invalid` y mensajes de estado anunciables.
7. Cuando el widget esté operativo, elimina `data-contact-dialog="call-dialog"` de sus activadores, retira únicamente `#call-dialog` y elimina la lógica asociada a `#callback-form` en `assets/js/site.js`. No retires la alternativa antes de validar el widget.

No se incluye código de ejemplo porque la API y los archivos definitivos todavía no están disponibles.
