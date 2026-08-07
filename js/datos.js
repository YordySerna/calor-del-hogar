/* ============================================================
   HOJALATERÍA CALOR DE HOGAR — DATOS DEL NEGOCIO

   ESTE ES EL ÚNICO ARCHIVO QUE HAY QUE EDITAR PARA PONER LOS
   DATOS REALES. No hace falta tocar el HTML.

   Mientras un dato esté vacío (""), la página se adapta sola:
     · los botones de WhatsApp llevan a la sección Contacto,
     · la ficha de contacto no muestra la fila,
     · el buscador de Google no recibe el dato en la ficha.
   Así nunca se publica un teléfono ni un correo inventado, que es
   peor que no tener ninguno: Google indexa el falso y después
   cuesta mucho sacarlo.

   Al abrir la página, la consola del navegador (F12) va listando
   lo que todavía falta.
   ============================================================ */

window.CALOR_DE_HOGAR = {

  /* Número de WhatsApp en formato internacional, SOLO dígitos.
     Ejemplo para Chile: "56961234567"  (56 + 9 + los 8 dígitos) */
  whatsapp: "56968650001",

  /* Teléfono para llamar. Con + y sin espacios: "+56961234567".
     Si es el mismo que el WhatsApp, se puede repetir. */
  telefono: "+56968650001",

  /* Correo de contacto. En la tarjeta del local termina en
     "loncoche@gmail.com", pero el principio no se alcanza a leer
     en la foto: hay que confirmarlo con Miguel antes de ponerlo. */
  correo: "",

  /* Horario de atención. Cada línea es una fila del recuadro.
     Ejemplo: ["Lunes a viernes: 9:00 a 18:30", "Sábado: 10:00 a 14:00"] */
  horario: [],

  /* Lo mismo, pero en el formato que entiende Google. Ver
     https://schema.org/openingHoursSpecification
     Ejemplo:
       [{ dias: ["Monday","Tuesday","Wednesday","Thursday","Friday"],
          abre: "09:00", cierra: "18:30" },
        { dias: ["Saturday"], abre: "10:00", cierra: "14:00" }]        */
  horarioGoogle: [],

  /* Enlace a la ficha de Google del negocio, si ya existe.
     Sirve para el botón "Cómo llegar" y para el campo sameAs. */
  fichaGoogle: "",

  /* Coordenadas exactas del local, para la ficha de Google.
     Se sacan abriendo Google Maps, clic derecho sobre el local,
     y copiando el par de números que aparece arriba del todo. */
  latitud: "",
  longitud: ""

};
