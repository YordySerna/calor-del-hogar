/* ============================================================
   HOJALATERÍA CALOR DE HOGAR — Loncoche
   JavaScript sin dependencias, patrón IIFE.
   Nada de lo que hay acá es imprescindible: si este archivo no
   carga, la página se sigue leyendo y los botones siguen andando.
   ============================================================ */

(function () {
  "use strict";

  var raiz = document.documentElement;
  var menosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Datos del negocio. Viven en js/datos.js para que haya un solo archivo
  // que editar; si ese archivo no cargó, todo lo de abajo se salta solo.
  var DATOS = window.CALOR_DE_HOGAR || {};


  /* ----------------------------------------------------------
     AYUDANTES DE WHATSAPP
     ---------------------------------------------------------- */

  // Deja el número como lo quiere wa.me: solo dígitos, con el 56 adelante.
  function numeroWhatsapp() {
    return String(DATOS.whatsapp || "").replace(/[^0-9]/g, "");
  }

  // Devuelve "" si todavía no hay número cargado. Quien llame decide qué
  // hacer con eso; nunca se arma un wa.me a medias.
  function enlaceWhatsapp(mensaje) {
    var n = numeroWhatsapp();
    if (!n) return "";
    return "https://wa.me/" + n + (mensaje ? "?text=" + encodeURIComponent(mensaje) : "");
  }

  // 56961234567 -> +56 9 6123 4567, que es como se lee un celular en Chile.
  function numeroLegible(n) {
    if (n.length === 11 && n.slice(0, 3) === "569") {
      return "+56 9 " + n.slice(3, 7) + " " + n.slice(7);
    }
    return "+" + n;
  }


  /* ----------------------------------------------------------
     1. FONDO DE BRASAS
     Se inyecta desde JS a propósito: son elementos puramente
     decorativos y no tienen por qué ensuciar el HTML.
     ---------------------------------------------------------- */
  (function brasas() {
    var capa = document.createElement("div");
    capa.className = "brasas";
    capa.setAttribute("aria-hidden", "true");
    for (var i = 1; i <= 4; i++) {
      var b = document.createElement("div");
      b.className = "brasa brasa--" + i;
      capa.appendChild(b);
    }
    document.body.appendChild(capa);
  })();


  /* ----------------------------------------------------------
     2. ANIMACIÓN DE ENTRADA
     La clase .js activa los estados ocultos del CSS. Se pone
     recién acá para que, si el script nunca corre, no quede
     nada invisible en la página.
     ---------------------------------------------------------- */
  (function reveals() {
    var piezas = document.querySelectorAll(".rev");
    if (!piezas.length) return;

    function mostrarTodo() {
      for (var i = 0; i < piezas.length; i++) piezas[i].classList.add("visto");
    }

    // sin IntersectionObserver no hay animación, pero tampoco hay nada oculto
    if (!("IntersectionObserver" in window)) return;

    raiz.classList.add("js");

    // Red de seguridad: si a los 2,5 segundos no se reveló ni una pieza, algo
    // salió mal y se muestra todo. No usamos un temporizador que revele todo
    // siempre, porque eso mataría la animación de las secciones de más abajo.
    setTimeout(function () {
      if (!document.querySelector(".rev.visto")) mostrarTodo();
    }, 2500);

    var obs = new IntersectionObserver(function (entradas) {
      for (var i = 0; i < entradas.length; i++) {
        if (entradas[i].isIntersecting) {
          entradas[i].target.classList.add("visto");
          obs.unobserve(entradas[i].target);
        }
      }
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });

    // Lo que ya está en pantalla al cargar se revela solo: el observador
    // dispara apenas se le entrega un elemento que ya es visible.
    for (var i = 0; i < piezas.length; i++) obs.observe(piezas[i]);
  })();


  /* ----------------------------------------------------------
     3. BARRA SUPERIOR
     ---------------------------------------------------------- */
  (function barra() {
    var barra = document.getElementById("barra");
    if (!barra) return;

    var ticking = false;
    function revisar() {
      barra.classList.toggle("pegada", window.scrollY > 40);
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(revisar); }
    }, { passive: true });
    revisar();
  })();


  /* ----------------------------------------------------------
     4. MENÚ EN MÓVIL
     ---------------------------------------------------------- */
  (function menu() {
    var boton = document.getElementById("hamburguesa");
    var panel = document.getElementById("nav-movil");
    if (!boton || !panel) return;

    function cerrar() {
      panel.classList.remove("abierto");
      boton.setAttribute("aria-expanded", "false");
    }

    boton.addEventListener("click", function () {
      var abierto = panel.classList.toggle("abierto");
      boton.setAttribute("aria-expanded", abierto ? "true" : "false");
    });

    var enlaces = panel.querySelectorAll("a");
    for (var i = 0; i < enlaces.length; i++) enlaces[i].addEventListener("click", cerrar);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") cerrar();
    });
  })();


  /* ----------------------------------------------------------
     5. VIDEO DE LA PORTADA
     Arranca solo si el usuario no pidió menos movimiento y no
     está con ahorro de datos. Si no arranca, queda el poster.
     ---------------------------------------------------------- */
  (function video() {
    /* Se busca por clase y no por id para que sirva igual en la portada
       y en el catálogo, que tienen cada uno su propio video de fondo. */
    var v = document.querySelector(".portada__video");
    if (!v) return;

    var con = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var ahorroDatos = con && (con.saveData === true || /2g/.test(con.effectiveType || ""));

    if (menosMovimiento || ahorroDatos) return;   // se queda el poster, que ya se ve bien

    v.preload = "auto";
    v.loop = true;
    v.muted = true;
    v.setAttribute("muted", "");

    v.addEventListener("canplay", function () {
      var intento = v.play();
      if (intento && intento.then) {
        intento.then(function () {
          v.classList.add("visible");
        }).catch(function () {
          /* el navegador bloqueó el autoplay: se queda el poster */
        });
      } else {
        v.classList.add("visible");
      }
    }, { once: true });

    // suaviza el corte del bucle: baja la luz justo antes de volver al inicio
    v.addEventListener("timeupdate", function () {
      if (!v.duration) return;
      v.classList.toggle("parpadeo", v.duration - v.currentTime < 0.55);
    });

    // ahorra batería cuando la portada no está a la vista
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (e) {
        if (e[0].isIntersecting) { if (v.paused) v.play().catch(function () {}); }
        else if (!v.paused) v.pause();
      }, { threshold: 0.01 }).observe(v);
    }
  })();


  /* ----------------------------------------------------------
     6. DATOS DE CONTACTO
     Reparte por la página lo que haya en js/datos.js. Lo que
     todavía no existe, no se muestra: una fila vacía es mejor
     que un teléfono de relleno, porque Google indexa el falso
     y después cuesta mucho sacarlo.
     ---------------------------------------------------------- */
  (function contacto() {
    var faltan = [];

    function mostrarFila(nombre) {
      var fila = document.querySelector('[data-fila="' + nombre + '"]');
      if (fila) fila.hidden = false;
    }

    /* --- WhatsApp: todos los botones del sitio a la vez --- */
    var numero = numeroWhatsapp();
    if (numero) {
      var botones = document.querySelectorAll("[data-wa]");
      for (var i = 0; i < botones.length; i++) {
        var b = botones[i];
        b.setAttribute("href", enlaceWhatsapp(b.getAttribute("data-wa-msg") || ""));
        b.setAttribute("target", "_blank");
        b.setAttribute("rel", "noopener");
        // el enlace de la ficha de contacto además muestra el número escrito
        if (b.hasAttribute("data-wa-texto")) b.textContent = numeroLegible(numero);
      }
      mostrarFila("whatsapp");
    } else {
      faltan.push("whatsapp");
      // sin número los botones se quedan con el href del HTML (#cotiza o
      // #contacto), así que siguen llevando a alguna parte útil
    }

    /* --- Teléfono --- */
    var tel = document.querySelector("[data-tel]");
    if (DATOS.telefono && tel) {
      tel.setAttribute("href", "tel:" + String(DATOS.telefono).replace(/\s/g, ""));
      tel.textContent = DATOS.telefono;
      mostrarFila("telefono");
    } else if (!DATOS.telefono) {
      faltan.push("telefono");
    }

    /* --- Correo --- */
    var correo = document.querySelector("[data-correo]");
    if (DATOS.correo && correo) {
      correo.setAttribute("href", "mailto:" + DATOS.correo);
      correo.textContent = DATOS.correo;
      mostrarFila("correo");
    } else if (!DATOS.correo) {
      faltan.push("correo");
    }

    /* --- Horario --- */
    var horario = document.querySelector("[data-horario]");
    if (DATOS.horario && DATOS.horario.length && horario) {
      horario.textContent = "";
      for (var h = 0; h < DATOS.horario.length; h++) {
        if (h) horario.appendChild(document.createElement("br"));
        horario.appendChild(document.createTextNode(DATOS.horario[h]));
      }
      mostrarFila("horario");
    } else if (!DATOS.horario || !DATOS.horario.length) {
      faltan.push("horario");
    }

    /* --- Ficha de Google, si ya existe --- */
    var mapa = document.querySelector("[data-mapa]");
    if (DATOS.fichaGoogle && mapa) mapa.setAttribute("href", DATOS.fichaGoogle);

    /* --- Ficha de negocio para el buscador ---
       Se completa el JSON-LD con lo que haya. Cuando los datos ya sean
       definitivos conviene escribirlos también a mano en el index.html:
       el JSON-LD estático es el que Google lee más rápido. */
    var ficha = document.getElementById("ficha-google");
    if (ficha) {
      try {
        var j = JSON.parse(ficha.textContent);
        if (DATOS.telefono) j.telephone = DATOS.telefono;
        if (DATOS.correo)   j.email     = DATOS.correo;
        if (DATOS.latitud && DATOS.longitud) {
          j.geo = {
            "@type": "GeoCoordinates",
            "latitude": DATOS.latitud,
            "longitude": DATOS.longitud
          };
        }
        if (DATOS.fichaGoogle) {
          j.hasMap = DATOS.fichaGoogle;
          j.sameAs = [DATOS.fichaGoogle];
        }
        if (DATOS.horarioGoogle && DATOS.horarioGoogle.length) {
          j.openingHoursSpecification = DATOS.horarioGoogle.map(function (t) {
            return {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": t.dias,
              "opens": t.abre,
              "closes": t.cierra
            };
          });
        }
        ficha.textContent = JSON.stringify(j, null, 2);
      } catch (e) {
        /* si el JSON del HTML quedó mal escrito, se deja tal cual */
      }
    }

    /* --- Aviso para quien esté editando el sitio --- */
    if (faltan.length && window.console && console.warn) {
      console.warn(
        "Calor de Hogar — faltan datos reales en js/datos.js: " + faltan.join(", ") +
        ". Mientras tanto la página los esconde en vez de inventarlos."
      );
    }
  })();


  /* ----------------------------------------------------------
     7. COTIZACIÓN POR WHATSAPP
     Arma el mensaje con lo que se escribió en el formulario.
     No se envía nada desde la página: solo se abre WhatsApp con
     el texto listo para que el cliente lo revise.
     ---------------------------------------------------------- */
  (function cotizar() {
    var boton = document.getElementById("btn-cotiza");
    if (!boton) return;

    /* Antes esta función se cortaba acá cuando no había número cargado, y
       el formulario quedaba muerto: se llenaba, se apretaba el botón y no
       pasaba nada. Ahora, sin número, el botón copia la consulta al
       portapapeles para que el cliente la pegue donde quiera. Es una
       salida real en vez de un callejón. */
    var hayNumero = !!numeroWhatsapp();

    var campos = {
      nombre:  document.getElementById("c-nombre"),
      comuna:  document.getElementById("c-comuna"),
      trabajo: document.getElementById("c-trabajo"),
      detalle: document.getElementById("c-detalle")
    };

    var texto = "";   // el mensaje armado, para WhatsApp o para copiar

    function valor(clave) {
      return campos[clave] && campos[clave].value ? campos[clave].value.trim() : "";
    }

    function armar() {
      var nombre  = valor("nombre");
      var comuna  = valor("comuna");
      var trabajo = valor("trabajo");
      var detalle = valor("detalle");

      // El saludo se arma con lo que haya: si el cliente no llenó nada,
      // igual sale un mensaje que se entiende.
      var saludo = "Hola";
      if (nombre) saludo += ", soy " + nombre;
      if (comuna) saludo += (nombre ? " y escribo desde " : ", escribo desde ") + comuna;
      saludo += ".";

      var l = [saludo];
      if (trabajo) l.push("Quiero cotizar: " + trabajo + ".");
      if (detalle) l.push("", "Detalle:", detalle);
      l.push("", "(Escribo desde la página web.)");

      texto = l.join("\n");
      if (hayNumero) boton.setAttribute("href", enlaceWhatsapp(texto));
    }

    var claves = Object.keys(campos);
    for (var i = 0; i < claves.length; i++) {
      var c = campos[claves[i]];
      if (c) {
        c.addEventListener("input", armar);
        c.addEventListener("change", armar);
      }
    }
    armar();

    /* --- Sin número: el botón copia la consulta --- */
    if (!hayNumero) {
      var etiquetaOriginal = boton.textContent;
      boton.textContent = "Copiar mi consulta";
      boton.setAttribute("href", "#cotiza");

      var nota = document.querySelector(".cotiza__nota");
      if (nota) {
        nota.textContent = "Se copia el texto listo para pegarlo donde quieras. " +
                           "También puedes pasar por Lord Cochrane 121.";
      }

      boton.addEventListener("click", function (e) {
        e.preventDefault();
        armar();
        copiar(texto, function (ok) {
          if (ok) {
            boton.textContent = "¡Copiado! Pégalo donde quieras";
            boton.classList.add("btn--ok");
            setTimeout(function () {
              boton.textContent = "Copiar mi consulta";
              boton.classList.remove("btn--ok");
            }, 2600);
          } else {
            /* El portapapeles puede estar bloqueado (navegador viejo, permisos,
               http sin cifrar). En vez de dejar al cliente sin salida, se le
               muestra el texto ya seleccionado para que lo copie a mano. */
            mostrarParaCopiar(texto);
            boton.textContent = etiquetaOriginal;
          }
        });
      });

      function mostrarParaCopiar(txt) {
        var caja = document.getElementById("copia-manual");
        if (!caja) {
          caja = document.createElement("div");
          caja.id = "copia-manual";
          caja.className = "copia";
          caja.innerHTML =
            '<p class="copia__titulo">Copia este texto y mándanoslo</p>' +
            '<textarea class="copia__txt" readonly rows="7"></textarea>';
          boton.parentNode.insertBefore(caja, boton.nextSibling);
        }
        var ta = caja.querySelector(".copia__txt");
        ta.value = txt;
        caja.hidden = false;
        ta.focus();
        ta.select();
      }
    }

    /* Copia con la API moderna y, si no está disponible (o la página no
       va por https), cae al textarea de toda la vida. */
    function copiar(txt, listo) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(function () { listo(true); },
                                               function () { listo(respaldo(txt)); });
      } else {
        listo(respaldo(txt));
      }
    }
    function respaldo(txt) {
      try {
        var ta = document.createElement("textarea");
        ta.value = txt;
        ta.setAttribute("readonly", "");
        ta.style.cssText = "position:absolute;left:-9999px;top:0";
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand("copy");
        document.body.removeChild(ta);
        return ok;
      } catch (e) { return false; }
    }

    // Enter en un campo de texto dispara el botón en vez de recargar la página
    var form = document.getElementById("form-cotiza");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        armar();
        if (hayNumero) window.open(boton.getAttribute("href"), "_blank", "noopener");
        else boton.click();
      });
    }
  })();


  /* ----------------------------------------------------------
     8. BOTÓN FLOTANTE DE WHATSAPP
     Se esconde en la portada (donde ya hay un botón grande) y
     sobre el formulario (donde taparía el que hace lo mismo).
     Sin IntersectionObserver se queda visible siempre, que es
     el comportamiento seguro.
     ---------------------------------------------------------- */
  (function flotante() {
    var boton = document.getElementById("flotante");
    if (!boton) return;

    var enPortada = true;
    var enCotiza  = false;

    function refrescar() {
      boton.classList.toggle("oculto", enPortada || enCotiza);
    }

    var ticking = false;
    function revisar() {
      enPortada = window.scrollY < 380;
      refrescar();
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(revisar); }
    }, { passive: true });
    revisar();

    var cotiza = document.getElementById("cotiza");
    if (cotiza && "IntersectionObserver" in window) {
      new IntersectionObserver(function (e) {
        enCotiza = e[0].isIntersecting;
        refrescar();
      }, { threshold: 0.3 }).observe(cotiza);
    }
  })();


  /* ----------------------------------------------------------
     9. VIDEOS A PEDIDO
     Los <video> del cuerpo de la página vienen sin src: solo con
     el poster y la ruta guardada en data-fuente. El .mp4 se pide
     recién al tocar play. Así un visitante en datos móviles que
     baja de largo no descarga ni un KB de video.
     ---------------------------------------------------------- */
  (function videos() {
    var cajas = document.querySelectorAll(".video");

    for (var i = 0; i < cajas.length; i++) {
      (function (caja) {
        var v      = caja.querySelector("video");
        var boton  = caja.querySelector(".video__play");
        var txt    = caja.querySelector(".video__txt");
        if (!v || !boton) return;

        var fuente = v.getAttribute("data-fuente");
        if (!fuente) return;

        /* El poster también se pide tarde. Antes los ocho posters se
           descargaban al abrir la página aunque el visitante no bajara
           nunca: eran unos 800 KB regalados. Ahora el atributo real se
           pone recién cuando el video se acerca a la pantalla. */
        var posterDiferido = v.getAttribute("data-poster");
        if (posterDiferido) {
          if ("IntersectionObserver" in window) {
            var obsPoster = new IntersectionObserver(function (e) {
              if (e[0].isIntersecting) {
                v.setAttribute("poster", posterDiferido);
                obsPoster.disconnect();
              }
            }, { rootMargin: "300px 0px" });
            obsPoster.observe(caja);
          } else {
            v.setAttribute("poster", posterDiferido);
          }
        }

        var cargado = false;
        // cada video trae su propia invitación escrita en el HTML
        // ("Ver cómo se trabaja", "Reproducir"...): se respeta esa.
        var textoInicial = txt ? txt.textContent : "";

        function describir() {
          // el botón cambia de significado según el estado, y el lector
          // de pantalla tiene que enterarse
          var etiqueta = v.getAttribute("aria-label") || "el video";
          boton.setAttribute("aria-label", (v.paused ? "Reproducir: " : "Pausar: ") + etiqueta);
          if (txt) txt.textContent = v.paused ? textoInicial : "Pausar";
        }

        boton.addEventListener("click", function () {
          if (!cargado) {
            v.src = fuente;
            // Los controles nativos aparecen recién ahora, no antes: sobre el
            // poster estorbaban. Traen barra, volumen y pantalla completa, y
            // funcionan con teclado en todos los navegadores. Cualquier control
            // hecho a mano sería peor y además habría que mantenerlo.
            v.controls = true;
            cargado = true;
          }
          if (v.paused) {
            var intento = v.play();
            if (intento && intento.catch) intento.catch(function () {
              // si el navegador lo bloquea, se vuelve al poster
              caja.classList.remove("andando");
              describir();
            });
          } else {
            v.pause();
          }
        });

        v.addEventListener("play",  function () { caja.classList.add("andando");    describir(); });
        v.addEventListener("pause", function () { caja.classList.remove("andando"); describir(); });

        // Al terminar vuelve al poster con el botón grande. Estos clips ya no
        // van en bucle: con sonido, repetirse diez segundos sin parar cansa.
        v.addEventListener("ended", function () {
          v.currentTime = 0;
          caja.classList.remove("andando");
          describir();
        });

        // Si el clip se va de pantalla mientras corre, se pausa: no tiene
        // sentido gastar batería y CPU en algo que no se está mirando.
        if ("IntersectionObserver" in window) {
          new IntersectionObserver(function (e) {
            if (!e[0].isIntersecting && !v.paused) v.pause();
          }, { threshold: 0.15 }).observe(caja);
        }

        describir();
      })(cajas[i]);
    }
  })();


  /* ----------------------------------------------------------
     10. VISOR DE LA GALERÍA
     ---------------------------------------------------------- */
  (function visor() {
    var galeria = document.getElementById("galeria");
    var caja    = document.getElementById("visor");
    if (!galeria || !caja) return;

    var img    = document.getElementById("visor-img");
    var pie    = document.getElementById("visor-pie");
    var cerrar = document.getElementById("visor-cerrar");
    var ant    = document.getElementById("visor-ant");
    var sig    = document.getElementById("visor-sig");

    var figuras = galeria.querySelectorAll(".galeria__item");
    var actual  = 0;
    var origen  = null;   // desde qué foto se abrió, para devolver el foco al cerrar

    function pintar(i) {
      actual = (i + figuras.length) % figuras.length;
      var f = figuras[actual];
      var foto = f.querySelector("img");
      var texto = f.querySelector("figcaption");
      img.setAttribute("src", foto.getAttribute("src"));
      img.setAttribute("alt", foto.getAttribute("alt") || "");
      pie.textContent = texto ? texto.textContent : "";
    }

    function abrir(i) {
      origen = figuras[i];
      pintar(i);
      caja.hidden = false;
      requestAnimationFrame(function () { caja.classList.add("abierto"); });
      document.body.style.overflow = "hidden";
      cerrar.focus();
    }

    function tapar() {
      caja.classList.remove("abierto");
      document.body.style.overflow = "";
      setTimeout(function () { caja.hidden = true; }, 250);
      if (origen) { origen.focus(); origen = null; }
    }

    // Las fotos se vuelven interactivas recién acá: si el visor no existe,
    // tampoco tiene sentido que aparezcan como botones para el teclado.
    for (var i = 0; i < figuras.length; i++) {
      (function (n) {
        var f = figuras[n];
        f.setAttribute("tabindex", "0");
        f.setAttribute("role", "button");
        f.setAttribute("aria-label", "Ampliar foto: " + (f.querySelector("figcaption") || {}).textContent);
        f.addEventListener("click", function () { abrir(n); });
        f.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrir(n); }
        });
      })(i);
    }

    cerrar.addEventListener("click", tapar);
    ant.addEventListener("click", function () { pintar(actual - 1); });
    sig.addEventListener("click", function () { pintar(actual + 1); });

    caja.addEventListener("click", function (e) {
      if (e.target === caja) tapar();
    });

    document.addEventListener("keydown", function (e) {
      if (caja.hidden) return;
      if (e.key === "Escape")     tapar();
      if (e.key === "ArrowLeft")  pintar(actual - 1);
      if (e.key === "ArrowRight") pintar(actual + 1);
    });
  })();

})();
