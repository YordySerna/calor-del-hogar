# Hojalatería Calor de Hogar — Loncoche

Sitio estático. HTML + CSS + JavaScript vanilla. Sin build, sin npm, sin frameworks.
Abre con doble clic en `index.html` o se sube tal cual a cualquier hosting.

```
index.html          todo el contenido, escrito en el HTML
css/estilo.css      estilos + fondo animado de brasas
js/main.js          reveals, menú, video, visor y armado del WhatsApp
images/             fotos optimizadas (1500 px, ~250 KB c/u) + taller-loop.mp4
images/originales/  las fotos y videos tal como llegaron (NO subir: son 700 MB)
serve.ps1           servidor local para previsualizar
```

## Ver el sitio localmente

```bash
powershell -NoProfile -ExecutionPolicy Bypass -File serve.ps1 -Root . -Port 8792
```

Después abrir `http://localhost:8792`. También funciona con doble clic en
`index.html`, pero el servidor es mejor porque el video necesita peticiones
por rango (`Range`) para reproducirse bien.

## Lo que falta reemplazar

Están todos marcados en el código con el comentario `EJEMPLO — reemplazar`.
Para encontrarlos: buscar ese texto en `index.html`.

| Dato | Dónde aparece | Estado |
|---|---|---|
| Número de WhatsApp | 5 lugares en `index.html` (barra, portada, formulario, contacto, botón flotante) | falta |
| Teléfono | sección contacto + JSON-LD | falta |
| Correo | sección contacto + JSON-LD | falta |
| Horario de atención | sección contacto + JSON-LD | falta |
| Años funcionando | sección "El oficio" y razón 03 | por confirmar |
| Lista de servicios | 8 tarjetas en `#servicios` | deducida de las fotos, por confirmar |

El número de WhatsApp se escribe **solo en el `href`** de cada enlace, en formato
`https://wa.me/56912345678` (sin `+`, sin espacios). El JavaScript lo lee de ahí
para armar el mensaje de cotización, así que no hay que tocar `main.js`.

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

## Si el JavaScript falla

La página se sigue leyendo completa: el contenido está escrito en el HTML, los
botones de WhatsApp tienen su `href` real, y los estados ocultos de las
animaciones solo existen bajo la clase `.js`, que se agrega recién cuando el
script arranca. Hay además una red de seguridad que revela todo a los 2,5 s si
el `IntersectionObserver` no responde.

## Publicar

Antes de subir, borrar o excluir `images/originales/` (pesa ~700 MB).
El sitio completo sin esa carpeta pesa alrededor de **10 MB**.
