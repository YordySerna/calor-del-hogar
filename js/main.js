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
    var v = document.getElementById("video-taller");
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
     6. COTIZACIÓN POR WHATSAPP
     Arma el mensaje y lo mete en el enlace. El número no se
     escribe acá: se lee del href que ya está en el HTML, así
     hay un solo lugar donde cambiarlo.
     ---------------------------------------------------------- */
  (function cotizar() {
    var boton = document.getElementById("btn-cotiza");
    if (!boton) return;

    var numero = (boton.getAttribute("href") || "").replace(/[^0-9]/g, "");
    if (!numero) return;

    var campos = {
      nombre:  document.getElementById("c-nombre"),
      comuna:  document.getElementById("c-comuna"),
      trabajo: document.getElementById("c-trabajo"),
      detalle: document.getElementById("c-detalle")
    };

    function armar() {
      var l = ["Hola, quiero cotizar un trabajo de hojalatería."];

      if (campos.nombre && campos.nombre.value.trim()) {
        l.push("Soy " + campos.nombre.value.trim() + ".");
      }
      if (campos.trabajo && campos.trabajo.value) {
        l.push("Necesito: " + campos.trabajo.value + ".");
      }
      if (campos.detalle && campos.detalle.value.trim()) {
        l.push("Detalle: " + campos.detalle.value.trim());
      }
      if (campos.comuna && campos.comuna.value.trim()) {
        l.push("Escribo desde " + campos.comuna.value.trim() + ".");
      }

      boton.setAttribute(
        "href",
        "https://wa.me/" + numero + "?text=" + encodeURIComponent(l.join("\n"))
      );
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

    // Enter en un campo de texto abre WhatsApp en vez de recargar la página
    var form = document.getElementById("form-cotiza");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        armar();
        window.open(boton.getAttribute("href"), "_blank", "noopener");
      });
    }
  })();


  /* ----------------------------------------------------------
     7. VISOR DE LA GALERÍA
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
