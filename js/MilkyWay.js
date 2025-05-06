// ResponsiveMilkyWay.js
document.addEventListener('DOMContentLoaded', () => {
  // Get the hero section to append our canvas
  const heroSection = document.querySelector('.hero');

  if (!heroSection) return;

  // Create canvas element
  const canvas = document.createElement('canvas');
  canvas.classList.add('galaxy-canvas');

  // Set canvas styles
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = '0';

  // Insert canvas as the first child of hero section
  heroSection.insertBefore(canvas, heroSection.firstChild);

  // Make hero container position relative and increase z-index
  const heroContainer = heroSection.querySelector('.hero-container');
  if (heroContainer) {
    heroContainer.style.position = 'relative';
    heroContainer.style.zIndex = '1';
  }

  // Detect device capabilities for responsive settings
  const deviceDetection = {
    isMobile: false,
    isLowPower: false,
    isPortrait: window.innerHeight > window.innerWidth,
    pixelRatio: window.devicePixelRatio || 1,

    // Detect mobile devices more reliably than just screen width
    detect: function() {
      // Check for touch capability as primary indicator
      const hasTouchScreen = (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia("(pointer: coarse)").matches
      );

      // Check screen size
      const isSmallScreen = window.innerWidth < 768;

      // Update device state
      this.isMobile = hasTouchScreen || isSmallScreen;

      // Detect low-power devices (older/slower mobile devices)
      // Use a combination of pixel ratio and processor cores if available
      this.isLowPower = this.isMobile && (
        this.pixelRatio < 2 ||
        (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)
      );

      // Update orientation
      this.isPortrait = window.innerHeight > window.innerWidth;

      return this;
    }
  }.detect();

  // Enhanced 3D Galaxy settings with mobile responsiveness
  const GALAXY = {
    // Adjust particle count based on device capability
    particleCount: deviceDetection.isLowPower ? 1000 :
      deviceDetection.isMobile ? 2000 : 4000,

    // Adjust particle size based on device
    particleBaseSize: deviceDetection.isMobile ? 1.0 : 1.5,
    particleAddedSize: deviceDetection.isMobile ? 0.6 : 1.2,

    // Colors palette
    colors: ['#ffffff', '#f1f1ff', '#d5d5ff', '#e4e4ff', '#fefeff', '#f0f8ff', '#f8f8ff'],

    // Galaxy structure - fewer arms on mobile for better performance
    armCount: deviceDetection.isLowPower ? 2 : 3,
    armTheta: 0.85,
    specialStarChance: deviceDetection.isMobile ? 0.1 : 0.15,

    // Dust clouds - fewer on mobile
    dustCloudCount: deviceDetection.isLowPower ? 30 :
      deviceDetection.isMobile ? 60 : 120,

    // 3D specific settings - adjusted for mobile
    maxRadius: Math.min(window.innerWidth, window.innerHeight) *
      (deviceDetection.isMobile ? 0.4 : 0.45),
    maxZ: deviceDetection.isMobile ? 300 : 400,
    viewDistance: deviceDetection.isMobile ? 600 : 700,
    fov: 75,

    // Movement settings - optimized for mobile touch
    rotationSpeed: 0.0001,
    orbitalPeriod: 60000,
    inertiaFactor: deviceDetection.isMobile ? 0.90 : 0.92, // Faster decay on mobile
    zoomSpeed: deviceDetection.isMobile ? 0.03 : 0.05,
    maxZoom: deviceDetection.isMobile ? 2.0 : 2.5,
    minZoom: 0.5,

    // Galaxy structure - adjust thickness for better mobile view
    discThickness: deviceDetection.isMobile ? 0.2 : 0.15, // Thicker on mobile for better visibility
    bulgeSize: 0.3,
    armTightness: 0.7,

    // Performance optimizations
    renderQuality: deviceDetection.isLowPower ? 'low' :
      deviceDetection.isMobile ? 'medium' : 'high',

    // Draw distance cutoff - don't render particles too small to see on mobile
    minDrawSize: deviceDetection.isLowPower ? 0.5 :
      deviceDetection.isMobile ? 0.4 : 0.3,

    // Trail effect - shorter on mobile for better performance
    fadeSpeed: deviceDetection.isLowPower ? 0.3 :
      deviceDetection.isMobile ? 0.25 : 0.2,

    // Automatic rotation speed is slower on mobile
    autoRotationSpeed: deviceDetection.isMobile ? 0.00002 : 0.00005,

    // Frame rate management for mobile
    targetFPS: deviceDetection.isLowPower ? 30 : 60
  };

  // Camera state
  const camera = {
    x: 0,
    y: 0,
    z: -GALAXY.viewDistance,
    rotationX: 0.2, // Initial tilt
    rotationY: 0,
    rotationZ: 0,
    zoom: 1,
    targetRotationX: 0.2,
    targetRotationY: 0,
    targetZoom: 1,
    velocity: { x: 0, y: 0, z: 0 },
    // Smoothing factor for camera movement - less smooth on low-power for better performance
    smoothing: deviceDetection.isLowPower ? 0.1 : 0.05
  };

  // Touch/Mouse interaction state with better mobile handling
  const interaction = {
    isActive: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    velX: 0,
    velY: 0,
    // Enhanced pinch gesture handling
    pinchStart: 0,
    pinchDistance: 0,
    isPinching: false,
    // For mobile - last interaction time to manage power usage
    lastInteractionTime: 0,
    // Double tap detection for mobile
    lastTapTime: 0,
    doubleTapDetected: false,
    // Swipe detection
    swipeThreshold: 50,
    swipeStartX: 0,
    swipeStartY: 0,
    // Prevent unintentional interactions when scrolling page
    scrollDetected: false
  };

  // Matrix operations for 3D transformations
  const Matrix = {
    // Create a rotation matrix around X axis
    rotateX: function(angle) {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return [
        1, 0, 0, 0,
        0, cos, -sin, 0,
        0, sin, cos, 0,
        0, 0, 0, 1
      ];
    },

    // Create a rotation matrix around Y axis
    rotateY: function(angle) {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return [
        cos, 0, sin, 0,
        0, 1, 0, 0,
        -sin, 0, cos, 0,
        0, 0, 0, 1
      ];
    },

    // Create a rotation matrix around Z axis
    rotateZ: function(angle) {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return [
        cos, -sin, 0, 0,
        sin, cos, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ];
    },

    // Multiply a point by a matrix
    multiplyPoint: function(matrix, point) {
      const [x, y, z] = point;
      const w = 1; // Homogeneous coordinate

      return [
        matrix[0] * x + matrix[1] * y + matrix[2] * z + matrix[3] * w,
        matrix[4] * x + matrix[5] * y + matrix[6] * z + matrix[7] * w,
        matrix[8] * x + matrix[9] * y + matrix[10] * z + matrix[11] * w,
        matrix[12] * x + matrix[13] * y + matrix[14] * z + matrix[15] * w
      ];
    },

    // Multiply two matrices
    multiplyMatrices: function(a, b) {
      const result = new Array(16);

      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          result[i * 4 + j] =
            a[i * 4] * b[j] +
            a[i * 4 + 1] * b[4 + j] +
            a[i * 4 + 2] * b[2 * 4 + j] +
            a[i * 4 + 3] * b[3 * 4 + j];
        }
      }

      return result;
    }
  };

  // Performance optimization utilities for mobile
  const Performance = {
    // Last time the animation frame was processed
    lastFrameTime: 0,

    // Frame count for FPS calculation
    frameCount: 0,
    lastFpsUpdateTime: 0,
    currentFps: 0,

    // Whether we can render the current frame or should skip it
    shouldRenderFrame: function(currentTime) {
      // Always render if not on mobile
      if (!deviceDetection.isMobile) return true;

      const targetFrameTime = 1000 / GALAXY.targetFPS;
      const elapsed = currentTime - this.lastFrameTime;

      // Skip frame if we're rendering too quickly
      if (elapsed < targetFrameTime) return false;

      // Update timing info
      this.lastFrameTime = currentTime;

      // FPS counter (for dev purposes)
      this.frameCount++;
      if (currentTime - this.lastFpsUpdateTime > 1000) {
        this.currentFps = this.frameCount;
        this.frameCount = 0;
        this.lastFpsUpdateTime = currentTime;
      }

      return true;
    },

    // Progressive rendering for mobile - render fewer particles when moving
    particleRenderCount: function() {
      if (!deviceDetection.isMobile) return GALAXY.particleCount;

      // Check if user is actively interacting
      const isInteracting = Date.now() - interaction.lastInteractionTime < 200;

      // Render fewer particles when interacting for better performance
      return isInteracting ?
        Math.floor(GALAXY.particleCount * 0.6) :
        GALAXY.particleCount;
    },

    // Optimize dust cloud rendering based on performance
    dustRenderCount: function() {
      if (!deviceDetection.isMobile) return GALAXY.dustCloudCount;

      // Render fewer dust clouds when interacting
      const isInteracting = Date.now() - interaction.lastInteractionTime < 200;
      return isInteracting ?
        Math.floor(GALAXY.dustCloudCount * 0.5) :
        GALAXY.dustCloudCount;
    }
  };

  // Enhanced 3D Particle class with mobile optimizations
  class GalaxyParticle {
    constructor(options) {
      // Position in 3D space
      this.x = options.x || 0;
      this.y = options.y || 0;
      this.z = options.z || 0;

      // Original position for reference
      this.originalX = this.x;
      this.originalY = this.y;
      this.originalZ = this.z;

      // Projected position on screen
      this.screenX = 0;
      this.screenY = 0;

      // Visual properties
      this.size = options.size || 1;
      this.baseSize = this.size;
      this.color = options.color || '#ffffff';
      this.brightness = options.brightness || 1;

      // Motion properties
      this.armIndex = options.armIndex || 0;
      this.radius = options.radius || 1;
      this.angle = options.angle || 0;
      this.orbitalSpeed = options.orbitalSpeed || 0.001;

      // Special effects
      this.twinkleSpeed = Math.random() * 0.05 + 0.01;
      this.twinkleAmount = Math.random() * 0.8 + 0.2;
      this.twinklePhase = Math.random() * Math.PI * 2;

      // Type - star, dust cloud, etc.
      this.type = options.type || 'star';

      // For dust clouds only
      if (this.type === 'dust') {
        this.opacity = options.opacity || 0.4;
        this.width = options.width || 100;
        this.height = options.height || 50;
        this.depth = options.depth || 30;
        this.rotation = options.rotation || 0;
      }

      // Scale based on depth
      this.depthScale = 1;

      // Optimization: pre-calculate some values
      this.lastUpdateTime = 0;

      // Mobile optimization: visibility check to skip offscreen particles
      this.isVisible = true;
      this.isInFrustum = true;

      // For efficient rendering - track if this particle should be rendered
      // Based on performance mode and particle's size or importance
      this.shouldRender = true;
    }

    // Update particle position with complete 3D transformations
    update(time, camera) {
      // Mobile optimization: Skip minor updates on low power devices
      if (deviceDetection.isLowPower && this.lastUpdateTime > 0) {
        const elapsed = time - this.lastUpdateTime;
        if (elapsed < 50) { // Skip frequent updates on low power
          return;
        }
      }
      this.lastUpdateTime = time;

      // Apply orbital motion for stars in the galaxy
      if (this.type === 'star') {
        // Orbital motion - stars closer to center move faster
        const orbitalFactor = 1 - (this.radius / GALAXY.maxRadius) * 0.8;
        this.angle += this.orbitalSpeed * orbitalFactor;

        // Update position based on orbital motion
        this.originalX = Math.cos(this.angle) * this.radius;
        this.originalY = Math.sin(this.angle) * this.radius;
      } else if (this.type === 'dust') {
        // Slower updates for dust clouds on mobile for better performance
        if (!deviceDetection.isMobile || time % 3 === 0) {
          this.angle += this.orbitalSpeed * 0.3; // Slower movement for dust
          this.originalX = Math.cos(this.angle) * this.radius;
          this.originalY = Math.sin(this.angle) * this.radius;
          this.rotation += 0.0005;
        }
      }

      // Apply twinkle effect - less pronounced on mobile to save performance
      const twinkleFactor = deviceDetection.isMobile ? 0.7 : 1.0;
      this.twinklePhase += this.twinkleSpeed;
      const twinkle = 1 + (this.twinkleAmount * Math.sin(this.twinklePhase) * twinkleFactor);
      this.size = this.baseSize * twinkle;

      // Create combined rotation matrix
      const matRotX = Matrix.rotateX(camera.rotationX);
      const matRotY = Matrix.rotateY(camera.rotationY);
      const matRotZ = Matrix.rotateZ(camera.rotationZ);

      // Combine rotations: first X, then Y, then Z
      let combinedMatrix = Matrix.multiplyMatrices(matRotX, matRotY);
      combinedMatrix = Matrix.multiplyMatrices(combinedMatrix, matRotZ);

      // Apply rotation to particle position
      const transformedPoint = Matrix.multiplyPoint(combinedMatrix,
        [this.originalX, this.originalY, this.originalZ]);

      // Store transformed coordinates
      this.x = transformedPoint[0];
      this.y = transformedPoint[1];
      this.z = transformedPoint[2];

      // Apply camera position and zoom
      const zoomedX = this.x * camera.zoom;
      const zoomedY = this.y * camera.zoom;
      const zoomedZ = this.z * camera.zoom + camera.z;

      // Mobile optimization: check if particle is behind camera
      if (zoomedZ >= -1) {
        this.isInFrustum = false;
        return;
      }
      this.isInFrustum = true;

      // Perspective projection
      const perspective = GALAXY.viewDistance / (GALAXY.viewDistance - zoomedZ);
      this.screenX = zoomedX * perspective;
      this.screenY = zoomedY * perspective;

      // Store depth scale for drawing
      this.depthScale = perspective;

      // Calculate brightness based on position for volumetric effect
      const distanceFromCenter = Math.sqrt(
        this.originalX * this.originalX +
        this.originalY * this.originalY +
        this.originalZ * this.originalZ
      );

      // Normalize distance (0 = center, 1 = max radius)
      const normalizedDistance = Math.min(1, distanceFromCenter / GALAXY.maxRadius);

      // Brighter in center, dimmer at edges - more pronounced on mobile for clarity
      const centerBrightnessFactor = deviceDetection.isMobile ? 0.6 : 0.7;
      this.brightness = Math.max(0.2, 1 - normalizedDistance * centerBrightnessFactor);

      // Mobile optimization: check if we should render this particle
      // Skip very small particles to improve performance
      if (this.type === 'star') {
        const drawSize = this.size * this.depthScale;
        this.shouldRender = drawSize >= GALAXY.minDrawSize;
      } else if (this.type === 'dust') {
        const width = this.width * this.depthScale;
        const height = this.height * this.depthScale;
        this.shouldRender = width >= 5 && height >= 5;
      }
    }

    // Draw the particle on the canvas
    draw(ctx, centerX, centerY) {
      // Skip rendering if behind camera or too small
      if (!this.isInFrustum || !this.shouldRender) return;

      // Calculate final screen position
      const finalX = centerX + this.screenX;
      const finalY = centerY + this.screenY;

      // Simple frustum culling - skip if offscreen
      // Add slight margin to avoid pop-in at screen edges
      const margin = 50;
      if (finalX < -margin || finalX > ctx.canvas.width + margin ||
        finalY < -margin || finalY > ctx.canvas.height + margin) {
        return;
      }

      // Different drawing based on particle type
      if (this.type === 'star') {
        // Calculate alpha based on depth for stars
        const alphaDepth = Math.min(1, Math.max(0.2, this.depthScale * 0.8));
        // Stars further from center are dimmer
        const distanceFromCenter = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        const alphaDistance = Math.min(1, Math.max(0.3, 1 - (distanceFromCenter / GALAXY.maxRadius) * 0.7));

        const finalAlpha = alphaDepth * alphaDistance * this.brightness;
        ctx.globalAlpha = finalAlpha;

        // Draw the star
        ctx.fillStyle = this.color;
        const drawSize = this.size * this.depthScale;

        ctx.beginPath();
        ctx.arc(finalX, finalY, drawSize, 0, Math.PI * 2);
        ctx.fill();

        // Glow effect for larger stars - simplified on mobile for performance
        if (this.baseSize > 1.8) {
          // Only one glow layer on low power devices
          if (!deviceDetection.isLowPower) {
            ctx.globalAlpha = finalAlpha * 0.6;
            const glowSize = drawSize * (1.8 + Math.sin(this.twinklePhase * 0.5) * 0.4);
            ctx.beginPath();
            ctx.arc(finalX, finalY, glowSize, 0, Math.PI * 2);
            ctx.fill();
          }

          // Extra bright center
          ctx.globalAlpha = finalAlpha * 0.8;
          ctx.beginPath();
          ctx.arc(finalX, finalY, drawSize * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      else if (this.type === 'dust') {
        // Draw dust cloud with gradient
        const width = this.width * this.depthScale;
        const height = this.height * this.depthScale;

        // Save context for rotation
        ctx.save();
        ctx.translate(finalX, finalY);
        ctx.rotate(this.rotation);

        // On mobile: use simpler drawing for dust clouds
        if (deviceDetection.isLowPower) {
          ctx.globalAlpha = this.opacity * this.depthScale;
          ctx.fillStyle = `rgba(${this.color}, ${this.opacity * this.depthScale})`;
          ctx.beginPath();
          ctx.ellipse(0, 0, width/2, height/2, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Create radial gradient for dust cloud
          const gradient = ctx.createRadialGradient(0, 0, 1, 0, 0, width/2);
          gradient.addColorStop(0, `rgba(${this.color}, ${this.opacity * this.depthScale})`);
          gradient.addColorStop(1, `rgba(${this.color}, 0)`);

          ctx.fillStyle = gradient;
          ctx.globalAlpha = this.opacity * this.depthScale;

          // Draw elliptical cloud
          ctx.beginPath();
          ctx.ellipse(0, 0, width/2, height/2, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // Restore context
        ctx.restore();
      }
    }
  }

  // Initialize the galaxy
  const initGalaxy = () => {
    // Get canvas context
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;

    // Only use high quality on desktop - better performance on mobile
    if (!deviceDetection.isMobile) {
      ctx.imageSmoothingQuality = 'high';
    }

    // Set canvas dimensions with mobile optimization
    const resizeCanvas = () => {
      // Update device detection on resize (orientation changes)
      deviceDetection.detect();

      // Physical pixels for canvas
      const width = heroSection.offsetWidth;
      const height = heroSection.offsetHeight;

      // Set canvas size
      canvas.width = width;
      canvas.height = height;

      // For high DPI screens, use device pixel ratio for crisp rendering
      // But limit to 2x on mobile to preserve performance
      const pixelRatio = deviceDetection.isMobile ?
        Math.min(deviceDetection.pixelRatio, 2) :
        deviceDetection.pixelRatio;

      if (pixelRatio > 1 && !deviceDetection.isLowPower) {
        canvas.width = width * pixelRatio;
        canvas.height = height * pixelRatio;
        ctx.scale(pixelRatio, pixelRatio);
      }

      // Update galaxy parameters based on new size
      GALAXY.maxRadius = Math.min(width, height) *
        (deviceDetection.isMobile ? 0.4 : 0.45);
    };

    // Call resize initially and add an event listener
    resizeCanvas();
    window.addEventListener('resize', () => {
      // Throttle resize to prevent excessive recalculations
      if (resizeTimeout) clearTimeout(resizeTimeout);

      let resizeTimeout = setTimeout(() => {
        resizeCanvas();

        // Also update galaxy particles for a new screen size
        recalculateParticlePositions();
      }, 150);
    });

    // Function to recalculate particle positions after resize
    const recalculateParticlePositions = () => {
      // Just update radius for existing particles
      particles.forEach(particle => {
        if (particle.radius) {
          // Scale radius to match new galaxy size
          const radiusRatio = particle.radius / GALAXY.maxRadius;
          particle.radius = radiusRatio * GALAXY.maxRadius;

          // Update position based on new radius
          particle.originalX = Math.cos(particle.angle) * particle.radius;
          particle.originalY = Math.sin(particle.angle) * particle.radius;
        }
      });
    };

    // Initialize particles
    const particles = [];
    const centerX = canvas.width / (deviceDetection.pixelRatio > 1 ? deviceDetection.pixelRatio : 1) / 2;
    const centerY = canvas.height / (deviceDetection.pixelRatio > 1 ? deviceDetection.pixelRatio : 1) / 2;
    const armSpread = Math.PI * 2 / GALAXY.armCount;

    // Create 3D spiral galaxy stars
    for (let i = 0; i < GALAXY.particleCount; i++) {
      // Choose which arm the particle belongs to
      const arm = Math.floor(Math.random() * GALAXY.armCount);

      // Distribution - more particles toward center with bulge
      let radiusDistribution;

      // Central bulge (dense concentration in center)
      if (Math.random() < GALAXY.bulgeSize) {
        radiusDistribution = Math.pow(Math.random(), 2) * 0.3; // Concentrated in center
      } else {
        // Spiral arms - square root distribution for more uniform coverage
        radiusDistribution = 0.3 + Math.pow(Math.random(), 0.5) * 0.7;
      }

      const radius = radiusDistribution * GALAXY.maxRadius;

      // Angle based on spiral arms with tightness factor
      const armAngle = arm * armSpread;
      const spiralFactor = radiusDistribution * Math.PI * 2 * GALAXY.armTightness;
      const angle = armAngle + spiralFactor;

      // 3D coordinates - create a disc shape with thickness
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      // Z-position - thinner at edges, thicker near center
      const discPosition = radiusDistribution; // 0 = center, 1 = edge
      const maxThickness = GALAXY.maxRadius * GALAXY.discThickness;
      const thicknessFactor = 1 - Math.pow(discPosition, 1.5); // Thickness reduces toward edges
      const zExtent = maxThickness * thicknessFactor;
      const z = (Math.random() - 0.5) * zExtent;

      // Random size - special stars are brighter
      const isSpecial = Math.random() < GALAXY.specialStarChance;
      const size = GALAXY.particleBaseSize + (isSpecial ? GALAXY.particleAddedSize * Math.random() * 2 : 0);

      // Random color with temperature variation
      // Outer stars more blue, inner stars more yellow/white
      let colorIndex;
      if (radiusDistribution < 0.3) {
        // Center - more yellow/white
        colorIndex = Math.floor(Math.random() * 3) + 3;
      } else if (radiusDistribution < 0.6) {
        // Middle - mix of colors
        colorIndex = Math.floor(Math.random() * GALAXY.colors.length);
      } else {
        // Outer - more blue/white
        colorIndex = Math.floor(Math.random() * 3);
      }
      const color = GALAXY.colors[colorIndex];

      // Orbital speed - inner stars move faster
      const orbitalSpeed = (0.0005 + Math.random() * 0.0002) / Math.sqrt(radiusDistribution);

      // Create particle
      particles.push(new GalaxyParticle({
        x, y, z,
        size,
        color,
        armIndex: arm,
        radius,
        angle,
        orbitalSpeed,
        type: 'star'
      }));
    }

    // Add dust clouds for more realistic galaxy structure
    for (let i = 0; i < GALAXY.dustCloudCount; i++) {
      // Dust mainly follows arms but more diffuse
      const arm = Math.floor(Math.random() * GALAXY.armCount);

      // Dust more in mid-regions, less in very center and edges
      const radiusDistribution = 0.2 + Math.random() * 0.6;
      const radius = radiusDistribution * GALAXY.maxRadius;

      // Angle based on spiral arms but with more randomness
      const armAngle = arm * armSpread;
      const spiralFactor = radiusDistribution * Math.PI * 2 * GALAXY.armTightness;
      const randomOffset = (Math.random() - 0.5) * 0.5; // More diffuse than stars
      const angle = armAngle + spiralFactor + randomOffset;

      // Position
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = (Math.random() - 0.5) * GALAXY.maxRadius * GALAXY.discThickness * 0.7;

      // Visual properties for dust
      const dustSize = 50 + Math.random() * 100;

      // Different colors for dust - more reddish/brownish
      const dustColorBase = Math.floor(40 + Math.random() * 30);
      const dustColor = `${dustColorBase+10},${dustColorBase},${dustColorBase+5}`;

      // Create dust cloud
      particles.push(new GalaxyParticle({
        x, y, z,
        width: dustSize * (1 + Math.random()),
        height: dustSize * (0.5 + Math.random() * 0.5),
        depth: dustSize * 0.3,
        color: dustColor,
        opacity: 0.1 + Math.random() * 0.2,
        rotation: Math.random() * Math.PI * 2,
        armIndex: arm,
        radius,
        angle,
        orbitalSpeed: 0.0001 + Math.random() * 0.0001,
        type: 'dust'
      }));
    }

    // Enhanced interaction handlers for mobile
    const setupInteractionHandlers = () => {
      // Reset interaction state helper function
      const resetInteraction = () => {
        interaction.isActive = false;
        interaction.isPinching = false;
        interaction.scrollDetected = false;
        canvas.style.cursor = 'grab';
      };

      // Update last interaction time for performance management
      const updateInteractionTime = () => {
        interaction.lastInteractionTime = Date.now();
      };

      // Mouse events
      canvas.addEventListener('mousedown', (e) => {
        // Only primary button (left click)
        if (e.button !== 0) return;

        interaction.isActive = true;
        interaction.startX = e.clientX;
        interaction.startY = e.clientY;
        interaction.lastX = e.clientX;
        interaction.lastY = e.clientY;
        interaction.velX = 0;
        interaction.velY = 0;

        // For swipe detection
        interaction.swipeStartX = e.clientX;
        interaction.swipeStartY = e.clientY;

        canvas.style.cursor = 'grabbing';
        updateInteractionTime();
      });

      window.addEventListener('mousemove', (e) => {
        if (!interaction.isActive) return;

        // Calculate delta movement
        const deltaX = e.clientX - interaction.lastX;
        const deltaY = e.clientY - interaction.lastY;

        // Update velocity (for inertia)
        interaction.velX = deltaX * 0.01;
        interaction.velY = deltaY * 0.01;

        // Update rotation target based on mouse movement
        camera.targetRotationY += deltaX * 0.005;
        camera.targetRotationX += deltaY * 0.005;

        // Store last position
        interaction.lastX = e.clientX;
        interaction.lastY = e.clientY;

        updateInteractionTime();
      });

      window.addEventListener('mouseup', () => {
        resetInteraction();
      });

      window.addEventListener('mouseleave', () => {
        resetInteraction();
      });

      // Scroll for zoom with better control
      canvas.addEventListener('wheel', (e) => {
        e.preventDefault();

        // Smoother zoom with momentum
        const zoomAmount = e.deltaY * -0.001;
        camera.targetZoom = Math.max(GALAXY.minZoom,
          Math.min(GALAXY.maxZoom,
            camera.targetZoom + zoomAmount));

        updateInteractionTime();
      }, { passive: false });

      // Double-click/tap to reset the view
      canvas.addEventListener('dblclick', (e) => {
        // Reset camera to default view
        camera.targetRotationX = 0.2;
        camera.targetRotationY = 0;
        camera.targetZoom = 1;

        updateInteractionTime();
      });

      // Enhanced touch events for mobile
      canvas.addEventListener('touchstart', (e) => {
        // Record timestamp for double-tap detection
        const now = Date.now();
        if (now - interaction.lastTapTime < 300) {
          // Double tap detected
          interaction.doubleTapDetected = true;

          // Reset camera to default view
          camera.targetRotationX = 0.2;
          camera.targetRotationY = 0;
          camera.targetZoom = 1;
        } else {
          interaction.doubleTapDetected = false;

          // For swipe detection
          if (e.touches.length === 1) {
            interaction.swipeStartX = e.touches[0].clientX;
            interaction.swipeStartY = e.touches[0].clientY;
          }
        }
        interaction.lastTapTime = now;

        if (e.touches.length === 1) {
          // Single touch - rotation
          interaction.isActive = true;
          interaction.startX = e.touches[0].clientX;
          interaction.startY = e.touches[0].clientY;
          interaction.lastX = e.touches[0].clientX;
          interaction.lastY = e.touches[0].clientY;
          interaction.velX = 0;
          interaction.velY = 0;

          // Check if user might be trying to scroll
          interaction.scrollDetected = false;
        }
        else if (e.touches.length === 2) {
          // Pinch to zoom - use distance between fingers
          interaction.isPinching = true;
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          interaction.pinchDistance = Math.sqrt(dx * dx + dy * dy);

          // Also track midpoint for rotation during pinch
          interaction.lastX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
          interaction.lastY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        }

        updateInteractionTime();
        e.preventDefault();
      }, { passive: false });

      canvas.addEventListener('touchmove', (e) => {
        // Don't handle touch events if double-tap was detected or user is scrolling
        if (interaction.doubleTapDetected || interaction.scrollDetected) return;

        if (interaction.isActive && e.touches.length === 1) {
          // Single touch - rotation
          const deltaX = e.touches[0].clientX - interaction.lastX;
          const deltaY = e.touches[0].clientY - interaction.lastY;

          // Check if this looks like a scroll gesture
          if (!interaction.scrollDetected && Math.abs(deltaY) > Math.abs(deltaX) * 3) {
            // Vertical movement much larger than horizontal - might be trying to scroll
            const totalMoveY = e.touches[0].clientY - interaction.startY;
            if (Math.abs(totalMoveY) > 30) {
              // User is likely trying to scroll - release control
              interaction.scrollDetected = true;
              resetInteraction();
              return;
            }
          }

          // Calculate speed-sensitive movement
          const movementSpeed = deviceDetection.isMobile ? 0.006 : 0.005;
          interaction.velX = deltaX * 0.01;
          interaction.velY = deltaY * 0.01;

          camera.targetRotationY += deltaX * movementSpeed;
          camera.targetRotationX += deltaY * movementSpeed;

          interaction.lastX = e.touches[0].clientX;
          interaction.lastY = e.touches[0].clientY;
        }
        else if (interaction.isPinching && e.touches.length === 2) {
          // Calculate new distance for pinch zoom
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          const newDistance = Math.sqrt(dx * dx + dy * dy);

          // Calculate zoom change - more sensitive on mobile
          const zoomChange = (newDistance - interaction.pinchDistance) *
            (deviceDetection.isMobile ? 0.008 : 0.005);

          camera.targetZoom = Math.max(GALAXY.minZoom,
            Math.min(GALAXY.maxZoom,
              camera.targetZoom + zoomChange));

          // Also handle rotation during pinch by tracking midpoint
          const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
          const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

          const deltaX = midX - interaction.lastX;
          const deltaY = midY - interaction.lastY;

          // Less sensitive rotation during pinch
          camera.targetRotationY += deltaX * 0.002;
          camera.targetRotationX += deltaY * 0.002;

          interaction.lastX = midX;
          interaction.lastY = midY;
          interaction.pinchDistance = newDistance;
        }

        updateInteractionTime();
        e.preventDefault();
      }, { passive: false });

      canvas.addEventListener('touchend', (e) => {
        // Reset double-tap after handling
        if (interaction.doubleTapDetected) {
          interaction.doubleTapDetected = false;
        }

        if (e.touches.length === 0) {
          resetInteraction();
        }
        else if (e.touches.length === 1 && interaction.isPinching) {
          // If ending a pinch but keeping one finger down
          interaction.isPinching = false;
          interaction.isActive = true;
          interaction.lastX = e.touches[0].clientX;
          interaction.lastY = e.touches[0].clientY;
        }

        updateInteractionTime();
        e.preventDefault();
      }, { passive: false });

      // Handle touch cancel to clean up properly
      canvas.addEventListener('touchcancel', () => {
        resetInteraction();
      });

      // Pause animation when page is not visible for battery savings
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          // Page is hidden, pause animation
          if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
          }
        } else {
          // Page is visible, resume animation
          if (!animationId) {
            animationId = requestAnimationFrame(animate);
          }
        }
      });

      // Set initial cursor
      canvas.style.cursor = 'grab';
    };

    // Initialize interaction handlers
    setupInteractionHandlers();

    // Animation loop
    let animationId;

    const animate = (time) => {
      animationId = requestAnimationFrame(animate);

      // Skip frame if we should throttle for performance
      if (deviceDetection.isMobile && !Performance.shouldRenderFrame(time)) {
        return;
      }

      // Clear canvas with better fade effect for more persistent trails
      // Use different fade speed based on device capability
      ctx.fillStyle = `rgba(0, 0, 0, 0.5)`;
      ctx.fillRect(0, 0,
        canvas.width / (deviceDetection.pixelRatio > 1 && !deviceDetection.isLowPower ? deviceDetection.pixelRatio : 1),
        canvas.height / (deviceDetection.pixelRatio > 1 && !deviceDetection.isLowPower ? deviceDetection.pixelRatio : 1)
      );

      // Update camera position with inertia
      if (!interaction.isActive) {
        // Apply inertia to velocity
        interaction.velX *= GALAXY.inertiaFactor;
        interaction.velY *= GALAXY.inertiaFactor;

        // Apply velocity to rotation
        camera.targetRotationY += interaction.velX * 0.01;
        camera.targetRotationX += interaction.velY * 0.01;

        // Auto-rotation when not interacting and velocity is low
        // Only apply auto-rotation if not recently interacted with
        const timeSinceInteraction = Date.now() - interaction.lastInteractionTime;

        if (timeSinceInteraction > 1000) {
          const velocityMagnitude = Math.sqrt(
            interaction.velX * interaction.velX +
            interaction.velY * interaction.velY
          );

          if (velocityMagnitude < 0.001) {
            // Slower auto-rotation on mobile
            camera.targetRotationY += GALAXY.autoRotationSpeed;
          }
        }
      }

      // Smooth camera movement - lerp towards target values
      camera.rotationX += (camera.targetRotationX - camera.rotationX) * camera.smoothing;
      camera.rotationY += (camera.targetRotationY - camera.rotationY) * camera.smoothing;
      camera.zoom += (camera.targetZoom - camera.zoom) * camera.smoothing;

      // Determine how many particles to render based on performance mode
      const particlesToRender = Performance.particleRenderCount();
      const dustToRender = Performance.dustRenderCount();

      // Sort particles by z-order for proper depth rendering
      // Optimized sorting approach for mobile
      const particlesWithDepth = [];

      // First update all particles
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];

        // Skip extra particles when rendering reduced count
        if ((particle.type === 'star' && i >= particlesToRender) ||
          (particle.type === 'dust' && i >= dustToRender)) {
          continue;
        }

        // Update particle with current camera settings
        particle.update(time, camera);

        // Only include visible and in-frustum particles
        if (particle.isInFrustum && particle.shouldRender) {
          particlesWithDepth.push({
            particle,
            depth: particle.depthScale
          });
        }
      }

      // Performance optimization for mobile: only sort when necessary
      // Low-power devices can skip sorting for better performance since
      // perfect depth ordering is less noticeable on small screens
      if (!deviceDetection.isLowPower) {
        // Sort by depth - back to front (painter's algorithm)
        particlesWithDepth.sort((a, b) => a.depth - b.depth);
      }

      // Draw particles in correct order
      for (let i = 0; i < particlesWithDepth.length; i++) {
        particlesWithDepth[i].particle.draw(ctx, centerX, centerY);
      }
    };

    // Start animation
    animate(0);

    // Return cleanup function
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  };

  // Start the galaxy animation
  const cleanup = initGalaxy();

  // Clean up when page is unloaded
  window.addEventListener('beforeunload', cleanup);
});
