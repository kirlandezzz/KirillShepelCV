document.addEventListener('DOMContentLoaded', () => {
  // Animación de texto del hero
  const heroTitle = document.querySelector('.hero-title');

  if (heroTitle) {
    const originalText = heroTitle.textContent;

    // Dividir el texto en palabras
    const words = originalText.split(' ');

    // Crear un contenedor para la animación
    const animationContainer = document.createElement('div');
    animationContainer.style.position = 'relative';
    animationContainer.style.width = '100%';
    animationContainer.style.height = 'auto';
    animationContainer.style.wordWrap = 'break-word';
    animationContainer.style.wordBreak = 'keep-all';
    animationContainer.style.overflowWrap = 'break-word';
    animationContainer.style.hyphens = 'none';

    // Crear un elemento invisible que mantendrá el espacio para el texto original
    const placeholderText = document.createElement('div');
    placeholderText.textContent = originalText;
    placeholderText.style.visibility = 'hidden';
    placeholderText.style.position = 'absolute';
    placeholderText.style.top = '0';
    placeholderText.style.left = '0';
    placeholderText.style.width = '100%';
    placeholderText.style.height = '100%';
    placeholderText.style.wordWrap = 'break-word';
    placeholderText.style.wordBreak = 'keep-all';
    placeholderText.style.overflowWrap = 'break-word';
    placeholderText.style.hyphens = 'none';
    placeholderText.style.pointerEvents = 'none';

    // Crear un contenedor para el texto animado
    const animatedTextContainer = document.createElement('div');
    animatedTextContainer.style.position = 'relative';
    animatedTextContainer.style.width = '100%';
    animatedTextContainer.style.height = 'auto';
    animatedTextContainer.style.wordWrap = 'break-word';
    animatedTextContainer.style.wordBreak = 'keep-all';
    animatedTextContainer.style.overflowWrap = 'break-word';
    animatedTextContainer.style.hyphens = 'none';

    // Crear un elemento span para el cursor
    const cursor = document.createElement('span');
    cursor.classList.add('cursor');
    cursor.innerHTML = '|';
    cursor.style.opacity = '1';
    cursor.style.marginLeft = '1px';
    cursor.style.animation = 'cursorBlink 1s infinite';

    // Añadir estilos para la animación del cursor y palabras
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes cursorBlink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }

      .hero-title .word-container {
        display: inline-block;
        margin-right: 8px;
        margin-bottom: 5px;
        vertical-align: top;
      }

      .hero-title .revealed {
        display: inline-block;
        position: relative;
      }

      .hero-title .revealed::after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 100%;
        height: 100%;
        background-color: var(--color-light);
        transform-origin: right;
        animation: revealText 0.5s forwards;
      }

      @keyframes revealText {
        from { transform: scaleX(1); }
        to { transform: scaleX(0); }
      }

      /* Asegurar que el hero title mantenga palabras completas */
      .hero-title {
        word-wrap: break-word;
        word-break: keep-all;
        overflow-wrap: break-word;
        hyphens: none;
        white-space: normal;
      }

      /* Estilos para el header con animación */
      .header {
        transition: transform 0.3s ease;
      }

      .header-hidden {
        transform: translateY(-100%);
      }

      .header-visible {
        transform: translateY(0);
      }
    `;
    document.head.appendChild(style);

    // Limpiar el heroTitle y añadir nuestra estructura
    heroTitle.textContent = '';
    animationContainer.appendChild(animatedTextContainer);
    heroTitle.appendChild(animationContainer);

    // Función para añadir palabras una por una
    const revealWord = (wordIndex = 0, charIndex = 0) => {
      if (wordIndex < words.length) {
        const currentWord = words[wordIndex];

        // Si estamos empezando una nueva palabra, crear un contenedor para ella
        if (charIndex === 0) {
          const wordContainer = document.createElement('div');
          wordContainer.classList.add('word-container');
          wordContainer.setAttribute('data-word', currentWord);
          animatedTextContainer.appendChild(wordContainer);
        }

        // Obtener el contenedor de la palabra actual
        const wordContainer = animatedTextContainer.lastChild;

        if (charIndex < currentWord.length) {
          // Crear un span para cada carácter
          const charSpan = document.createElement('span');
          charSpan.classList.add('revealed');
          charSpan.textContent = currentWord.charAt(charIndex);

          // Añadir el carácter al contenedor de la palabra
          wordContainer.appendChild(charSpan);

          // Añadir el cursor después del último carácter
          if (cursor.parentNode) {
            cursor.parentNode.removeChild(cursor);
          }
          wordContainer.appendChild(cursor);

          // Programar la adición del siguiente carácter
          setTimeout(() => {
            revealWord(wordIndex, charIndex + 1);
          }, 80); // Velocidad de la animación (ms entre caracteres)
        } else {
          // Palabra completa, continuar con la siguiente palabra
          setTimeout(() => {
            revealWord(wordIndex + 1, 0);
          }, 100); // Pequeña pausa entre palabras
        }
      }
    };

    // Iniciar la animación con un pequeño retraso
    setTimeout(() => {
      revealWord();
    }, 500);
  }

  // Control del header al hacer scroll
  const header = document.querySelector('.header');
  const hero = document.querySelector('.hero');

  if (header && hero) {
    let lastScrollY = window.scrollY;
    let scrollingDown = true;
    let headerVisible = true;
    let pastHero = false;

    // Función para actualizar la visibilidad del header
    const updateHeaderVisibility = () => {
      const heroBottom = hero.offsetTop + hero.offsetHeight;
      const currentScrollY = window.scrollY;

      // Determinar dirección de scroll
      scrollingDown = currentScrollY > lastScrollY;

      // Determinar si hemos pasado el hero
      pastHero = currentScrollY > heroBottom - 100; // Un poco antes del final para una transición más suave

      // Lógica para mostrar/ocultar el header
      if (pastHero) {
        if (scrollingDown && headerVisible) {
          // Ocultar header al hacer scroll hacia abajo pasado el hero
          header.classList.add('header-hidden');
          header.classList.remove('header-visible');
          headerVisible = false;
        } else if (!scrollingDown && !headerVisible) {
          // Mostrar header al hacer scroll hacia arriba
          header.classList.remove('header-hidden');
          header.classList.add('header-visible');
          headerVisible = true;
        }
      } else {
        // Siempre visible en el hero
        header.classList.remove('header-hidden');
        header.classList.add('header-visible');
        headerVisible = true;
      }

      // Actualizar posición actual
      lastScrollY = currentScrollY;
    };

    // Añadir clase inicial
    header.classList.add('header-visible');

    // Evento scroll con throttling para mejor rendimiento
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateHeaderVisibility();
          ticking = false;
        });
        ticking = true;
      }
    });
  }


// Animación de aparición para las secciones
const observerOptions = {
  threshold: 0.2,
  rootMargin: "0px 0px -100px 0px"
};


const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = 0.1;
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

fadeInElements.forEach(element => {
  element.style.opacity = 0;
  element.style.transform = 'translateY(20px)';
  element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
  observer.observe(element);
});
});

// Función para ajustar la imagen de perfil
document.addEventListener('DOMContentLoaded', () => {
  const adjustProfileImage = () => {
    const aboutImage = document.querySelector('.about-image');
    const aboutImageContainer = document.querySelector('.about-image-container');

    if (aboutImage && aboutImageContainer) {
      // Eliminar estilos inline que puedan estar interfiriendo
      aboutImage.style.removeProperty('height');
      aboutImage.style.width = '100%';
      aboutImage.style.height = 'auto';
      aboutImage.style.objectFit = 'contain';
      aboutImage.style.maxWidth = '100%';

      // Asegurar que el contenedor se ajuste al tamaño de la imagen
      aboutImageContainer.style.height = 'auto';
      aboutImageContainer.style.maxHeight = 'none';
      aboutImageContainer.style.overflow = 'visible';

      // Asegurarse de que la imagen se cargue completamente
      aboutImage.onload = function() {
        // Actualizar altura del contenedor si es necesario
        aboutImageContainer.style.height = 'auto';
      };
    }
  };

  // Ejecutar ajuste al cargar la página
  adjustProfileImage();

  // También ejecutar el ajuste cuando cambie el tamaño de la ventana
  window.addEventListener('resize', adjustProfileImage);
});

// Añadir al final de animations.js

// Función para hacer el header más compacto al hacer scroll
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.header');
  let scrollThreshold = 100; // Umbral para activar el header compacto

  // Función para actualizar la clase del header basado en la posición de scroll
  function updateHeaderCompactness() {
    if (window.scrollY > scrollThreshold) {
      header.classList.add('compact');
    } else {
      header.classList.remove('compact');
    }
  }

  // Verificar el scroll inicial
  updateHeaderCompactness();

  // Actualizar en scroll con throttling para mejor rendimiento
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateHeaderCompactness();
        ticking = false;
      });
      ticking = true;
    }
  });

  // Ajustar el tamaño del texto para diferentes dispositivos
  const adjustTextForDevice = () => {
    const isMobile = window.innerWidth <= 767;
    const isTablet = window.innerWidth > 767 && window.innerWidth <= 1024;
    const isSmallMobile = window.innerWidth <= 480;

    // Ajustar velocidad de la animación de texto en dispositivos móviles
    if (typeof revealWord === 'function') {
      // Si estamos en un dispositivo móvil, cambiar la velocidad de animación
      const charSpeed = isSmallMobile ? 50 : isMobile ? 60 : isTablet ? 70 : 80;
      const wordPause = isSmallMobile ? 70 : isMobile ? 80 : isTablet ? 90 : 100;

      // Esta modificación asume que tenemos acceso a estas variables,
      // si no es así, se puede implementar como una actualización al código existente
      window.animationSpeeds = {
        charSpeed: charSpeed,
        wordPause: wordPause
      };
    }

    // Ajustar padding de contenedores en dispositivos móviles
    const containers = document.querySelectorAll('.container');
    containers.forEach(container => {
      if (isSmallMobile) {
        container.style.padding = '0 15px';
      } else if (isMobile) {
        container.style.padding = '0 20px';
      } else {
        container.style.padding = '0 30px';
      }
    });
  };

  // Ejecutar ajustes de texto inicialmente
  adjustTextForDevice();

  // Actualizar cuando cambie el tamaño de la ventana
  window.addEventListener('resize', adjustTextForDevice);

  // Ajuste específico para el menú móvil
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');

  if (menuToggle && nav) {
    // Cerrar menú al hacer clic en un enlace (mejorar experiencia móvil)
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        document.body.classList.remove('menu-open');
      });
    });

    // Cerrar menú al hacer scroll (mejorar experiencia móvil)
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
      // Solo aplicar en móviles
      if (window.innerWidth <= 767) {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Si hacemos scroll más de 50px, cerrar el menú
        if (Math.abs(scrollTop - lastScrollTop) > 50) {
          document.body.classList.remove('menu-open');
          lastScrollTop = scrollTop;
        }
      }
    });
  }
});

// Optimizar la carga de imágenes para mejor rendimiento en móviles
document.addEventListener('DOMContentLoaded', () => {
  // Función para optimizar la carga de imágenes para móviles
  const optimizeImagesForMobile = () => {
    const isMobile = window.innerWidth <= 767;
    const images = document.querySelectorAll('img');

    images.forEach(img => {
      // Solo aplicar a imágenes que no son íconos o logos pequeños
      if (img.width > 100 || img.height > 100) {
        if (isMobile) {
          // Añadir atributo loading=lazy si no lo tiene
          if (!img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
          }

          // Prioridad para la imagen principal si está en la vista
          if (img.classList.contains('about-image')) {
            img.setAttribute('fetchpriority', 'high');
          }
        }
      }
    });
  };

  // Ejecutar optimización de imágenes
  optimizeImagesForMobile();

  // También optimizar cuando cambie el tamaño
  window.addEventListener('resize', optimizeImagesForMobile);
});



document.addEventListener('DOMContentLoaded', () => {
  // Specific adjustments for laptop displays (above 1024px)
  const optimizeForLaptop = () => {
    const isLaptop = window.innerWidth > 1024;
    const isWideScreen = window.innerWidth >= 1440;

    if (isLaptop) {
      // Adjust hero text animation speed for laptop screens
      if (window.animationSpeeds) {
        window.animationSpeeds.charSpeed = isWideScreen ? 90 : 85;
        window.animationSpeeds.wordPause = isWideScreen ? 120 : 110;
      }

      // Enhance scrolling smoothness on larger displays
      document.documentElement.style.scrollBehavior = 'smooth';

      // Set header threshold based on screen size
      scrollThreshold = isWideScreen ? 150 : 120;

      // Make sure images scale properly on larger screens
      const aboutImage = document.querySelector('.about-image');
      if (aboutImage) {
        aboutImage.style.maxHeight = isWideScreen ? '700px' : '650px';
        aboutImage.style.objectFit = 'cover';
      }

      // Adjust container padding based on width for better proportions
      const containers = document.querySelectorAll('.container');
      containers.forEach(container => {
        if (isWideScreen) {
          container.style.padding = '0 50px';
        } else {
          container.style.padding = '0 40px';
        }
      });
    }
  };

  // Run initially and on resize
  optimizeForLaptop();
  window.addEventListener('resize', optimizeForLaptop);

  // Fix for section animations on laptop screens
  const fadeInElements = document.querySelectorAll('.about-grid, .skills-grid, .experience-container, .education-container');

  // Enhanced intersection observer for smoother animations on larger screens
  const observerOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -120px 0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Start with more opacity on larger screens for smoother fade-in
        if (window.innerWidth > 1024) {
          entry.target.style.opacity = 0.1;
        } else {
          entry.target.style.opacity = 0;
        }

        // Apply transition with delay based on screen size
        const delay = window.innerWidth > 1440 ? '0.2s' : '0.1s';
        entry.target.style.transition = `opacity 0.8s ease-out ${delay}, transform 0.8s ease-out ${delay}`;

        // Trigger animation
        setTimeout(() => {
          entry.target.style.opacity = 1;
          entry.target.style.transform = 'translateY(0)';
        }, 100);

        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  fadeInElements.forEach(element => {
    element.style.opacity = 0;
    element.style.transform = 'translateY(20px)';
    observer.observe(element);
  });
});
// Add this to your animations.js file

document.addEventListener('DOMContentLoaded', () => {
  // Image reveal effect for profile photo
  const profileImage = document.querySelector('.about-image');
  const aboutSection = document.getElementById('about');

  if (profileImage && aboutSection) {
    // Create wrapper for the effect
    const imageWrapper = document.createElement('div');
    imageWrapper.classList.add('image-effect-wrapper');

    // Set initial styles for the wrapper
    imageWrapper.style.position = 'relative';
    imageWrapper.style.overflow = 'hidden';
    imageWrapper.style.width = '100%';
    imageWrapper.style.height = '100%';

    // Move the image into the wrapper
    profileImage.parentNode.insertBefore(imageWrapper, profileImage);
    imageWrapper.appendChild(profileImage);

    // Create the overlay
    const overlay = document.createElement('div');
    overlay.classList.add('image-reveal-overlay');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.transformOrigin = 'left';
    overlay.style.zIndex = '1';
    imageWrapper.appendChild(overlay);

    // Set initial image styles
    profileImage.style.transform = 'scale(1.1)';
    profileImage.style.transition = 'transform 1.5s ease-out';
    profileImage.style.filter = 'grayscale(80%)';

    // Create the intersection observer
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Animate the overlay
          overlay.style.transition = 'transform 1.2s cubic-bezier(0.77, 0, 0.175, 1)';
          overlay.style.transform = 'scaleX(0)';

          // Animate the image
          setTimeout(() => {
            profileImage.style.transform = 'scale(1)';
            profileImage.style.filter = 'grayscale(0%)';
          }, 300);

          // Stop observing after animation
          imageObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    // Start observing the image wrapper
    imageObserver.observe(imageWrapper);
  }
});
