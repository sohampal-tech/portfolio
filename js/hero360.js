/**
 * hero360.js - High-Precision 360° Turntable & Scroll-Linked Rotation Engine
 */

class Hero360Engine {
  constructor() {
    this.assembly = document.querySelector('.turntable-assembly');
    this.viewport = document.querySelector('.turntable-viewport');
    this.rotationVal = document.getElementById('rotation-val');
    this.rotationStage = document.getElementById('rotation-stage');
    this.scrollIndicator = document.querySelector('.hero-hud-bottom');
    this.glare = document.querySelector('.portrait-glare');

    if (!this.assembly) return;

    this.currentScrollAngle = 0;
    this.manualAngleOffset = 0;
    this.tiltX = 0;
    this.tiltY = 0;
    this.isDragging = false;
    this.dragStartX = 0;

    this.init();
  }

  init() {
    this.setupScrollTrigger();
    this.setupDragInteraction();
    this.setupMouseTilt();
  }

  setupScrollTrigger() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('GSAP or ScrollTrigger not loaded, falling back to requestAnimationFrame');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Pin hero section and drive 360° rotation linearly
    ScrollTrigger.create({
      trigger: '.hero-pin-wrapper',
      start: 'top top',
      end: '+=1600',
      pin: true,
      scrub: 0.6,
      anticipatePin: 1,
      onUpdate: (self) => {
        // Linear 0° -> 360° mapping
        this.currentScrollAngle = self.progress * 360;
        this.updateTransform();

        // Fade bottom indicator on scroll start
        if (this.scrollIndicator) {
          const fadeProgress = Math.min(1, self.progress * 5);
          this.scrollIndicator.style.opacity = (1 - fadeProgress).toString();
          this.scrollIndicator.style.transform = `translateX(-50%) translateY(${fadeProgress * 20}px)`;
        }
      }
    });
  }

  setupDragInteraction() {
    if (!this.viewport) return;

    const onPointerDown = (e) => {
      this.isDragging = true;
      this.dragStartX = e.clientX || (e.touches && e.touches[0].clientX);
    };

    const onPointerMove = (e) => {
      if (!this.isDragging) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const deltaX = clientX - this.dragStartX;
      this.dragStartX = clientX;

      this.manualAngleOffset += deltaX * 0.45;
      this.updateTransform();
    };

    const onPointerUp = () => {
      this.isDragging = false;
    };

    this.viewport.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    this.viewport.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);
  }

  setupMouseTilt() {
    if (!this.viewport) return;

    window.addEventListener('mousemove', (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;

      // Subtle dynamic 3D tilt
      this.tiltY = dx * 8;
      this.tiltX = -dy * 6;

      this.updateTransform();
    });
  }

  updateTransform() {
    // Total combined rotation
    let totalAngle = (this.currentScrollAngle + this.manualAngleOffset) % 360;
    if (totalAngle < 0) totalAngle += 360;

    const roundedAngle = Math.round(totalAngle);

    // Apply 3D transform with depth tilt
    this.assembly.style.transform = `rotateX(${this.tiltX}deg) rotateY(${totalAngle + this.tiltY}deg)`;

    // Update HUD readouts
    if (this.rotationVal) {
      this.rotationVal.textContent = `${String(roundedAngle).padStart(3, '0')}°`;
    }

    if (this.rotationStage) {
      this.rotationStage.textContent = this.getOrientationTag(roundedAngle);
    }

    // Dynamic specular glare shift
    if (this.glare) {
      const glareOffset = ((totalAngle % 180) / 180) * 100;
      this.glare.style.background = `linear-gradient(${115 + glareOffset * 0.4}deg, rgba(255,255,255,0.25) 0%, transparent 30%, rgba(201,169,110,0.18) 70%, transparent 100%)`;
    }
  }

  getOrientationTag(angle) {
    if (angle >= 340 || angle < 20) return '[ FRONT ]';
    if (angle >= 20 && angle < 70) return '[ 3/4 FRONT ]';
    if (angle >= 70 && angle < 115) return '[ PROFILE RIGHT ]';
    if (angle >= 115 && angle < 160) return '[ 3/4 REVERSE ]';
    if (angle >= 160 && angle < 205) return '[ REVERSE // NEURAL CORE ]';
    if (angle >= 205 && angle < 250) return '[ 3/4 REVERSE ]';
    if (angle >= 250 && angle < 295) return '[ PROFILE LEFT ]';
    if (angle >= 295 && angle < 340) return '[ 3/4 FRONT ]';
    return '[ FRONT ]';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Allow DOM to settle before initializing ScrollTrigger
  setTimeout(() => {
    window.heroEngine = new Hero360Engine();
  }, 100);
});
