# Hojalatería Calor de Hogar — Loncoche

Sitio estático. HTML + CSS + JavaScript vanilla. Sin build, sin npm, sin frameworks.
Abre con doble clic en `index.html` o se sube tal cual a cualquier hosting.

```
index.html          todo el contenido, escrito en el HTML
css/estilo.css      estilos + fondo animado de brasas
js/datos.js         ← LOS DATOS DEL NEGOCIO. Es el único archivo a editar.
js/main.js          reveals, menú, video, visor, contacto y armado del WhatsApp
images/             fotos optimizadas (1500 px) + videos 720p + sus posters
images/originales/  las fotos y videos tal como llegaron (NO subir: son 700 MB)
robots.txt          + sitemap.xml, para el buscador
serve.ps1           servidor local para previsualizar
optimizar-media.ps1 convierte los videos del teléfono a formato web
```

## Ver el sitio localmente

```bash
powershell -NoProfile -ExecutionPolicy Bypass -File serve.ps1
```

Después abrir `http://localhost:8765`. También funciona con doble clic en
`index.html`, pero el servidor es mejor porque el video necesita peticiones
por rango (`Range`) para reproducirse bien.

## Lo que falta: se edita SOLO en `js/datos.js`

Todos los datos de contacto viven en un único objeto en `js/datos.js`. No hay
que tocar el HTML ni buscar el número repetido por el archivo: se escribe una
vez y el JavaScript lo reparte por los 10 botones de WhatsApp, la ficha de
contacto y el JSON-LD de Google.

**Mientras un dato esté vacío (`""`), la página no lo inventa: lo esconde.**
Los botones de WhatsApp quedan apuntando a `#cotiza` o `#contacto`, que siguen
llevando a alguna parte útil. Al abrir la página, la consola del navegador
(F12) lista lo que todavía falta.

Esto es a propósito: un teléfono de relleno es peor que ninguno, porque Google
lo indexa y después cuesta mucho sacarlo.

| Dato | Estado | Cómo conseguirlo |
|---|---|---|
| Número de WhatsApp | falta | preguntarle a Miguel |
| Teléfono | falta | hay dos en la tarjeta del local, ilegibles en la foto |
| Correo | falta | termina en `loncoche@gmail.com`; el principio no se lee |
| Horario de atención | falta | preguntarle a Miguel |
| Coordenadas del local | falta | Google Maps → clic derecho sobre el local |
| Ficha de Google del negocio | falta | **lo más importante de todo**, ver abajo |
| Años funcionando | por confirmar | figura en patentes desde 2015 o antes |
| Lista de servicios | por confirmar | deducida de las fotos y del cartel |

### Lo que más mueve la aguja: la ficha de Google

Para un taller de barrio, la mayoría de los clientes buenos no escriben la URL:
buscan *"hojalatería Loncoche"* y hacen clic en el mapa. Sin ficha de Google
Business Profile el sitio recibe muy poco tráfico, por muy bueno que esté.

Crear la ficha (con dirección, horario, fotos reales y categoría) y juntar las
primeras reseñas rinde más que cualquier mejora al sitio. Cuando existan 5 o
más reseñas, conviene agregarle al sitio una sección con ellas — hoy no está
justamente porque no hay reseñas reales que mostrar, y poner testimonios
inventados destruiría toda la confianza que construye el resto de la página.

## Datos verificados (no tocar sin motivo)

- Nombre y bajada salen del cartel colgado en el local: *Hojalatería Calor de Hogar
  — Fábrica de cocinas y hojalatería en general*.
- Dueño: Miguel A. Bustamante Q.
- Dirección: Lord Cochrane 121, Loncoche. Confirmada en el Rol de Patentes de la
  Municipalidad de Loncoche (giro: "venta de cocinas, hojalatería y montajes"),
  donde figura al menos desde 2015.
- Transbank y Caja Vecina: se ven en las fotos del local.

## Decisiones de diseño

- **Paleta**: son los colores reales del local — verde petróleo de las paredes,
  naranja de las estanterías, rojo óxido del piso, zinc del producto. No se
  inventó una paleta "premium" de cero.
- **Tipografías**: Anton para titulares (aire de letrero de taller pintado a mano)
  y Barlow para el cuerpo (viene de señalética vial: sobria y muy legible).
- **Fondo animado**: manchas difusas cálidas en CSS puro (`filter: blur()` +
  `@keyframes`). Cero librerías. Se apagan solas con `prefers-reduced-motion`.
