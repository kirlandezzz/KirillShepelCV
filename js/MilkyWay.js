// GalaxiaCubo3D-Cercana.js
document.addEventListener('DOMContentLoaded', () => {
  // Obtener la sección hero para añadir nuestro canvas
  const seccionHero = document.querySelector('.hero');

  if (!seccionHero) return;

  // Detectar capacidades del dispositivo para configuración responsiva
  const deteccionDispositivo = {
    esMovil: false,
    esBajaPotencia: false,
    esVertical: window.innerHeight > window.innerWidth,
    relacionPixeles: window.devicePixelRatio || 1,

    // Detectar dispositivos móviles de manera más confiable
    detectar: function() {
      // Verificar capacidad táctil como indicador principal
      const tienePantallaTactil = (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia("(pointer: coarse)").matches
      );

      // Verificar tamaño de pantalla
      const esPantallaChica = window.innerWidth < 768;

      // Actualizar estado del dispositivo
      this.esMovil = tienePantallaTactil || esPantallaChica;

      // Detectar dispositivos de baja potencia
      this.esBajaPotencia = this.esMovil && (
        this.relacionPixeles < 2 ||
        (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)
      );

      // Actualizar orientación
      this.esVertical = window.innerHeight > window.innerWidth;

      return this;
    }
  }.detectar();

  // Salir temprano si es un dispositivo móvil
  if (deteccionDispositivo.esMovil) {
    // Establecer un fondo degradado 3D para móviles
    seccionHero.style.background = degradado;
    return;
  }

  // Crear elemento canvas
  const lienzo = document.createElement('canvas');
  lienzo.classList.add('galaxia-canvas');

  // Configurar estilos del canvas
  lienzo.style.position = 'absolute';
  lienzo.style.top = '0';
  lienzo.style.left = '0';
  lienzo.style.width = '100%';
  lienzo.style.height = '100%';
  lienzo.style.zIndex = '0';

  // Insertar canvas como el primer hijo de la sección hero
  seccionHero.insertBefore(lienzo, seccionHero.firstChild);

  // Hacer que el contenedor hero tenga posición relativa y aumentar z-index
  const contenedorHero = seccionHero.querySelector('.hero-container');
  if (contenedorHero) {
    contenedorHero.style.position = 'relative';
    contenedorHero.style.zIndex = '1';
  }

  // Configuración mejorada de la galaxia cúbica 3D - AJUSTADA PARA VISIÓN CERCANA
  const GALAXIA = {
    // Más partículas para mayor densidad visual y detalle cercano
    cantidadParticulas: deteccionDispositivo.esBajaPotencia ? 1800 :
      deteccionDispositivo.esMovil ? 3000 : 7000,

    // Ajustar tamaño de voxel para vista cercana
    tamanoBaseVoxel: deteccionDispositivo.esMovil ? 2.2 : 2.8,
    tamanoAgregadoVoxel: deteccionDispositivo.esMovil ? 1.0 : 2.0,

    // Paleta de colores cibernética - Más variada para vista cercana
    colores: [
      '#4aeaff', // Azul cian brillante
      '#7c4dff', // Púrpura vibrante
      '#ff3aad', // Rosa neón
      '#ffcb3c', // Ámbar luminoso
      '#32ff7e', // Verde neón
      '#d2f1ff', // Blanco azulado
      '#e8d1ff'  // Lila claro
    ],

    // Estructura de la galaxia - Más brazos para vista cercana
    cantidadBrazos: deteccionDispositivo.esBajaPotencia ? 4 : 7,
    thetaBrazo: 0.75,
    probabilidadEstrellaEspecial: deteccionDispositivo.esMovil ? 0.25 : 0.3,

    // Bloques de "nubes" para simular estructura voxelizada - Más para vista cercana
    cantidadBloques: deteccionDispositivo.esBajaPotencia ? 70 :
      deteccionDispositivo.esMovil ? 120 : 220,

    // Configuración específica 3D - AJUSTADA PARA VISTA CERCANA
    radioMaximo: Math.min(window.innerWidth, window.innerHeight) *
      (deteccionDispositivo.esMovil ? 0.4 : 0.45), // Radio menor para vista más cercana
    zMaximo: deteccionDispositivo.esMovil ? 350 : 450,
    distanciaVista: deteccionDispositivo.esMovil ? 500 : 600, // Más cercana
    campoVision: 85, // Mayor para efecto 3D más pronunciado en visión cercana

    // Configuración de movimiento - Más lenta para vista cercana
    velocidadRotacion: 0.00015,
    periodoOrbital: 45000,
    factorInercia: deteccionDispositivo.esMovil ? 0.94 : 0.96,
    velocidadZoom: deteccionDispositivo.esMovil ? 0.05 : 0.07,
    zoomMaximo: deteccionDispositivo.esMovil ? 3.0 : 4.0, // Permitir más zoom
    zoomMinimo: 1.0, // Zoom mínimo más cercano

    // Estructura de galaxia - más gruesa para enfatizar 3D
    grosorDisco: deteccionDispositivo.esMovil ? 0.25 : 0.28,
    tamanoBulbo: 0.22,
    compactacionBrazos: 0.85,

    // Optimizaciones de rendimiento
    calidadRenderizado: deteccionDispositivo.esBajaPotencia ? 'baja' :
      deteccionDispositivo.esMovil ? 'media' : 'alta',

    // Corte de distancia de dibujo
    tamanoMinimoDibujo: deteccionDispositivo.esBajaPotencia ? 0.6 :
      deteccionDispositivo.esMovil ? 0.5 : 0.4,

    // Efecto de estela
    velocidadDesvanecimiento: deteccionDispositivo.esBajaPotencia ? 0.25 :
      deteccionDispositivo.esMovil ? 0.2 : 0.15,

    // Velocidad de rotación automática - Más lenta para apreciar detalles
    velocidadAutoRotacion: deteccionDispositivo.esMovil ? 0.00004 : 0.00006,

    // Gestión de velocidad de fotogramas
    fpsPredeterminados: deteccionDispositivo.esBajaPotencia ? 30 : 60,

    // Configuración específica para voxels
    usarVoxels: true,
    tamanoVoxel: deteccionDispositivo.esMovil ? 2.8 : 3.8, // Más grande para mejor vista cercana
    radioVoxel: 1.2, // Relación entre ancho/alto de los voxels
    grosorVoxel: 0.8, // Relación entre profundidad y altura

    // Efectos de sombreado para mejorar el 3D
    usarSombreado3D: true,
    intensidadSombra: 0.65,

    // Usar grilla para efectos de espacio
    mostrarGrilla: true,
    distanciaGrilla: 80, // Más cercana para vista detallada
    opacidadGrilla: 0.18
  };

  // Estado de la cámara - CONFIGURADO PARA VISIÓN CERCANA
  const camara = {
    x: 0,
    y: 0,
    z: -GALAXIA.distanciaVista,
    rotacionX: 0.5, // Mayor inclinación para vista cercana
    rotacionY: 0.1, // Rotación inicial ligeramente modificada
    rotacionZ: 0,
    zoom: 1.8, // ZOOM INICIAL MÁS CERCANO
    rotacionObjetivoX: 0.5,
    rotacionObjetivoY: 0.1,
    zoomObjetivo: 1.8, // ZOOM OBJETIVO MÁS CERCANO
    velocidad: { x: 0, y: 0, z: 0 },
    suavizado: deteccionDispositivo.esBajaPotencia ? 0.12 : 0.06
  };

  // Estado de interacción
  const interaccion = {
    estaActiva: false,
    inicioX: 0,
    inicioY: 0,
    ultimoX: 0,
    ultimoY: 0,
    velX: 0,
    velY: 0,
    inicioPellizco: 0,
    distanciaPellizco: 0,
    estaPellizco: false,
    ultimoTiempoInteraccion: 0,
    ultimoTiempoToque: 0,
    dobleToqueDetectado: false,
    umbraDeslizamiento: 50,
    inicioDeslizamientoX: 0,
    inicioDeslizamientoY: 0,
    desplazamientoDetectado: false
  };

  // Operaciones matriciales para transformaciones 3D
  const Matriz = {
    rotarX: function(angulo) {
      const cos = Math.cos(angulo);
      const sin = Math.sin(angulo);
      return [
        1, 0, 0, 0,
        0, cos, -sin, 0,
        0, sin, cos, 0,
        0, 0, 0, 1
      ];
    },

    rotarY: function(angulo) {
      const cos = Math.cos(angulo);
      const sin = Math.sin(angulo);
      return [
        cos, 0, sin, 0,
        0, 1, 0, 0,
        -sin, 0, cos, 0,
        0, 0, 0, 1
      ];
    },

    rotarZ: function(angulo) {
      const cos = Math.cos(angulo);
      const sin = Math.sin(angulo);
      return [
        cos, -sin, 0, 0,
        sin, cos, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ];
    },

    multiplicarPunto: function(matriz, punto) {
      const [x, y, z] = punto;
      const w = 1;

      return [
        matriz[0] * x + matriz[1] * y + matriz[2] * z + matriz[3] * w,
        matriz[4] * x + matriz[5] * y + matriz[6] * z + matriz[7] * w,
        matriz[8] * x + matriz[9] * y + matriz[10] * z + matriz[11] * w,
        matriz[12] * x + matriz[13] * y + matriz[14] * z + matriz[15] * w
      ];
    },

    multiplicarMatrices: function(a, b) {
      const resultado = new Array(16);

      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          resultado[i * 4 + j] =
            a[i * 4] * b[j] +
            a[i * 4 + 1] * b[4 + j] +
            a[i * 4 + 2] * b[2 * 4 + j] +
            a[i * 4 + 3] * b[3 * 4 + j];
        }
      }

      return resultado;
    }
  };

  // Utilidades de rendimiento
  const Rendimiento = {
    ultimoTiempoFrame: 0,
    contadorFrames: 0,
    ultimoTiempoActualizacionFps: 0,
    fpsActuales: 0,

    deberiaRenderizarFrame: function(tiempoActual) {
      if (!deteccionDispositivo.esMovil) return true;

      const tiempoFramePredeterminado = 1000 / GALAXIA.fpsPredeterminados;
      const transcurrido = tiempoActual - this.ultimoTiempoFrame;

      if (transcurrido < tiempoFramePredeterminado) return false;

      this.ultimoTiempoFrame = tiempoActual;

      this.contadorFrames++;
      if (tiempoActual - this.ultimoTiempoActualizacionFps > 1000) {
        this.fpsActuales = this.contadorFrames;
        this.contadorFrames = 0;
        this.ultimoTiempoActualizacionFps = tiempoActual;
      }

      return true;
    },

    conteoRenderizadoParticulas: function() {
      if (!deteccionDispositivo.esMovil) return GALAXIA.cantidadParticulas;

      const estaInteractuando = Date.now() - interaccion.ultimoTiempoInteraccion < 200;
      return estaInteractuando ?
        Math.floor(GALAXIA.cantidadParticulas * 0.6) :
        GALAXIA.cantidadParticulas;
    },

    conteoRenderizadoBloques: function() {
      if (!deteccionDispositivo.esMovil) return GALAXIA.cantidadBloques;

      const estaInteractuando = Date.now() - interaccion.ultimoTiempoInteraccion < 200;
      return estaInteractuando ?
        Math.floor(GALAXIA.cantidadBloques * 0.5) :
        GALAXIA.cantidadBloques;
    }
  };

  // Función para generar un color basado en profundidad para sombreado 3D
  const generarColorSombreado = (colorBase, factorProfundidad) => {
    // Convertir color hex a valores RGB
    const r = parseInt(colorBase.slice(1, 3), 16);
    const g = parseInt(colorBase.slice(3, 5), 16);
    const b = parseInt(colorBase.slice(5, 7), 16);

    // Calcular nuevo color con sombreado basado en profundidad
    const nuevoR = Math.max(0, Math.min(255, Math.floor(r * factorProfundidad)));
    const nuevoG = Math.max(0, Math.min(255, Math.floor(g * factorProfundidad)));
    const nuevoB = Math.max(0, Math.min(255, Math.floor(b * factorProfundidad)));

    // Convertir de nuevo a hex
    return `#${nuevoR.toString(16).padStart(2, '0')}${nuevoG.toString(16).padStart(2, '0')}${nuevoB.toString(16).padStart(2, '0')}`;
  };

  // Clase de Elemento de Galaxia 3D para voxels - MEJORADA PARA VISTA CERCANA
  class ElementoGalaxia3D {
    constructor(opciones) {
      // Posición en espacio 3D
      this.x = opciones.x || 0;
      this.y = opciones.y || 0;
      this.z = opciones.z || 0;

      // Posición original para referencia
      this.originalX = this.x;
      this.originalY = this.y;
      this.originalZ = this.z;

      // Posición proyectada en pantalla
      this.pantallaX = 0;
      this.pantallaY = 0;

      // Propiedades visuales
      this.tamano = opciones.tamano || 1;
      this.tamanoBase = this.tamano;
      this.color = opciones.color || '#ffffff';
      this.brillo = opciones.brillo || 1;

      // Propiedades de movimiento
      this.indiceBrazo = opciones.indiceBrazo || 0;
      this.radio = opciones.radio || 1;
      this.angulo = opciones.angulo || 0;
      this.velocidadOrbital = opciones.velocidadOrbital || 0.001;

      // Efectos especiales
      this.velocidadParpadeo = Math.random() * 0.05 + 0.01;
      this.cantidadParpadeo = Math.random() * 0.8 + 0.2;
      this.faseParpadeo = Math.random() * Math.PI * 2;

      // Tipo - voxel, bloque, etc.
      this.tipo = opciones.tipo || 'voxel';

      // Propiedades específicas para diferentes tipos
      if (this.tipo === 'bloque') {
        this.opacidad = opciones.opacidad || 0.5;
        this.ancho = opciones.ancho || 80;
        this.alto = opciones.alto || 40;
        this.profundidad = opciones.profundidad || 40;
        this.rotacion = opciones.rotacion || 0;
        this.rotacionX = Math.random() * Math.PI * 0.1;
        this.rotacionY = Math.random() * Math.PI * 0.1;
        this.rotacionZ = Math.random() * Math.PI * 0.1;

        // Más detalles para vista cercana
        this.tieneDetalles = Math.random() > 0.3;
        this.detalleTipo = Math.floor(Math.random() * 3);
      } else if (this.tipo === 'voxel') {
        // Propiedades de voxel
        this.ancho = this.tamano * GALAXIA.radioVoxel;
        this.alto = this.tamano;
        this.profundidad = this.tamano * GALAXIA.grosorVoxel;
        this.rotacionX = Math.random() * Math.PI * 0.2;
        this.rotacionY = Math.random() * Math.PI * 0.2;
        this.rotacionZ = Math.random() * Math.PI * 0.2;
        this.caras = [
          { idx: 0, visible: true, sombreado: 1.0 },   // Frente
          { idx: 1, visible: true, sombreado: 0.85 },  // Derecha
          { idx: 2, visible: true, sombreado: 0.7 },   // Atrás
          { idx: 3, visible: true, sombreado: 0.75 },  // Izquierda
          { idx: 4, visible: true, sombreado: 0.9 },   // Arriba
          { idx: 5, visible: true, sombreado: 0.65 }   // Abajo
        ];

        // Más detalles para vista cercana
        this.esEspecial = Math.random() > 0.8;
        this.tienePatron = Math.random() > 0.7;
        this.patronTipo = Math.floor(Math.random() * 3);
      }

      // Escala basada en profundidad
      this.escalaDepth = 1;

      // Optimización: precalcular algunos valores
      this.ultimaActualizacion = 0;

      // Optimización para móvil: verificación de visibilidad para omitir partículas fuera de pantalla
      this.esVisible = true;
      this.estaEnFrustum = true;

      // Para renderizado eficiente - seguir si este elemento debe ser renderizado
      this.debeRenderizar = true;
    }

    // Actualizar posición con transformaciones 3D completas
    actualizar(tiempo, camara) {
      // Optimización para móvil: Omitir actualizaciones menores en dispositivos de baja potencia
      if (deteccionDispositivo.esBajaPotencia && this.ultimaActualizacion > 0) {
        const transcurrido = tiempo - this.ultimaActualizacion;
        if (transcurrido < 50) {
          return;
        }
      }
      this.ultimaActualizacion = tiempo;

      // Aplicar movimiento orbital
      if (this.tipo === 'voxel') {
        const factorOrbital = 1 - (this.radio / GALAXIA.radioMaximo) * 0.8;
        this.angulo += this.velocidadOrbital * factorOrbital;

        // Actualizar posición basada en movimiento orbital
        this.originalX = Math.cos(this.angulo) * this.radio;
        this.originalY = Math.sin(this.angulo) * this.radio;
      } else if (this.tipo === 'bloque') {
        if (!deteccionDispositivo.esMovil || tiempo % 3 === 0) {
          this.angulo += this.velocidadOrbital * 0.3;
          this.originalX = Math.cos(this.angulo) * this.radio;
          this.originalY = Math.sin(this.angulo) * this.radio;
          this.rotacionX += 0.0004;
          this.rotacionY += 0.0003;
          this.rotacionZ += 0.0005;
        }
      }

      // Aplicar efecto de parpadeo
      const factorParpadeo = deteccionDispositivo.esMovil ? 0.8 : 1.2;
      this.faseParpadeo += this.velocidadParpadeo;
      const parpadeo = 1 + (this.cantidadParpadeo * Math.sin(this.faseParpadeo) * factorParpadeo);
      this.tamano = this.tamanoBase * parpadeo;

      // Actualizar dimensiones de voxel
      if (this.tipo === 'voxel') {
        this.ancho = this.tamano * GALAXIA.radioVoxel;
        this.alto = this.tamano;
        this.profundidad = this.tamano * GALAXIA.grosorVoxel;
      }

      // Crear matriz de rotación combinada
      const matRotX = Matriz.rotarX(camara.rotacionX);
      const matRotY = Matriz.rotarY(camara.rotacionY);
      const matRotZ = Matriz.rotarZ(camara.rotacionZ);

      // Combinar rotaciones: primero X, luego Y, luego Z
      let matrizCombinada = Matriz.multiplicarMatrices(matRotX, matRotY);
      matrizCombinada = Matriz.multiplicarMatrices(matrizCombinada, matRotZ);

      // Aplicar rotación a posición
      const puntoTransformado = Matriz.multiplicarPunto(matrizCombinada,
        [this.originalX, this.originalY, this.originalZ]);

      // Almacenar coordenadas transformadas
      this.x = puntoTransformado[0];
      this.y = puntoTransformado[1];
      this.z = puntoTransformado[2];

      // Aplicar posición y zoom de cámara
      const zoomedX = this.x * camara.zoom;
      const zoomedY = this.y * camara.zoom;
      const zoomedZ = this.z * camara.zoom + camara.z;

      // Verificar si está detrás de la cámara
      if (zoomedZ >= -1) {
        this.estaEnFrustum = false;
        return;
      }
      this.estaEnFrustum = true;

      // Proyección de perspectiva
      const perspectiva = GALAXIA.distanciaVista / (GALAXIA.distanciaVista - zoomedZ);
      this.pantallaX = zoomedX * perspectiva;
      this.pantallaY = zoomedY * perspectiva;

      // Almacenar escala de profundidad para dibujo
      this.escalaDepth = perspectiva;

      // Actualizar visibilidad de caras para voxels
      if (!(this.tipo === 'voxel' && GALAXIA.usarSombreado3D)) {
      } else {
        // Determinar qué caras son visibles basado en ángulo de vista
        Math.atan2(this.y, this.x);
        Math.atan2(this.z, Math.sqrt(this.x * this.x + this.y * this.y));
// Frente/atrás
        if (this.x > 0) {
          this.caras[0].visible = false; // Atrás no visible
          this.caras[2].visible = true;  // Frente visible
        } else {
          this.caras[0].visible = true;  // Frente visible
          this.caras[2].visible = false; // Atrás no visible
        }

        // Izquierda/derecha
        if (this.y > 0) {
          this.caras[1].visible = false; // Izquierda no visible
          this.caras[3].visible = true;  // Derecha visible
        } else {
          this.caras[1].visible = true;  // Izquierda visible
          this.caras[3].visible = false; // Derecha no visible
        }

        // Arriba/abajo
        if (this.z > 0) {
          this.caras[4].visible = false; // Abajo no visible
          this.caras[5].visible = true;  // Arriba visible
        } else {
          this.caras[4].visible = true;  // Arriba visible
          this.caras[5].visible = false; // Abajo no visible
        }
      }

      // Calcular brillo basado en posición para efecto volumétrico
      const distanciaDesdeElCentro = Math.sqrt(
        this.originalX * this.originalX +
        this.originalY * this.originalY +
        this.originalZ * this.originalZ
      );

      // Normalizar distancia (0 = centro, 1 = radio máximo)
      const distanciaNormalizada = Math.min(1, distanciaDesdeElCentro / GALAXIA.radioMaximo);

      // Brillo basado en distancia
      const factorBrilloCentral = deteccionDispositivo.esMovil ? 0.5 : 0.6;
      this.brillo = Math.max(0.3, 1 - distanciaNormalizada * factorBrilloCentral);

      // Verificar si debemos renderizar este elemento
      if (this.tipo === 'voxel') {
        const tamanoRender = this.tamano * this.escalaDepth;
        this.debeRenderizar = tamanoRender >= GALAXIA.tamanoMinimoDibujo;
      } else if (this.tipo === 'bloque') {
        const ancho = this.ancho * this.escalaDepth;
        const alto = this.alto * this.escalaDepth;
        this.debeRenderizar = ancho >= 8 && alto >= 8;
      }
    }

    // Dibujar el elemento en el canvas - MEJORADO PARA VISTA CERCANA
    dibujar(ctx, centroX, centroY) {
      // Omitir renderizado si está detrás de la cámara o es demasiado pequeño
      if (!this.estaEnFrustum || !this.debeRenderizar) return;

      // Calcular posición final en pantalla
      const finalX = centroX + this.pantallaX;
      const finalY = centroY + this.pantallaY;

      // Recorte de frustum simple - omitir si está fuera de pantalla
      const margen = 60;
      if (finalX < -margen || finalX > ctx.canvas.width + margen ||
        finalY < -margen || finalY > ctx.canvas.height + margen) {
        return;
      }

      // Dibujo diferente según tipo
      if (this.tipo === 'voxel') {
        // Calcular alfa basado en profundidad
        const alfaDepth = Math.min(1, Math.max(0.2, this.escalaDepth * 0.8));
        const distanciaDesdeElCentro = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        const alfaDistancia = Math.min(1, Math.max(0.3, 1 - (distanciaDesdeElCentro / GALAXIA.radioMaximo) * 0.7));

        const alfaFinal = alfaDepth * alfaDistancia * this.brillo;

        // Calcular dimensiones en pantalla
        const escala = this.escalaDepth;
        const anchoRender = this.ancho * escala;
        const altoRender = this.alto * escala;
        const profundidadRender = this.profundidad * escala;

        // Dibujar cubo 3D (voxel)
        ctx.save();
        ctx.translate(finalX, finalY);

        // Si el tamaño es muy pequeño, dibujar un simple cuadrado
        if (anchoRender < 3 || altoRender < 3) {
          ctx.globalAlpha = alfaFinal;
          ctx.fillStyle = this.color;
          ctx.fillRect(-anchoRender/2, -altoRender/2, anchoRender, altoRender);
        } else {
          // Dibujar cubo con caras sombreadas para efecto 3D
          const mitadAncho = anchoRender / 2;
          const mitadAlto = altoRender / 2;
          const mitadProf = profundidadRender / 2;

          // Factor de luz basado en posición en la galaxia
          const factorLuz = Math.max(0.4, Math.min(1.0,
            1.0 - (distanciaDesdeElCentro / GALAXIA.radioMaximo) * 0.6));

          // Arriba
          if (this.caras[4].visible) {
            const factorSombreado = this.caras[4].sombreado * factorLuz;
            ctx.fillStyle = generarColorSombreado(this.color, factorSombreado);
            ctx.globalAlpha = alfaFinal * 0.95;
            ctx.beginPath();
            ctx.rect(-mitadAncho, -mitadAlto - mitadProf, anchoRender, profundidadRender);
            ctx.fill();
          }

          // Abajo
          if (this.caras[5].visible) {
            const factorSombreado = this.caras[5].sombreado * factorLuz;
            ctx.fillStyle = generarColorSombreado(this.color, factorSombreado);
            ctx.globalAlpha = alfaFinal * 0.8;
            ctx.beginPath();
            ctx.rect(-mitadAncho, mitadAlto, anchoRender, mitadProf);
            ctx.fill();
          }

          // Izquierda
          if (this.caras[3].visible) {
            const factorSombreado = this.caras[3].sombreado * factorLuz;
            ctx.fillStyle = generarColorSombreado(this.color, factorSombreado);
            ctx.globalAlpha = alfaFinal * 0.85;
            ctx.beginPath();
            ctx.rect(-mitadAncho - mitadProf, -mitadAlto, mitadProf, altoRender);
            ctx.fill();
          }

          // Derecha
          if (this.caras[1].visible) {
            const factorSombreado = this.caras[1].sombreado * factorLuz;
            ctx.fillStyle = generarColorSombreado(this.color, factorSombreado);
            ctx.globalAlpha = alfaFinal * 0.9;
            ctx.beginPath();
            ctx.rect(mitadAncho, -mitadAlto, mitadProf, altoRender);
            ctx.fill();
          }

          // Cara frontal - la más brillante
          if (this.caras[0].visible) {
            ctx.fillStyle = this.color;
            ctx.globalAlpha = alfaFinal;
            ctx.fillRect(-mitadAncho, -mitadAlto, anchoRender, altoRender);

            // Efecto de brillo para voxels especiales
            if (this.tamanoBase > 2.5 && alfaFinal > 0.6) {
              const gradiente = ctx.createLinearGradient(
                -mitadAncho, -mitadAlto,
                mitadAncho, mitadAlto
              );
              gradiente.addColorStop(0, `rgba(255, 255, 255, ${alfaFinal * 0.9})`);
              gradiente.addColorStop(0.5, `rgba(255, 255, 255, 0)`);
              ctx.fillStyle = gradiente;
              ctx.fillRect(-mitadAncho, -mitadAlto, anchoRender, altoRender);
            }

            // NUEVO: Patrones para vista cercana
            if (this.tienePatron && anchoRender > 8) {
              ctx.globalAlpha = alfaFinal * 0.8;

              // Diferentes tipos de patrones
              switch(this.patronTipo) {
                case 0: // Cuadrícula
                  ctx.strokeStyle = `rgba(255, 255, 255, ${alfaFinal * 0.5})`;
                  ctx.lineWidth = 0.5;

                  // Línea horizontal central
                  ctx.beginPath();
                  ctx.moveTo(-mitadAncho, 0);
                  ctx.lineTo(mitadAncho, 0);
                  ctx.stroke();

                  // Línea vertical central
                  ctx.beginPath();
                  ctx.moveTo(0, -mitadAlto);
                  ctx.lineTo(0, mitadAlto);
                  ctx.stroke();
                  break;

                case 1: // Cruz
                  ctx.strokeStyle = `rgba(0, 0, 0, ${alfaFinal * 0.6})`;
                  ctx.lineWidth = 1;

                  // Línea diagonal 1
                  ctx.beginPath();
                  ctx.moveTo(-mitadAncho, -mitadAlto);
                  ctx.lineTo(mitadAncho, mitadAlto);
                  ctx.stroke();

                  // Línea diagonal 2
                  ctx.beginPath();
                  ctx.moveTo(mitadAncho, -mitadAlto);
                  ctx.lineTo(-mitadAncho, mitadAlto);
                  ctx.stroke();
                  break;

                case 2: // Círculo central
                  ctx.strokeStyle = `rgba(255, 255, 255, ${alfaFinal * 0.7})`;
                  ctx.fillStyle = `rgba(255, 255, 255, ${alfaFinal * 0.3})`;
                  ctx.lineWidth = 0.5;

                  const radio = Math.min(mitadAncho, mitadAlto) * 0.6;
                  ctx.beginPath();
                  ctx.arc(0, 0, radio, 0, Math.PI * 2);
                  ctx.fill();
                  ctx.stroke();
                  break;
              }
            }
          }

          // Atrás
          if (this.caras[2].visible) {
            const factorSombreado = this.caras[2].sombreado * factorLuz;
            ctx.fillStyle = generarColorSombreado(this.color, factorSombreado);
            ctx.globalAlpha = alfaFinal * 0.7;
            ctx.fillRect(-mitadAncho, -mitadAlto, anchoRender, altoRender);
          }

          // Contorno para definir mejor la forma
          if (anchoRender > 5 && alfaFinal > 0.4) {
            ctx.strokeStyle = `rgba(0, 0, 0, ${alfaFinal * 0.5})`;
            ctx.lineWidth = 0.5;
            ctx.globalAlpha = alfaFinal * 0.7;
            ctx.strokeRect(-mitadAncho, -mitadAlto, anchoRender, altoRender);
          }

          // NUEVO: Efectos adicionales para voxels especiales - solo visibles en vista cercana
          if (this.esEspecial && anchoRender > 10) {
            ctx.globalAlpha = alfaFinal * 0.9;

            // Resaltar bordes
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(-mitadAncho, -mitadAlto, anchoRender, altoRender);

            // Efecto brillante
            const radioEfecto = Math.max(anchoRender, altoRender) * 0.7;
            const gradiente = ctx.createRadialGradient(0, 0, 0, 0, 0, radioEfecto);
            gradiente.addColorStop(0, `rgba(255, 255, 255, ${alfaFinal * 0.8})`);
            gradiente.addColorStop(0.5, `rgba(255, 255, 255, ${alfaFinal * 0.2})`);
            gradiente.addColorStop(1, `rgba(255, 255, 255, 0)`);

            ctx.fillStyle = gradiente;
            ctx.beginPath();
            ctx.arc(0, 0, radioEfecto, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        ctx.restore();
      }
      else if (this.tipo === 'bloque') {
        // Dibujar bloque con estructura cúbica
        const ancho = this.ancho * this.escalaDepth;
        const alto = this.alto * this.escalaDepth;
        const profundidad = this.profundidad * this.escalaDepth;

        // Guardar contexto para transformaciones
        ctx.save();
        ctx.translate(finalX, finalY);
        ctx.rotate(this.rotacion);

        // Crear efecto de bloque 3D
        const mitadAncho = ancho / 2;
        const mitadAlto = alto / 2;
        const mitadProf = profundidad / 2;

        // Factores de sombreado para diferentes caras
        const factorSombreadoSuperior = 0.9;
        const factorSombreadoLateral = 0.7;
// Fachadas del bloque con diferentes sombras
        // Superior
        ctx.fillStyle = `rgba(${this.color}, ${this.opacidad * this.escalaDepth * factorSombreadoSuperior})`;
        ctx.beginPath();
        ctx.moveTo(-mitadAncho, -mitadAlto);
        ctx.lineTo(mitadAncho, -mitadAlto);
        ctx.lineTo(mitadAncho + mitadProf/2, -mitadAlto - mitadProf/2);
        ctx.lineTo(-mitadAncho + mitadProf/2, -mitadAlto - mitadProf/2);
        ctx.closePath();
        ctx.fill();

        // Lateral derecho
        ctx.fillStyle = `rgba(${this.color}, ${this.opacidad * this.escalaDepth * factorSombreadoLateral})`;
        ctx.beginPath();
        ctx.moveTo(mitadAncho, -mitadAlto);
        ctx.lineTo(mitadAncho, mitadAlto);
        ctx.lineTo(mitadAncho + mitadProf/2, mitadAlto - mitadProf/2);
        ctx.lineTo(mitadAncho + mitadProf/2, -mitadAlto - mitadProf/2);
        ctx.closePath();
        ctx.fill();

        // Frente del bloque
        ctx.fillStyle = `rgba(${this.color}, ${this.opacidad * this.escalaDepth})`;
        ctx.beginPath();
        ctx.rect(-mitadAncho, -mitadAlto, ancho, alto);
        ctx.fill();

        // MEJORADO: Efecto de estructura con detalles para vista cercana
        if (ancho > 20) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacidad * this.escalaDepth * 0.4})`;
          ctx.lineWidth = 0.5;

          // Estructura de cuadrícula
          const numCuadrosX = Math.floor(ancho / 10);
          const numCuadrosY = Math.floor(alto / 10);
          const tamCuadroX = ancho / numCuadrosX;
          const tamCuadroY = alto / numCuadrosY;

          // Dibujar líneas horizontales
          for (let i = 1; i < numCuadrosY; i++) {
            const posY = -mitadAlto + i * tamCuadroY;
            ctx.beginPath();
            ctx.moveTo(-mitadAncho, posY);
            ctx.lineTo(mitadAncho, posY);
            ctx.stroke();
          }

          // Dibujar líneas verticales
          for (let i = 1; i < numCuadrosX; i++) {
            const posX = -mitadAncho + i * tamCuadroX;
            ctx.beginPath();
            ctx.moveTo(posX, -mitadAlto);
            ctx.lineTo(posX, mitadAlto);
            ctx.stroke();
          }

          // NUEVO: Detalles adicionales para vista cercana
          if (this.tieneDetalles) {
            ctx.globalAlpha = this.opacidad * this.escalaDepth * 1.2;

            switch(this.detalleTipo) {
              case 0: // Ventanas/luces
                ctx.fillStyle = `rgba(255, 255, 255, 0.8)`;

                const numVentanasX = Math.max(2, Math.floor(ancho / 20));
                const numVentanasY = Math.max(2, Math.floor(alto / 20));
                const anchoVentana = ancho / (numVentanasX * 2);
                const altoVentana = alto / (numVentanasY * 2);
                const espacioX = ancho / numVentanasX;
                const espacioY = alto / numVentanasY;

                for (let y = 0; y < numVentanasY; y++) {
                  for (let x = 0; x < numVentanasX; x++) {
                    // Solo dibujar algunas ventanas aleatoriamente
                    if (Math.random() > 0.3) {
                      const ventanaX = -mitadAncho + espacioX/2 + x * espacioX;
                      const ventanaY = -mitadAlto + espacioY/2 + y * espacioY;

                      ctx.fillRect(ventanaX - anchoVentana/2, ventanaY - altoVentana/2,
                        anchoVentana, altoVentana);
                    }
                  }
                }
                break;

              case 1: // Paneles
                ctx.fillStyle = `rgba(80, 200, 255, 0.3)`;

                // Dibujar paneles en el centro
                const anchoPanel = ancho * 0.7;
                const altoPanel = alto * 0.6;

                ctx.fillRect(-anchoPanel/2, -altoPanel/2, anchoPanel, altoPanel);

                // Líneas de estructura
                ctx.lineWidth = 1;
                ctx.strokeStyle = `rgba(180, 220, 255, 0.8)`;
                ctx.strokeRect(-anchoPanel/2, -altoPanel/2, anchoPanel, altoPanel);

                // Línea diagonal
                ctx.beginPath();
                ctx.moveTo(-anchoPanel/2, -altoPanel/2);
                ctx.lineTo(anchoPanel/2, altoPanel/2);
                ctx.stroke();

                // Línea diagonal inversa
                ctx.beginPath();
                ctx.moveTo(anchoPanel/2, -altoPanel/2);
                ctx.lineTo(-anchoPanel/2, altoPanel/2);
                ctx.stroke();
                break;

              case 2: // Patrón circular
                ctx.fillStyle = `rgba(255, 255, 255, 0.2)`;

                // Círculo central
                const radioCirculo = Math.min(ancho, alto) * 0.3;
                ctx.beginPath();
                ctx.arc(0, 0, radioCirculo, 0, Math.PI * 2);
                ctx.fill();

                // Anillos
                ctx.strokeStyle = `rgba(255, 255, 255, 0.5)`;
                ctx.lineWidth = 1;

                ctx.beginPath();
                ctx.arc(0, 0, radioCirculo * 1.4, 0, Math.PI * 2);
                ctx.stroke();

                // Líneas radiales
                const numRayos = 8;
                const radioRayos = radioCirculo * 1.8;

                for (let i = 0; i < numRayos; i++) {
                  const angulo = (i / numRayos) * Math.PI * 2;
                  ctx.beginPath();
                  ctx.moveTo(0, 0);
                  ctx.lineTo(Math.cos(angulo) * radioRayos, Math.sin(angulo) * radioRayos);
                  ctx.stroke();
                }
                break;
            }
          }
        }

        // Agregar borde para definir el bloque
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacidad * this.escalaDepth * 0.5})`;
        ctx.lineWidth = 0.8;
        ctx.strokeRect(-mitadAncho, -mitadAlto, ancho, alto);

        ctx.restore();
      }
    }
  }

  // Inicializar la galaxia
  const iniciarGalaxia = () => {
    // Obtener contexto del canvas
    const ctx = lienzo.getContext('2d');
    ctx.imageSmoothingEnabled = true;

    // Solo usar alta calidad en escritorio
    if (!deteccionDispositivo.esMovil) {
      ctx.imageSmoothingQuality = 'high';
    }

    // Establecer dimensiones del canvas con optimización para móvil
    const redimensionarCanvas = () => {
      // Actualizar detección de dispositivo en redimensión
      deteccionDispositivo.detectar();

      // Píxeles físicos para canvas
      const ancho = seccionHero.offsetWidth;
      const alto = seccionHero.offsetHeight;

      // Establecer tamaño de canvas
      lienzo.width = ancho;
      lienzo.height = alto;

      // Para pantallas de alta resolución, usar relación de píxeles para renderizado nítido
      const relacionPixeles = deteccionDispositivo.esMovil ?
        Math.min(deteccionDispositivo.relacionPixeles, 2) :
        deteccionDispositivo.relacionPixeles;

      if (relacionPixeles > 1 && !deteccionDispositivo.esBajaPotencia) {
        lienzo.width = ancho * relacionPixeles;
        lienzo.height = alto * relacionPixeles;
        ctx.scale(relacionPixeles, relacionPixeles);
      }

      // Actualizar parámetros de galaxia basados en nuevo tamaño
      GALAXIA.radioMaximo = Math.min(ancho, alto) *
        (deteccionDispositivo.esMovil ? 0.4 : 0.45);
    };

    // Llamar a redimensionar inicialmente y añadir un event listener
    redimensionarCanvas();
    window.addEventListener('resize', () => {
      // Limitar redimensión para prevenir recálculos excesivos
      if (timeoutRedimension) clearTimeout(timeoutRedimension);

    });

    // Función para recalcular posiciones después de redimensión
// Inicializar elementos de la galaxia
    const elementos = [];
    const centroX = lienzo.width / (deteccionDispositivo.relacionPixeles > 1 ? deteccionDispositivo.relacionPixeles : 1) / 2;
    const centroY = lienzo.height / (deteccionDispositivo.relacionPixeles > 1 ? deteccionDispositivo.relacionPixeles : 1) / 2;
    const separacionBrazos = Math.PI * 2 / GALAXIA.cantidadBrazos;

    // Crear voxels para la galaxia espiral 3D
    for (let i = 0; i < GALAXIA.cantidadParticulas; i++) {
      // Elegir a qué brazo pertenece el voxel
      const brazo = Math.floor(Math.random() * GALAXIA.cantidadBrazos);

      // Distribución - más elementos hacia el centro con bulto
      let distribucionRadio;

      // Bulto central (concentración densa en centro)
      if (Math.random() < GALAXIA.tamanoBulbo) {
        distribucionRadio = Math.pow(Math.random(), 2) * 0.3;
      } else {
        // Brazos espirales - distribución más uniforme
        distribucionRadio = 0.3 + Math.pow(Math.random(), 0.5) * 0.7;
      }

      const radio = distribucionRadio * GALAXIA.radioMaximo;

      // Ángulo basado en brazos espirales con factor de compacidad
      const anguloBrazo = brazo * separacionBrazos;
      const factorEspiral = distribucionRadio * Math.PI * 2 * GALAXIA.compactacionBrazos;
      const angle = anguloBrazo + factorEspiral;

      // Coordenadas 3D - crear forma de disco con grosor
      const x = Math.cos(angle) * radio;
      const y = Math.sin(angle) * radio;

      // Posición Z - más delgada en bordes, más gruesa cerca del centro
      const posicionDisco = distribucionRadio; // 0 = centro, 1 = borde
      const grosorMaximo = GALAXIA.radioMaximo * GALAXIA.grosorDisco;
      const factorGrosor = 1 - Math.pow(posicionDisco, 1.5);
      const zExtent = grosorMaximo * factorGrosor;
      const z = (Math.random() - 0.5) * zExtent;

      // Tamaño aleatorio - voxels especiales son más grandes
      const esEspecial = Math.random() < GALAXIA.probabilidadEstrellaEspecial;
      const tamano = GALAXIA.tamanoBaseVoxel + (esEspecial ? GALAXIA.tamanoAgregadoVoxel * Math.random() * 2 : 0);

      // Color aleatorio con variación
      let indiceColor;
      if (distribucionRadio < 0.3) {
        // Centro - colores más cálidos
        indiceColor = Math.floor(Math.random() * 3) + 3;
      } else if (distribucionRadio < 0.6) {
        // Medio - mezcla de colores
        indiceColor = Math.floor(Math.random() * GALAXIA.colores.length);
      } else {
        // Exterior - colores más fríos
        indiceColor = Math.floor(Math.random() * 3);
      }
      const color = GALAXIA.colores[indiceColor];

      // Velocidad orbital - elementos interiores se mueven más rápido
      const velocidadOrbital = (0.0005 + Math.random() * 0.0002) / Math.sqrt(distribucionRadio);

      // Crear elemento tipo voxel
      elementos.push(new ElementoGalaxia3D({
        x, y, z,
        tamano,
        color,
        indiceBrazo: brazo,
        radio,
        angulo: angle,
        velocidadOrbital,
        tipo: 'voxel'
      }));
    }

    // Añadir bloques para estructura de galaxia más compleja
    for (let i = 0; i < GALAXIA.cantidadBloques; i++) {
      // Bloques principalmente siguen brazos pero más difusos
      const brazo = Math.floor(Math.random() * GALAXIA.cantidadBrazos);

      // Bloques más en regiones medias
      const distribucionRadio = 0.2 + Math.random() * 0.6;
      const radio = distribucionRadio * GALAXIA.radioMaximo;

      // Ángulo basado en brazos espirales pero con más aleatoriedad
      const anguloBrazo = brazo * separacionBrazos;
      const factorEspiral = distribucionRadio * Math.PI * 2 * GALAXIA.compactacionBrazos;
      const desplazamientoAleatorio = (Math.random() - 0.5) * 0.6;
      const angulo = anguloBrazo + factorEspiral + desplazamientoAleatorio;

      // Posición
      const x = Math.cos(angulo) * radio;
      const y = Math.sin(angulo) * radio;
      const z = (Math.random() - 0.5) * GALAXIA.radioMaximo * GALAXIA.grosorDisco * 0.8;

      // Propiedades visuales para bloque
      const tamanoBloque = 30 + Math.random() * 80;

      // Diferentes colores para bloques - más tecnológicos
      const baseColor = Math.floor(150 + Math.random() * 105);
      const colorBloque = `${baseColor * 0.3},${baseColor * 0.5},${baseColor}`;

      // Crear bloque
      elementos.push(new ElementoGalaxia3D({
        x, y, z,
        ancho: tamanoBloque * (1 + Math.random() * 0.5),
        alto: tamanoBloque * (0.4 + Math.random() * 0.4),
        profundidad: tamanoBloque * 0.4,
        color: colorBloque,
        opacidad: 0.2 + Math.random() * 0.3,
        rotacion: Math.random() * Math.PI * 2,
        indiceBrazo: brazo,
        radio,
        angulo,
        velocidadOrbital: 0.00015 + Math.random() * 0.0001,
        tipo: 'bloque'
      }));
    }

    // Configurar controladores de interacción
    const configurarControladores = () => {
      // Función auxiliar para resetear interacción
      const resetearInteraccion = () => {
        interaccion.estaActiva = false;
        interaccion.estaPellizco = false;
        interaccion.desplazamientoDetectado = false;
        lienzo.style.cursor = 'grab';
      };

      // Actualizar tiempo de última interacción
      const actualizarTiempoInteraccion = () => {
        interaccion.ultimoTiempoInteraccion = Date.now();
      };

      // Eventos de ratón
      lienzo.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;

        interaccion.estaActiva = true;
        interaccion.inicioX = e.clientX;
        interaccion.inicioY = e.clientY;
        interaccion.ultimoX = e.clientX;
        interaccion.ultimoY = e.clientY;
        interaccion.velX = 0;
        interaccion.velY = 0;

        interaccion.inicioDeslizamientoX = e.clientX;
        interaccion.inicioDeslizamientoY = e.clientY;

        lienzo.style.cursor = 'grabbing';
        actualizarTiempoInteraccion();
      });

      window.addEventListener('mousemove', (e) => {
        if (!interaccion.estaActiva) return;

        const deltaX = e.clientX - interaccion.ultimoX;
        const deltaY = e.clientY - interaccion.ultimoY;

        interaccion.velX = deltaX * 0.01;
        interaccion.velY = deltaY * 0.01;

        camara.rotacionObjetivoY += deltaX * 0.005;
        camara.rotacionObjetivoX += deltaY * 0.005;

        interaccion.ultimoX = e.clientX;
        interaccion.ultimoY = e.clientY;

        actualizarTiempoInteraccion();
      });

      window.addEventListener('mouseup', () => {
        resetearInteraccion();
      });

      window.addEventListener('mouseleave', () => {
        resetearInteraccion();
      });

      // Zoom con rueda
      lienzo.addEventListener('wheel', (e) => {
        e.preventDefault();

        const cantidadZoom = e.deltaY * -0.001;
        camara.zoomObjetivo = Math.max(GALAXIA.zoomMinimo,
          Math.min(GALAXIA.zoomMaximo,
            camara.zoomObjetivo + cantidadZoom));

        actualizarTiempoInteraccion();
      }, { passive: false });

      // Doble clic para resetear vista
      lienzo.addEventListener('dblclick', () => {
        camara.rotacionObjetivoX = 0.5;
        camara.rotacionObjetivoY = 0.1;
        camara.zoomObjetivo = 1.8; // Volver al zoom cercano por defecto

        actualizarTiempoInteraccion();
      });

      // Eventos táctiles mejorados para móvil
      lienzo.addEventListener('touchstart', (e) => {
        const ahora = Date.now();
        if (ahora - interaccion.ultimoTiempoToque < 300) {
          interaccion.dobleToqueDetectado = true;

          camara.rotacionObjetivoX = 0.5;
          camara.rotacionObjetivoY = 0.1;
          camara.zoomObjetivo = 1.8; // Volver al zoom cercano por defecto
        } else {
          interaccion.dobleToqueDetectado = false;

          if (e.touches.length === 1) {
            interaccion.inicioDeslizamientoX = e.touches[0].clientX;
            interaccion.inicioDeslizamientoY = e.touches[0].clientY;
          }
        }
        interaccion.ultimoTiempoToque = ahora;

        if (e.touches.length === 1) {
          interaccion.estaActiva = true;
          interaccion.inicioX = e.touches[0].clientX;
          interaccion.inicioY = e.touches[0].clientY;
          interaccion.ultimoX = e.touches[0].clientX;
          interaccion.ultimoY = e.touches[0].clientY;
          interaccion.velX = 0;
          interaccion.velY = 0;

          interaccion.desplazamientoDetectado = false;
        }
        else if (e.touches.length === 2) {
          interaccion.estaPellizco = true;
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          interaccion.distanciaPellizco = Math.sqrt(dx * dx + dy * dy);

          interaccion.ultimoX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
          interaccion.ultimoY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        }

        actualizarTiempoInteraccion();
        e.preventDefault();
      }, { passive: false });

      lienzo.addEventListener('touchmove', (e) => {
        if (interaccion.dobleToqueDetectado || interaccion.desplazamientoDetectado) return;

        if (interaccion.estaActiva && e.touches.length === 1) {
          const deltaX = e.touches[0].clientX - interaccion.ultimoX;
          const deltaY = e.touches[0].clientY - interaccion.ultimoY;

          if (!interaccion.desplazamientoDetectado && Math.abs(deltaY) > Math.abs(deltaX) * 3) {
            const movimientoTotalY = e.touches[0].clientY - interaccion.inicioY;
            if (Math.abs(movimientoTotalY) > 30) {
              interaccion.desplazamientoDetectado = true;
              resetearInteraccion();
              return;
            }
          }

          const velocidadMovimiento = deteccionDispositivo.esMovil ? 0.006 : 0.005;
          interaccion.velX = deltaX * 0.01;
          interaccion.velY = deltaY * 0.01;

          camara.rotacionObjetivoY += deltaX * velocidadMovimiento;
          camara.rotacionObjetivoX += deltaY * velocidadMovimiento;

          interaccion.ultimoX = e.touches[0].clientX;
          interaccion.ultimoY = e.touches[0].clientY;
        }
        else if (interaccion.estaPellizco && e.touches.length === 2) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          const nuevaDistancia = Math.sqrt(dx * dx + dy * dy);

          const cambioZoom = (nuevaDistancia - interaccion.distanciaPellizco) *
            (deteccionDispositivo.esMovil ? 0.008 : 0.005);

          camara.zoomObjetivo = Math.max(GALAXIA.zoomMinimo,
            Math.min(GALAXIA.zoomMaximo,
              camara.zoomObjetivo + cambioZoom));

          const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
          const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

          const deltaX = midX - interaccion.ultimoX;
          const deltaY = midY - interaccion.ultimoY;

          camara.rotacionObjetivoY += deltaX * 0.002;
          camara.rotacionObjetivoX += deltaY * 0.002;

          interaccion.ultimoX = midX;
          interaccion.ultimoY = midY;
          interaccion.distanciaPellizco = nuevaDistancia;
        }

        actualizarTiempoInteraccion();
        e.preventDefault();
      }, { passive: false });

      lienzo.addEventListener('touchend', (e) => {
        if (interaccion.dobleToqueDetectado) {
          interaccion.dobleToqueDetectado = false;
        }

        if (e.touches.length === 0) {
          resetearInteraccion();
        }
        else if (e.touches.length === 1 && interaccion.estaPellizco) {
          interaccion.estaPellizco = false;
          interaccion.estaActiva = true;
          interaccion.ultimoX = e.touches[0].clientX;
          interaccion.ultimoY = e.touches[0].clientY;
        }

        actualizarTiempoInteraccion();
        e.preventDefault();
      }, { passive: false });

      lienzo.addEventListener('touchcancel', () => {
        resetearInteraccion();
      });

      // Pausar animación cuando página no visible para ahorrar batería
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          if (idAnimacion) {
            cancelAnimationFrame(idAnimacion);
            idAnimacion = null;
          }
        } else {
          if (!idAnimacion) {
            idAnimacion = requestAnimationFrame(animar);
          }
        }
      });

      lienzo.style.cursor = 'grab';
    };

    // Inicializar controladores de interacción
    configurarControladores();

    // Bucle de animación
    let idAnimacion;

    const animar = (tiempo) => {
      idAnimacion = requestAnimationFrame(animar);

      // Omitir frame si deberíamos limitar para rendimiento
      if (deteccionDispositivo.esMovil && !Rendimiento.deberiaRenderizarFrame(tiempo)) {
        return;
      }

      // Fondo con efectos de grilla para enfatizar el 3D
      ctx.fillStyle = '#000115';
      ctx.fillRect(0, 0,
        lienzo.width / (deteccionDispositivo.relacionPixeles > 1 && !deteccionDispositivo.esBajaPotencia ? deteccionDispositivo.relacionPixeles : 1),
        lienzo.height / (deteccionDispositivo.relacionPixeles > 1 && !deteccionDispositivo.esBajaPotencia ? deteccionDispositivo.relacionPixeles : 1)
      );

      // Dibujar grilla de fondo (efecto de "espacio digital")
      if (GALAXIA.mostrarGrilla && !deteccionDispositivo.esBajaPotencia) {
        const anchoCanvas = lienzo.width / (deteccionDispositivo.relacionPixeles > 1 ? deteccionDispositivo.relacionPixeles : 1);
        const altoCanvas = lienzo.height / (deteccionDispositivo.relacionPixeles > 1 ? deteccionDispositivo.relacionPixeles : 1);

        // Calcular espaciado de grilla basado en rotación para efecto 3D
        const espaciadoX = GALAXIA.distanciaGrilla * (1 + Math.sin(camara.rotacionY) * 0.3);
        const espaciadoY = GALAXIA.distanciaGrilla * (1 + Math.sin(camara.rotacionX) * 0.3);

        ctx.strokeStyle = `rgba(30, 60, 120, ${GALAXIA.opacidadGrilla})`;
        ctx.lineWidth = 0.5;

        // Líneas horizontales
        for (let y = 0; y < altoCanvas; y += espaciadoY) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(anchoCanvas, y);
          ctx.stroke();
        }

        // Líneas verticales
        for (let x = 0; x < anchoCanvas; x += espaciadoX) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, altoCanvas);
          ctx.stroke();
        }
      }

      // Aplicar efecto de desvanecimiento para mostrar rastros
      ctx.fillStyle = `rgba(0, 1, 21, ${GALAXIA.velocidadDesvanecimiento})`;
      ctx.fillRect(0, 0,
        lienzo.width / (deteccionDispositivo.relacionPixeles > 1 && !deteccionDispositivo.esBajaPotencia ? deteccionDispositivo.relacionPixeles : 1),
        lienzo.height / (deteccionDispositivo.relacionPixeles > 1 && !deteccionDispositivo.esBajaPotencia ? deteccionDispositivo.relacionPixeles : 1)
      );

      // Actualizar posición de cámara con inercia
      if (!interaccion.estaActiva) {
        // Aplicar inercia a velocidad
        interaccion.velX *= GALAXIA.factorInercia;
        interaccion.velY *= GALAXIA.factorInercia;

        // Aplicar velocidad a rotación
        camara.rotacionObjetivoY += interaccion.velX * 0.01;
        camara.rotacionObjetivoX += interaccion.velY * 0.01;

        // Auto-rotación cuando no interactúa y velocidad es baja
        const tiempoDesdeInteraccion = Date.now() - interaccion.ultimoTiempoInteraccion;

        if (tiempoDesdeInteraccion > 1000) {
          const magnitudVelocidad = Math.sqrt(
            interaccion.velX * interaccion.velX +
            interaccion.velY * interaccion.velY
          );

          if (magnitudVelocidad < 0.001) {
            camara.rotacionObjetivoY += GALAXIA.velocidadAutoRotacion;
          }
        }
      }

      // Movimiento suave de cámara
      camara.rotacionX += (camara.rotacionObjetivoX - camara.rotacionX) * camara.suavizado;
      camara.rotacionY += (camara.rotacionObjetivoY - camara.rotacionY) * camara.suavizado;
      camara.zoom += (camara.zoomObjetivo - camara.zoom) * camara.suavizado;

      // Determinar cuántos elementos renderizar basado en rendimiento
      const particulasARenderizar = Rendimiento.conteoRenderizadoParticulas();
      const bloquesARenderizar = Rendimiento.conteoRenderizadoBloques();

      // Ordenar por profundidad para renderizado correcto
      const elementosConProfundidad = [];

      // Actualizar todos los elementos
      for (let i = 0; i < elementos.length; i++) {
        const elemento = elementos[i];

        // Omitir elementos extras cuando se renderiza recuento reducido
        if ((elemento.tipo === 'voxel' && i >= particulasARenderizar) ||
          (elemento.tipo === 'bloque' && i >= bloquesARenderizar)) {
          continue;
        }

        // Actualizar elemento con configuración actual de cámara
        elemento.actualizar(tiempo, camara);

        // Solo incluir visibles y en frustum
        if (elemento.estaEnFrustum && elemento.debeRenderizar) {
          elementosConProfundidad.push({
            elemento,
            profundidad: elemento.z
          });
        }
      }

      // Ordenar por profundidad - atrás hacia adelante
      if (!deteccionDispositivo.esBajaPotencia) {
        elementosConProfundidad.sort((a, b) => a.profundidad - b.profundidad);
      }

      // Dibujar elementos en orden correcto
      for (let i = 0; i < elementosConProfundidad.length; i++) {
        elementosConProfundidad[i].elemento.dibujar(ctx, centroX, centroY);
      }
    };

    // Iniciar animación
    animar(0);

    // Devolver función de limpieza
    return () => {
      if (idAnimacion) {
        cancelAnimationFrame(idAnimacion);
      }
      window.removeEventListener('resize', redimensionarCanvas);
    };
  };

  // Iniciar la animación de galaxia
  const limpieza = iniciarGalaxia();

  // Limpiar cuando se descarga la página
  window.addEventListener('beforeunload', limpieza);
});
