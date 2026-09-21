# mascotas

Landing interactiva de Affinity Mascotas para calcular el precio de un seguro para perros y gatos.

La página está en `index.html`, los estilos en `assets/css/site.css` y las interacciones en `assets/js/site.js`. El diseño utiliza Arial, verde de marca y amarillo sobre fondos claros. La sección «Cómo funciona» comparte la alineación y la escala de títulos de la web, con la fotografía de fondo a toda altura y a la derecha en escritorio. En móvil, la fotografía se oculta y la sección utiliza un fondo crema uniforme. Debajo, la sección «Precios» presenta el seguro de responsabilidad civil y asistencia de Línea Directa de forma compacta: qué es y por qué es necesario en dos columnas, y las dos modalidades (Esencial y Completo) con selector Perros/Gatos, detalle desplegable y botones «Contratar» que enlazan a Línea Directa con el código de mediador. Solo muestra información dirigida al cliente final.

`guia-de-estilo.html`, enlazada desde el footer, documenta la paleta, tipografía, medidas, componentes, imágenes y puntos de cambio del diseño actual. Incluye una vista interactiva de `index.html` con selectores de sección y ancho, muestras de colores copiables y un diálogo de ejemplo que no envía datos.

Abre ambos archivos en el navegador o utiliza un servidor estático local. Mantén la guía junto a `index.html` para que funcionen la vista integrada y los enlaces relativos. Las imágenes de marca y mascotas requieren conexión con Affinity Soluciones.

La imagen de vista previa para compartir la web se guarda en `assets/social-preview.jpg`. Al desplegar el sitio, conserva `index.html`, `guia-de-estilo.html` y la carpeta `assets` completa. Actualiza los valores documentados en la guía cuando cambien los estilos de la web.

## Integración de widgets

Al final de `index.html` hay tres puntos de montaje no visibles: `#call-widget-root`, `#whatsapp-widget-root` y `#chat-widget-root`. Los activadores se identifican con `data-widget-trigger`. Los diálogos actuales actúan como alternativas provisionales hasta recibir e integrar los widgets externos.

Los requisitos comunes de diseño, popup responsive y accesibilidad están en `widgets/README.md`. Las instrucciones específicas están en `widgets/call/README.md`, `widgets/whatsapp/README.md` y `widgets/chat/README.md`.
