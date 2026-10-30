/**
 * animations.js - GSAP ScrollTrigger Orchestration & Number Counters
 */

class PortfolioAnimations {
  constructor() {
    if (typeof gsap === 'undefined') {
      this.ensureAllVisible();
      return;
    }
    
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    this.init();
  }

  ensureAllVisible() {
    document.querySelectorAll('.skill-category-card, .project-card, .timeline-item, .stat-card, .section-header > *').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.style.visibility = 'visible';
    });
  }

  init() {
    this.initHeroEntrance();
    this.initSectionHeaders();
    this.initAboutCounters();
    this.initTimeline();
    this.initProjectCards();
    this.initSkills();

    // Comprehensive refresh on resize and load
    window.addEventListener('load', () => {
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    });

    // Safety timeout: ensure no element is ever stuck at opacity 0
    setTimeout(() => {
      this.safetyCheckVisibility();
    }, 1800);
  }

  safetyCheckVisibility() {
    const cards = document.querySelectorAll('.skill-category-card, .project-card, .timeline-item');
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      if (rect.top < window.innerHeight + 150) {
        gsap.to(card, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
      }
    });
  }

  initHeroEntrance() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1 } });

    tl.from('.navbar', {
      y: -40,
      opacity: 0,
      duration: 0.8
    })
    .from('.hero-content-left > *', {
      y: 35,
      opacity: 0,
      stagger: 0.12,
      duration: 0.85
    }, '-=0.4')
    .from('.hero-content-right', {
      x: 35,
      opacity: 0,
      duration: 0.85
    }, '-=0.6')
    .from('.turntable-viewport', {
      scale: 0.88,
      opacity: 0,
      duration: 1.1,
      ease: 'expo.out'
    }, '-=0.9');
  }

  initSectionHeaders() {
    const headers = document.querySelectorAll('.section-header');
    headers.forEach(header => {
      gsap.fromTo(header.children, 
        { y: 30, opacity: 0 },
        {
          scrollTrigger: {
            trigger: header,
            start: 'top 90%',
            toggleActions: 'play none none none'
          },
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power2.out'
        }
      );
    });
  }

  initAboutCounters() {
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
      const numEl = card.querySelector('.stat-number');
      if (!numEl) return;

      const targetVal = parseFloat(numEl.getAttribute('data-target')) || 0;
      const prefix    = numEl.getAttribute('data-prefix') || '';
      const suffix    = numEl.getAttribute('data-suffix') || '';
      const isFloat   = numEl.getAttribute('data-float') === 'true';

      // For small integer targets (≤ 10): tick each digit visibly, one by one
      const useStepMode = Number.isInteger(targetVal) && targetVal <= 10 && !isFloat;

      gsap.fromTo(card,
        { y: 30, opacity: 0 },
        {
          scrollTrigger: {
            trigger: card,
            start: 'top 92%',
            onEnter: () => {
              if (useStepMode) {
                // Step-tick animation: 0 → 1 → 2 → … → target
                // Each step takes (totalDuration / target) ms
                const totalDuration = 1400; // ms
                const stepDelay = totalDuration / targetVal;
                let current = 0;

                // Start at 0
                numEl.textContent = `${prefix}0`;

                const tick = () => {
                  current++;
                  if (current < targetVal) {
                    // Mid-step: show plain number, no suffix yet
                    numEl.textContent = `${prefix}${current}`;
                    setTimeout(tick, stepDelay);
                  } else {
                    // Final step: show number + suffix with a brief scale pop
                    numEl.textContent = `${prefix}${targetVal}${suffix}`;
                    // Gold "pop" micro-animation on the number itself
                    gsap.fromTo(numEl,
                      { scale: 1.35, color: '#edd8ad' },
                      { scale: 1, color: '#c9a96e', duration: 0.45, ease: 'elastic.out(1, 0.5)' }
                    );
                  }
                };

                setTimeout(tick, stepDelay);

              } else {
                // Smooth GSAP interpolation for large / float values
                let obj = { val: 0 };
                gsap.to(obj, {
                  val: targetVal,
                  duration: 1.8,
                  ease: 'power2.out',
                  onUpdate: () => {
                    numEl.textContent = `${prefix}${isFloat ? obj.val.toFixed(1) : Math.round(obj.val)}${suffix}`;
                  }
                });
              }
            }
          },
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out'
        }
      );
    });
  }


  initTimeline() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, index) => {
      gsap.fromTo(item,
        { x: -35, opacity: 0 },
        {
          scrollTrigger: {
            trigger: item,
            start: 'top 90%',
            toggleActions: 'play none none none'
          },
          x: 0,
          opacity: 1,
          duration: 0.8,
          delay: index * 0.1,
          ease: 'power2.out'
        }
      );
    });
  }

  initProjectCards() {
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach((card, index) => {
      gsap.fromTo(card,
        { y: 40, opacity: 0 },
        {
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            toggleActions: 'play none none none'
          },
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: (index % 2) * 0.12,
          ease: 'power2.out'
        }
      );
    });
  }

  initSkills() {
    const skillCards = document.querySelectorAll('.skill-category-card');
    const container = document.querySelector('.skills-container');
    if (!skillCards.length || !container) return;

    const rect = container.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      gsap.set(skillCards, { opacity: 1, y: 0 });
      return;
    }

    gsap.fromTo(skillCards,
      { y: 35, opacity: 0 },
      {
        scrollTrigger: {
          trigger: '.skills-container',
          start: 'top 92%',
          toggleActions: 'play none none none',
          onEnter: () => {
            gsap.to(skillCards, { opacity: 1, y: 0, stagger: 0.08, duration: 0.7, ease: 'power2.out' });
          }
        },
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power2.out'
      }
    );
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    window.portfolioAnimations = new PortfolioAnimations();
  }, 250);
});
