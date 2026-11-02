/* ============================================================
   PataFeliz - Lógica de la página
   ============================================================ */
(() => {
  'use strict';

  /* ---------- Configuración ---------- */
  const EMAIL_DESTINO = 'contacto@patafeliz.do'; // Cambia por el correo real de la clínica
  const DRAFT_KEY = 'patafeliz_borrador';
  const EVENTS_KEY = 'patafeliz_eventos';
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  /* ---------- Utilidades: almacenamiento seguro ---------- */
  const storage = {
    get(key) {
      try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* almacenamiento no disponible */ }
    },
    remove(key) {
      try { localStorage.removeItem(key); } catch (e) { /* almacenamiento no disponible */ }
    }
  };

  /* ---------- Analítica ligera ---------- */
  // Registra eventos en localStorage y en consola. Si más adelante agregas
  // Google Analytics, basta con enviar aquí el evento a gtag().
  function trackEvent(name, detail = {}) {
    const events = storage.get(EVENTS_KEY) || [];
    events.push({ name, detail, time: new Date().toISOString() });
    storage.set(EVENTS_KEY, events.slice(-100));
    if (typeof window.gtag === 'function') window.gtag('event', name, detail);
  }

  function trackPerformance() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const nav = performance.getEntriesByType('navigation')[0];
        if (nav) {
          trackEvent('rendimiento', {
            carga_ms: Math.round(nav.loadEventEnd),
            dom_ms: Math.round(nav.domContentLoadedEventEnd)
          });
        }
      }, 0);
    });
    if ('PerformanceObserver' in window) {
      try {
        new PerformanceObserver((list) => {
          const last = list.getEntries().pop();
          if (last) trackEvent('LCP', { ms: Math.round(last.startTime) });
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (e) { /* navegador sin soporte */ }
    }
  }

  function initTrackedClicks() {
    document.querySelectorAll('[data-track]').forEach((el) => {
      el.addEventListener('click', () => trackEvent('clic', { elemento: el.dataset.track }));
    });
  }

  /* ---------- Manejo de errores globales ---------- */
  window.addEventListener('error', (e) => trackEvent('error_js', { mensaje: e.message }));

  // Si una imagen no carga, se reemplaza por un fondo con una huella
  const FALLBACK_IMG = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="#e6ecef"/>' +
    '<text x="50%" y="55%" font-size="90" text-anchor="middle">🐾</text></svg>'
  );
  function initImageFallback() {
    document.querySelectorAll('img').forEach((img) => {
      img.addEventListener('error', () => {
        if (img.dataset.fallback) return;
        img.dataset.fallback = '1';
        img.src = FALLBACK_IMG;
      });
    });
  }

  /* ---------- Año del footer ---------- */
  function setYear() {
    const el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---------- Menú: cerrar en móvil y resaltar sección activa ---------- */
  function initNavigation() {
    const menu = document.getElementById('menuPrincipal');
    const links = document.querySelectorAll('.app-navbar .nav-link');

    links.forEach((link) => {
      link.addEventListener('click', () => {
        if (menu.classList.contains('show')) {
          bootstrap.Collapse.getOrCreateInstance(menu).hide();
        }
      });
    });

    if (!('IntersectionObserver' in window)) return;
    const sections = ['inicio', 'servicios', 'equipo', 'contacto']
      .map((id) => document.getElementById(id)).filter(Boolean);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach((s) => observer.observe(s));
  }

  /* ---------- Carrusel de clientes ---------- */
  const REVIEWS = [
    { nombre: 'María Fernández', mascota: 'Luna 🐶', texto: 'Atendieron a Luna con muchísimo cariño. ¡Quedé encantada! 😍', estrellas: 5, icono: 'fa-heart', foto: 'women/12' },
    { nombre: 'José Ramírez', mascota: 'Max 🐕', texto: 'La cirugía de Max salió perfecta y el seguimiento fue excelente. 👏', estrellas: 5, icono: 'fa-thumbs-up', foto: 'men/32' },
    { nombre: 'Carolina Peña', mascota: 'Michi 🐱', texto: 'Mi gata odia las visitas al veterinario, pero aquí se relajó. 😸', estrellas: 5, icono: 'fa-star', foto: 'women/33' },
    { nombre: 'Luis Martínez', mascota: 'Rocky 🐶', texto: 'Profesionales, puntuales y con precios justos. Muy recomendados. 💪', estrellas: 4, icono: 'fa-award', foto: 'men/54' },
    { nombre: 'Yesenia Cabrera', mascota: 'Canela 🐩', texto: 'La peluquería dejó a Canela hermosa y olorosa. ¡Volveremos! ✨', estrellas: 5, icono: 'fa-scissors', foto: 'women/65' },
    { nombre: 'Rafael Núñez', mascota: 'Thor 🐕‍🦺', texto: 'Me atendieron una emergencia de noche y salvaron a Thor. Gracias. 🙏', estrellas: 5, icono: 'fa-kit-medical', foto: 'men/21' },
    { nombre: 'Patricia Sosa', mascota: 'Nala 🐈', texto: 'Explican todo con paciencia y claridad. Se nota la vocación. 💖', estrellas: 5, icono: 'fa-user-doctor', foto: 'women/8' },
    { nombre: 'Andrés Valdez', mascota: 'Bruno 🐶', texto: 'Las vacunas de Bruno al día y sin llantos. ¡Gran equipo! 🎉', estrellas: 4, icono: 'fa-syringe', foto: 'men/9' },
    { nombre: 'Daniela Reyes', mascota: 'Coco 🐰', texto: 'Hasta mi conejito Coco fue atendido con mucho conocimiento. 🥕', estrellas: 5, icono: 'fa-paw', foto: 'women/90' },
    { nombre: 'Miguel Taveras', mascota: 'Simba 🦁🐱', texto: 'Instalaciones limpias y personal amable. Es nuestra clínica de confianza. 🏥', estrellas: 5, icono: 'fa-house-medical', foto: 'men/68' }
  ];

  function renderStars(n) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
      html += `<i class="${i <= n ? 'fa-solid' : 'fa-regular'} fa-star" aria-hidden="true"></i>`;
    }
    return html;
  }

  function initReviews() {
    const track = document.getElementById('reviewsTrack');
    const prev = document.getElementById('reviewsPrev');
    const next = document.getElementById('reviewsNext');
    const status = document.getElementById('reviewsStatus');
    if (!track || !prev || !next) return;

    // Crear las 10 tarjetas con un desfase distinto de color arcoíris
    track.innerHTML = REVIEWS.map((r, i) => `
      <div class="review-slot" role="group" aria-roledescription="diapositiva" aria-label="${i + 1} de ${REVIEWS.length}">
        <article class="review-card" style="animation-delay:-${(i * 0.6).toFixed(1)}s">
          <div class="review-inner">
            <img class="review-avatar" src="https://randomuser.me/api/portraits/${r.foto}.jpg" alt="Foto de ${r.nombre}" loading="lazy" width="84" height="84">
            <h3 class="review-name">${r.nombre}</h3>
            <span class="review-pet">${r.mascota}</span>
            <div class="review-stars" aria-label="${r.estrellas} de 5 estrellas">${renderStars(r.estrellas)}</div>
            <p class="review-text">“${r.texto}”</p>
            <i class="fa-solid ${r.icono} review-icon" aria-hidden="true"></i>
          </div>
        </article>
      </div>`).join('');

    let index = 0;
    const total = REVIEWS.length;

    // Tarjetas por vista según el ancho de pantalla
    const perView = () => (window.innerWidth >= 992 ? 4 : window.innerWidth >= 768 ? 2 : 1);

    function update() {
      const pv = perView();
      const max = Math.max(0, total - pv);
      index = Math.min(Math.max(index, 0), max);
      track.style.setProperty('--per-view', pv);
      track.style.transform = `translateX(-${index * (100 / pv)}%)`;
      prev.disabled = index === 0;
      next.disabled = index === max;
      const desde = index + 1;
      const hasta = Math.min(index + pv, total);
      status.textContent = `Mostrando opiniones ${desde} a ${hasta} de ${total}`;
    }

    prev.addEventListener('click', () => { index -= 1; update(); trackEvent('carrusel', { dir: 'anterior' }); });
    next.addEventListener('click', () => { index += 1; update(); trackEvent('carrusel', { dir: 'siguiente' }); });
    window.addEventListener('resize', update);

    // Deslizar con el dedo en pantallas táctiles
    let startX = null;
    track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', (e) => {
      if (startX === null) return;
      const diff = e.changedTouches[0].clientX - startX;
      if (Math.abs(diff) > 50) { index += diff < 0 ? 1 : -1; update(); }
      startX = null;
    });

    update();
  }

  /* ---------- Formulario de contacto ---------- */
  function initContactForm() {
    const form = document.getElementById('contactForm');
    const modalEl = document.getElementById('confirmModal');
    if (!form || !modalEl) return;

    const fields = {
      nombre: form.elements.nombre,
      email: form.elements.email,
      mensaje: form.elements.mensaje
    };

    const rules = {
      nombre: (v) => v.trim().length >= 3,
      email: (v) => EMAIL_REGEX.test(v.trim()),
      mensaje: (v) => v.trim().length >= 10
    };

    function validateField(name) {
      const ok = rules[name](fields[name].value);
      fields[name].classList.toggle('is-invalid', !ok);
      fields[name].classList.toggle('is-valid', ok);
      return ok;
    }

    // Recuperar borrador guardado (persistencia)
    const draft = storage.get(DRAFT_KEY);
    if (draft) {
      Object.keys(fields).forEach((k) => { if (draft[k]) fields[k].value = draft[k]; });
    }

    Object.keys(fields).forEach((name) => {
      fields[name].addEventListener('input', () => {
        if (fields[name].classList.contains('is-invalid') || fields[name].classList.contains('is-valid')) validateField(name);
        storage.set(DRAFT_KEY, {
          nombre: fields.nombre.value, email: fields.email.value, mensaje: fields.mensaje.value
        });
      });
      fields[name].addEventListener('blur', () => { if (fields[name].value) validateField(name); });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const valid = Object.keys(fields).map(validateField).every(Boolean);
      if (!valid) {
        const firstInvalid = form.querySelector('.is-invalid');
        if (firstInvalid) firstInvalid.focus();
        trackEvent('formulario_invalido');
        return;
      }
      abrirCorreo();
    });

    function abrirCorreo() {
      const asunto = encodeURIComponent(`Consulta desde la web - ${fields.nombre.value.trim()}`);
      const cuerpo = encodeURIComponent(
        `Nombre: ${fields.nombre.value.trim()}\nCorreo: ${fields.email.value.trim()}\n\nMensaje:\n${fields.mensaje.value.trim()}`
      );

      let mostrado = false;
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);

      function limpiar() {
        window.removeEventListener('blur', mostrar);
        document.removeEventListener('visibilitychange', alCambiarVisibilidad);
        clearTimeout(respaldo);
      }

      function mostrar() {
        if (mostrado) return;
        mostrado = true;
        limpiar();
        modal.show();
        form.reset();
        form.querySelectorAll('.is-valid, .is-invalid').forEach((el) => el.classList.remove('is-valid', 'is-invalid'));
        storage.remove(DRAFT_KEY);
        trackEvent('correo_abierto');
      }

      function alCambiarVisibilidad() { if (document.hidden) mostrar(); }

      // Detecta que el navegador o la app de correo tomó el foco
      window.addEventListener('blur', mostrar);
      document.addEventListener('visibilitychange', alCambiarVisibilidad);
      // Respaldo: si el navegador no pierde el foco, se muestra igual tras 3 s
      const respaldo = setTimeout(mostrar, 3000);

      window.location.href = `mailto:${EMAIL_DESTINO}?subject=${asunto}&body=${cuerpo}`;
    }
  }

  /* ---------- Inicio ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    setYear();
    initNavigation();
    initReviews();
    initContactForm();
    initImageFallback();
    initTrackedClicks();
    trackPerformance();
  });
})();
