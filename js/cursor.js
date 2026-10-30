/**
 * cursor.js - Luxury Magnetic Custom Cursor with Contextual States
 */

class LuxuryCursor {
  constructor() {
    this.cursor = document.querySelector('.custom-cursor');
    this.follower = document.querySelector('.cursor-follower');
    
    // Check if device is desktop and cursor elements exist
    if (!this.cursor || !this.follower || window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    this.pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.mouse = { x: this.pos.x, y: this.pos.y };
    this.speed = 0.16; // Lerp factor for smooth following
    this.isActive = true;

    this.init();
  }

  init() {
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      
      // Instantly position tiny center dot
      this.cursor.style.transform = `translate3d(${this.mouse.x}px, ${this.mouse.y}px, 0)`;
    });

    this.setupContextHover();
    this.render();
  }

  setupContextHover() {
    // Interactive elements hover
    const interactives = document.querySelectorAll('a, button, .interactive, input, textarea');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', () => this.setState('is-hovering', ''));
      el.addEventListener('mouseleave', () => this.clearState());
    });

    // 360 Turntable Drag
    const turntable = document.querySelector('.turntable-viewport');
    if (turntable) {
      turntable.addEventListener('mouseenter', () => this.setState('is-drag', 'DRAG 360°'));
      turntable.addEventListener('mouseleave', () => this.clearState());
    }

    // Project Cards - VIEW
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
      card.addEventListener('mouseenter', () => this.setState('is-view', 'VIEW'));
      card.addEventListener('mouseleave', () => this.clearState());
    });

    // Data explore triggers
    const exploreElements = document.querySelectorAll('[data-cursor="explore"]');
    exploreElements.forEach(el => {
      el.addEventListener('mouseenter', () => this.setState('is-explore', 'EXPLORE'));
      el.addEventListener('mouseleave', () => this.clearState());
    });
  }

  setState(className, textContent = '') {
    this.clearState();
    this.follower.classList.add(className);
    this.follower.textContent = textContent;
  }

  clearState() {
    this.follower.className = 'cursor-follower';
    this.follower.textContent = '';
  }

  render() {
    // Lerp smooth movement for follower ring
    this.pos.x += (this.mouse.x - this.pos.x) * this.speed;
    this.pos.y += (this.mouse.y - this.pos.y) * this.speed;

    this.follower.style.transform = `translate3d(${this.pos.x}px, ${this.pos.y}px, 0)`;

    requestAnimationFrame(() => this.render());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new LuxuryCursor();
});