- **Video de portada**: `images/taller-loop.mp4`, sacado de `VID_20260805_102347.mp4`.
  Comprimido de 53 MB (4K) a 1,8 MB (1280×720, sin audio) con el codificador
  nativo de Windows. Va desenfocado para dar textura sin competir con el titular.

## Videos

Los clips salen del teléfono en 4K HEVC a ~60 Mbps: entre 50 y 100 MB por cada
10 segundos. Así no se pueden subir, y además HEVC no lo reproducen todos los
navegadores. `optimizar-media.ps1` los convierte a H.264 720p y saca el poster
de cada uno:

```bash
powershell -ExecutionPolicy Bypass -File optimizar-media.ps1
```

Requiere ffmpeg (`winget install Gyan.FFmpeg`). El resultado real de los ocho
clips fue **583 MB → 10,1 MB**, unas 58 veces menos, sin diferencia visible a
tamaño de pantalla.

### La regla: nada se descarga sin que lo pidan

Los `<video>` del cuerpo de la página **no tienen `src`**. Llevan la ruta en
`data-fuente` y `preload="none"`, y `js/main.js` recién asigna el `src` cuando
alguien toca play. Un visitante con datos móviles que baja de largo no gasta
un solo KB de video: solo ve el poster, que pesa unos 110 KB.

El único que arranca solo es el de la portada, y va mudo, desenfocado y se
pausa cuando la portada sale de pantalla.

### ¿Hace falta pagar hosting?

No. Los límites de GitHub Pages son **1 GB de sitio** y **100 GB/mes de ancho
de banda** (blando). El sitio completo con los ocho videos pesa ~21 MB.

Para un **video de presentación** largo (2-4 minutos) la recomendación cambia:
subirlo a YouTube y embeberlo. No por el peso, sino porque YouTube entrega
calidad adaptable según la conexión de cada quien, y un canal con el nombre del
negocio suma para el SEO local igual que la ficha de Google.

### Pendiente: permiso para publicar la cara de Miguel

En `taller-maestro.mp4` (y en su poster) **se ve la cara del maestro con toda
claridad**. Antes de publicar hay que pedirle permiso explícito. Es una persona
identificable en un sitio público; es lo que corresponde y además le va a gustar
que se lo pregunten.

Si dijera que no, el reemplazo natural es `taller-plantillas.mp4` o
`taller-meson.mp4`, donde la persona sale de espaldas o fuera de cuadro.

## Estructura de la página

Ordenada para que alguien que llega de Google pase de "no los conozco" a
"les escribo" sin tener que volver atrás:

1. **Portada** — quiénes son y dónde, con el botón de WhatsApp a la vista.
2. **Franja de confianza** — cuatro datos duros, todos comprobables.
3. **El oficio** — el proceso a mano y el maestro, con la foto de las plantillas.
4. **Servicios** — ocho tarjetas + una novena que lleva a WhatsApp.
5. **Cómo funciona** — los cuatro pasos para pedir. Saca la duda de "¿y qué le digo?".
6. **Trabajos** — la galería, que es la prueba visual.
7. **Por qué nosotros** — las razones, ya con el terreno preparado.
8. **Preguntas** — resuelve lo que frena el mensaje.
9. **Cotizar** — el formulario que arma el WhatsApp.
10. **Llamado final** + **Contacto** con mapa.

Cada sección larga termina en un enlace a WhatsApp: la idea es que el visitante
nunca quede sin salida en el punto en que se decidió.

## Si el JavaScript falla

La página se sigue leyendo completa: el contenido está escrito en el HTML, las
preguntas frecuentes usan `<details>` nativo (se abren y cierran sin JS), y los
estados ocultos de las animaciones solo existen bajo la clase `.js`, que se
agrega recién cuando el script arranca. Hay además una red de seguridad que
revela todo a los 2,5 s si el `IntersectionObserver` no responde.

El único punto que sí depende del JavaScript son los enlaces de WhatsApp, porque
el número vive en `js/datos.js`. Sin JS los botones llevan a la sección de
contacto, donde está la dirección y el mapa. Es el intercambio a cambio de tener
un solo lugar donde editar el número; cuando los datos ya sean definitivos, se
pueden además escribir a mano en el HTML.

## Publicar

Antes de subir, borrar o excluir `images/originales/` (pesa ~700 MB).
El sitio completo sin esa carpeta pesa alrededor de **10 MB**.
