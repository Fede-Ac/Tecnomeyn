/**
 * TECNOMEYN - Interactividad Ligera y Accesible
 * - Navegación móvil táctil
 * - Carrusel de fotos optimizado con soporte touch/swipe
 * - Filtrado instantáneo de productos/servicios
 * - Botones de copia al portapapeles con confirmación visual
 * - Formulario con fallback de WhatsApp / Envío directo
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Manejo del menú hamburguesa en móviles
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isExpanded);
      navMenu.classList.toggle('open');
    });

    // Cerrar menú al tocar un enlace
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Cerrar al tocar fuera
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !navToggle.contains(e.target) && navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 2. Slider / Carrusel de Inicio ligero con Touch / Teclado
  const track = document.getElementById('sliderTrack');
  const slides = document.querySelectorAll('.slider-slide');
  const prevBtn = document.getElementById('sliderPrev');
  const nextBtn = document.getElementById('sliderNext');
  const dotsContainer = document.getElementById('sliderDots');

  if (track && slides.length > 0) {
    let currentIndex = 0;
    const totalSlides = slides.length;
    let autoplayTimer = null;

    // Crear puntos indicadores (dots)
    dotsContainer.innerHTML = '';
    slides.forEach((_, idx) => {
      const dot = document.createElement('button');
      dot.className = `slider-dot ${idx === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Ir a foto ${idx + 1}`);
      dot.addEventListener('click', () => {
        goToSlide(idx);
        resetAutoplay();
      });
      dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll('.slider-dot');

    function updateSlider() {
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentIndex);
      });
    }

    function goToSlide(index) {
      currentIndex = (index + totalSlides) % totalSlides;
      updateSlider();
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        goToSlide(currentIndex - 1);
        resetAutoplay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        goToSlide(currentIndex + 1);
        resetAutoplay();
      });
    }

    // Autoplay moderado (cada 5.5 seg)
    function startAutoplay() {
      autoplayTimer = setInterval(() => {
        goToSlide(currentIndex + 1);
      }, 5500);
    }

    function resetAutoplay() {
      clearInterval(autoplayTimer);
      startAutoplay();
    }

    startAutoplay();

    // Soporte táctil Swipe para celular
    let startX = 0;
    let endX = 0;

    track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          goToSlide(currentIndex + 1); // Deslizó a la izquierda -> siguiente
        } else {
          goToSlide(currentIndex - 1); // Deslizó a la derecha -> anterior
        }
        resetAutoplay();
      }
    }, { passive: true });
  }

  // 3. Filtrado rápido de catálogo de Productos y Servicios
  const tabButtons = document.querySelectorAll('.tab-btn');
  const categories = document.querySelectorAll('.catalog-category');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      categories.forEach(cat => {
        if (filter === 'todos' || cat.getAttribute('data-category') === filter) {
          cat.style.display = 'block';
        } else {
          cat.style.display = 'none';
        }
      });
    });
  });

  // 4. Botones de copia al portapapeles (Footer) con Toast
  const copyButtons = document.querySelectorAll('.copy-btn');
  const toast = document.getElementById('toast');

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  copyButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const textToCopy = btn.getAttribute('data-copy');
      const label = btn.getAttribute('data-label') || 'Dato';

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(textToCopy);
        } else {
          // Fallback tradicional
          const textArea = document.createElement('textarea');
          textArea.value = textToCopy;
          textArea.style.position = 'fixed';
          textArea.style.left = '-9999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        }

        // Estado visual del botón
        const originalText = btn.innerHTML;
        btn.classList.add('copied');
        btn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          ¡Copiado!
        `;
        showToast(`✔ ${label} copiado al portapapeles: ${textToCopy}`);

        setTimeout(() => {
          btn.classList.remove('copied');
          btn.innerHTML = originalText;
        }, 2200);

      } catch (err) {
        showToast(`Error al copiar: ${textToCopy}`);
      }
    });
  });

  // 5. Manejo del Formulario de Contacto
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('formName').value.trim();
      const phone = document.getElementById('formPhone').value.trim();
      const email = document.getElementById('formEmail').value.trim();
      const message = document.getElementById('formMessage').value.trim();

      // Construcción del mailto como acción por defecto en cliente
      const subject = encodeURIComponent(`Consulta Web Tecnomeyn de ${name}`);
      const body = encodeURIComponent(
        `Nombre: ${name}\nTeléfono: ${phone}\nCorreo: ${email}\n\nMensaje:\n${message}`
      );

      // Feedback visual
      if (formSuccess) {
        formSuccess.classList.add('is-visible');
        formSuccess.style.display = 'block';
        contactForm.reset();
      }

      // Abre el cliente de correo predeterminado del usuario
      setTimeout(() => {
        window.location.href = `mailto:fedeacostawork@gmail.com?subject=${subject}&body=${body}`;
      }, 600);
    });
  }

  // 6. Resaltar enlace de navegación según sección visible (Scrollspy ligero)
  const sections = document.querySelectorAll('section[id], footer[id]');
  window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });
});
