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

  // Animación de aparición para las secciones
  const observerOptions = {
    threshold: 0.2,
    rootMargin: "0px 0px -100px 0px"
  };

  const fadeInElements = document.querySelectorAll('.about-grid, .skills-grid, .experience-container, .education-container');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = 1;
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
