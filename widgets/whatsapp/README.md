# Widget de WhatsApp

Esta carpeta está reservada para los archivos del widget de WhatsApp que entregue el proveedor. Conserva aquí sus archivos locales y su estructura original. Si el proveedor utiliza una URL externa, documenta esa URL en este archivo y no copies recursos innecesarios.

Antes de integrarlo, aplica los requisitos visuales, responsive y de accesibilidad de `../README.md`.

## Puntos de integración

- Contenedor de montaje: `#whatsapp-widget-root`, al final de `index.html`.
- Activadores: todos los elementos con `data-widget-trigger="whatsapp"`.
- Activadores actuales: la tarjeta «WhatsApp» de la sección de ayuda y el botón flotante de WhatsApp.
- Alternativa provisional: diálogo `#contact-dialog`.

## Integración

1. Coloca en esta carpeta los archivos locales proporcionados para el widget.
2. Enlaza sus hojas de estilo desde `<head>` y sus scripts al final de `index.html`, junto a los comentarios de integración.
3. Inicializa el widget en `#whatsapp-widget-root` y conecta sus aperturas a `[data-widget-trigger="whatsapp"]` siguiendo la API del proveedor.
4. Confirma si el proveedor reemplaza el botón flotante o si debe abrirse desde el botón actual; evita mostrar dos botones flotantes a la vez.
5. Si abre un popup, su fondo debe cubrir todo el viewport. En escritorio, limita el contenido a 490 px; hasta 820 px, usa un panel de ancho completo con 24 px de padding interior.
6. Si el proveedor redirige directamente a WhatsApp y no muestra popup, conserva igualmente ambos activadores y comprueba el retorno correcto a la web.
7. Cuando el widget esté operativo, elimina `data-contact-dialog="contact-dialog"` de la tarjeta, sustituye la lógica provisional del botón flotante y retira únicamente `#contact-dialog` y su código asociado en `assets/js/site.js`.

No se incluye código de ejemplo porque la API y los archivos definitivos todavía no están disponibles.
