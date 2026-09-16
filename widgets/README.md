# Guía común para integrar widgets

Esta guía complementa `../guia-de-estilo.html` sin modificarla. Se aplica a los widgets de llamada, WhatsApp y chat. Cada carpeta contiene además las instrucciones y los activadores propios de ese canal.

## Cómo leer la guía de estilo

`guia-de-estilo.html` es la referencia visual y funcional de la web. Antes de integrar un widget, revisa especialmente estas secciones:

- **Fundamentos:** usa Arial, los colores existentes y el mismo ritmo de espacios. No introduzcas una segunda paleta.
- **Tarjetas y botones:** las acciones principales son verdes, con texto blanco, altura mínima de 52 px y foco visible.
- **Diálogos:** el contenido aparece sobre un fondo oscurecido; el panel usa fondo claro, radio de 24 px y 34 px de espacio interior. En móvil, el espacio interior baja a 24 px.
- **Diseño adaptable:** el cambio principal está en 820 px. También hay que comprobar 320, 390, 820, 1100, 1440 y 1920 px.
- **Contenido y acceso:** el widget debe funcionar con teclado, anunciar errores y respetar `prefers-reduced-motion`.

### Tokens visuales que debe reutilizar el widget

| Uso | Valor actual |
| --- | --- |
| Texto principal | `#182720` (`--ink`) |
| Texto secundario | `#626960` (`--muted`) |
| Acción principal | `#234e3c` (`--brand`) |
| Acción al pasar el cursor | `#16392a` (`--brand-dark`) |
| Acento | `#ffbf57` (`--accent`) |
| Fondo del panel | `#fffefa` (`--paper`) |
| Borde | `#dedfd5` (`--line`) |
| Foco de teclado | `#a96908`, contorno de 3 px |
| Error | `#aa3026` |

Cuando el proveedor permita configurar variables, tema o estilos, utiliza estos valores. Si el widget se sirve dentro de un `iframe` de otro dominio, el CSS de la web no puede modificar su interior: los colores, la tipografía y los campos deben configurarse con las opciones que ofrezca el proveedor.

## Estructura del popup

El popup debe distinguir entre la **capa exterior** y el **panel de contenido**:

- La capa exterior cubre toda la pantalla con posición fija e inicio, derecha, abajo e izquierda a `0`.
- Debe medir el viewport completo: ancho `100%` y altura dinámica `100dvh`, con alternativa `100vh` si el proveedor la necesita.
- Debe quedar por encima de la cabecera fija, del botón de WhatsApp y del resto de la página. Utiliza una capa claramente superior al `z-index: 100` de la cabecera.
- El fondo oscurecido ocupa toda la capa y aplica el desenfoque visual de 5 px definido en la guía.
- El panel se centra en escritorio, mide como máximo 490 px y nunca supera el ancho disponible.
- El panel debe poder desplazarse verticalmente si su contenido es más alto que la pantalla. La página situada detrás no debe desplazarse mientras el popup esté abierto.

### Comportamiento en móvil

Hasta 820 px, el widget debe adaptarse al ancho completo de la pantalla:

- La capa exterior continúa cubriendo todo el viewport.
- El panel usa `width: 100%` y elimina cualquier ancho mínimo impuesto por el proveedor.
- Para que sea realmente de borde a borde, el panel no lleva margen lateral ni radio exterior. El contenido conserva 24 px de padding.
- La altura máxima se calcula con `100dvh`; si el contenido crece, se desplaza dentro del panel y no por detrás.
- Se respetan las áreas seguras del dispositivo con `env(safe-area-inset-top)`, `env(safe-area-inset-right)`, `env(safe-area-inset-bottom)` y `env(safe-area-inset-left)`.
- Inputs, botones e `iframe` usan `max-width: 100%` y `box-sizing: border-box` para evitar desplazamiento horizontal.
- Los botones principales pueden ocupar `width: 100%` para que sean fáciles de pulsar.

En escritorio no se debe estirar el formulario a 100% de una pantalla grande: el fondo cubre toda la ventana, pero el panel conserva el máximo de 490 px para mantener la legibilidad. En móvil sí se presenta como panel de ancho completo.

## Apertura, cierre y accesibilidad

1. El clic en un elemento `data-widget-trigger` abre un único widget. Nunca deben abrirse a la vez el widget nuevo y el diálogo provisional.
2. Al abrir, guarda el elemento que tenía el foco y mueve el foco al título, al primer campo o al botón de cierre del widget.
3. Mientras está abierto, el foco permanece dentro del popup y el contenido del fondo no se puede manipular.
4. El botón de cierre siempre está visible. La tecla Escape también cierra el popup, salvo que el proveedor justifique otro comportamiento.
5. Al cerrar, devuelve el foco al botón que abrió el widget y restaura el scroll de la página.
6. El popup expone un nombre accesible mediante su título y anuncia errores o estados de carga sin depender solo del color.
7. Las animaciones se eliminan o reducen cuando el usuario tiene activado `prefers-reduced-motion`.

## Orden de integración

1. Identifica si el proveedor entrega archivos locales, enlaces CDN, un `iframe`, un componente web o un script que crea su propia interfaz.
2. Guarda solo los archivos locales en la carpeta del widget correspondiente. No copies librerías ya servidas por el proveedor.
3. Añade los estilos en el comentario de integración del `<head>` de `index.html`.
4. Añade los scripts en el comentario situado antes de `assets/js/site.js`.
5. Inicializa el widget en su elemento `data-widget-mount` si la API permite elegir contenedor.
6. Conecta todos los activadores `data-widget-trigger` del canal.
7. Valida el widget manteniendo activo el diálogo provisional.
8. Antes de publicar, evita la doble apertura: elimina de esos activadores su `data-contact-dialog`, retira el diálogo provisional correspondiente y elimina únicamente su lógica asociada de `assets/js/site.js`.

## Casos según el proveedor

- **Widget montado en un contenedor:** usa el `data-widget-mount` correspondiente y haz que su elemento raíz ocupe el 100% del ancho y alto disponibles.
- **Widget dentro de un iframe:** el `iframe` debe ser un bloque sin borde, con ancho y alto del 100% del panel. El diseño interior se configura mediante la API del proveedor, no desde `site.css`.
- **Widget con Shadow DOM:** utiliza las variables CSS, atributos `part` o API de tema publicados por el proveedor. No dependas de selectores que no puedan atravesar el Shadow DOM.
- **Widget que crea su propio botón flotante:** desactiva el botón flotante actual o el del proveedor para que solo quede uno. La decisión específica de WhatsApp está documentada en su carpeta.

## Comprobación final

- Un solo popup abierto y una sola capa oscura.
- Sin scroll horizontal a 320, 390, 820, 1100, 1440 y 1920 px.
- Fondo completo incluso al rotar el móvil o mostrar el teclado virtual.
- Panel de hasta 490 px en escritorio y ancho completo hasta 820 px.
- Contenido desplazable sin mover la página del fondo.
- Apertura, cierre, Escape y retorno de foco correctos.
- Estados de carga, éxito y error accesibles.
- Sin dos botones flotantes ni dos manejadores para la misma acción.
- Sin errores en la consola y sin recursos bloqueados.
