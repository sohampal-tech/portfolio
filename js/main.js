/**
 * main.js - Core UI Controller & Luxury Interactions for Soham Pal's Portfolio
 */

class PortfolioController {
  constructor() {
    this.toastTimer = null;
    this.soundEnabled = false;
    this.audioCtx = null;
    this.init();
  }

  init() {
    this.initPreloader();
    this.initNavbar();
    this.initSmoothScroll();
    this.initActiveNavTracking();
    this.initAudioSynthesizer();
    this.initClipboard();
    this.initProjectModals();
    this.initLiveKolkataClock();
    this.initContactForm();
    this.initProjectCarousels();
  }

  /* 1. Luxury Minimal Preloader */
  initPreloader() {
    const preloader = document.getElementById('preloader');
    const progressBar = document.getElementById('preloader-bar');
    const progressText = document.getElementById('preloader-percent');

    if (!preloader) return;

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5;
      if (progress > 100) progress = 100;

      if (progressBar) progressBar.style.width = `${progress}%`;
      if (progressText) progressText.textContent = `${progress}%`;

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          preloader.classList.add('fade-out');
          document.body.classList.remove('loading');
          if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
          }
        }, 300);
      }
    }, 40);
  }

  /* 2. Navbar Sticky Effect & Mobile Menu */
  initNavbar() {
    const navbar = document.getElementById('navbar');
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');

    window.addEventListener('scroll', () => {
      if (window.scrollY > 30) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });

    if (mobileBtn && navLinks) {
      mobileBtn.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        this.playUiSound('click');
      });

      navLinks.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          navLinks.classList.remove('open');
        });
      });
    }
  }

  /* 3. Smooth Scrolling with Correct GSAP-Pin-Safe Offset */
  initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (!targetId || targetId === '#' || !targetId.startsWith('#')) return;

        // Special case: scrolling back to top (hero)
        if (targetId === '#hero') {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          // Close mobile nav if open
          const navLinks = document.getElementById('nav-links');
          if (navLinks) navLinks.classList.remove('open');
          return;
        }

        const targetEl = document.querySelector(targetId);
        if (!targetEl) return;

        e.preventDefault();

        // Use offsetTop walk — immune to GSAP ScrollTrigger pinning effects.
        // getBoundingClientRect() returns wrong values when the hero is pinned
        // because GSAP holds the viewport still while progress ticks.
        const navHeight = document.getElementById('navbar')?.offsetHeight || 76;
        const docTop = this.getDocumentOffsetTop(targetEl);
        const targetPosition = docTop - navHeight - 8;

        window.scrollTo({
          top: Math.max(0, targetPosition),
          behavior: 'smooth'
        });

        // Close mobile nav if open
        const navLinks = document.getElementById('nav-links');
        if (navLinks) navLinks.classList.remove('open');

        setTimeout(() => {
          if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
        }, 600);
      });
    });
  }

  /**
   * Walks the DOM offsetParent chain to get the true document-level top
   * position of an element, bypassing any GSAP transform/pin distortions.
   */
  getDocumentOffsetTop(el) {
    let top = 0;
    let current = el;
    while (current) {
      top += current.offsetTop || 0;
      current = current.offsetParent;
    }
    return top;
  }

  /* 3b. Active Nav Link Tracking via IntersectionObserver */
  initActiveNavTracking() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    const sectionIds = Array.from(navLinks).map(l => l.getAttribute('href').slice(1)).filter(Boolean);

    const setActive = (id) => {
      navLinks.forEach(link => {
        const linkId = link.getAttribute('href').slice(1);
        link.classList.toggle('active', linkId === id);
      });
    };

    // Use IntersectionObserver with a generous rootMargin so the active
    // section snaps as soon as it enters the upper 40% of the viewport.
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    }, {
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    });

    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    // Fallback: mark Home as active at top of page
    window.addEventListener('scroll', () => {
      if (window.scrollY < 120) setActive('hero');
    }, { passive: true });
  }


  /* 4. Luxury Web Audio Synthesizer */
  initAudioSynthesizer() {
    const audioBtn = document.getElementById('audio-toggle');
    if (!audioBtn) return;

    const setupAudio = () => {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
    };

    audioBtn.addEventListener('click', () => {
      setupAudio();
      this.soundEnabled = !this.soundEnabled;
      audioBtn.classList.toggle('active', this.soundEnabled);

      const statusText = audioBtn.querySelector('.sound-status');
      if (statusText) {
        statusText.textContent = this.soundEnabled ? 'SOUND ON' : 'SOUND OFF';
      }

      if (this.soundEnabled) {
        this.playUiSound('chime');
        this.showToast('Luxury Audio Feedback Enabled');
      }
    });

    document.querySelectorAll('.btn-luxury, .project-card, .nav-link').forEach(el => {
      el.addEventListener('click', () => {
        if (this.soundEnabled) this.playUiSound('click');
      });
    });
  }

  playUiSound(type = 'click') {
    if (!this.soundEnabled || !this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      const now = this.audioCtx.currentTime;

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);

        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'chime') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15);

        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch (e) {
      console.warn('Audio feedback error', e);
    }
  }

  /* 5. 1-Click Clipboard Copy with Toast */
  initClipboard() {
    const copyBtns = document.querySelectorAll('[data-copy]');
    copyBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const textToCopy = btn.getAttribute('data-copy');
        if (!textToCopy) return;

        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(textToCopy).then(() => {
            this.showToast(`Copied ${textToCopy} to clipboard!`);
            this.playUiSound('chime');
          }).catch(() => {
            this.fallbackCopy(textToCopy);
          });
        } else {
          this.fallbackCopy(textToCopy);
        }
      });
    });
  }

  fallbackCopy(text) {
    const tempInput = document.createElement('textarea');
    tempInput.value = text;
    tempInput.style.position = 'fixed';
    tempInput.style.left = '-9999px';
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
      document.execCommand('copy');
      this.showToast(`Copied ${text} to clipboard!`);
    } catch (err) {
      this.showToast('Unable to copy to clipboard.');
    }
    document.body.removeChild(tempInput);
  }

  showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    const toastMsg = toast.querySelector('.toast-text');
    if (toastMsg) toastMsg.textContent = message;

    toast.classList.add('show');

    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  /* 6. Interactive Project Case Study Modals */
  initProjectModals() {
    const modal = document.getElementById('project-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalCategory = document.getElementById('modal-category');
    const modalDesc = document.getElementById('modal-desc');
    const modalTech = document.getElementById('modal-tech');
    const modalImage = document.getElementById('modal-image');
    const closeBtn = document.getElementById('modal-close');

    if (!modal) return;

    const projectData = {
      'brain-tumor': {
        title: 'Brain Tumor Detection Using Deep Learning',
        category: 'Computer Vision // Deep Learning (VGG16)',
        image: 'assets/images/projects/brain-tumor.jpg',
        desc: 'Developed a high-precision medical imaging diagnostic system for classifying MRI scans into tumorous and non-tumorous states. Applied transfer learning with VGG16, automated feature extraction, and convolutional hyperparameter tuning to achieve a verified 93% test accuracy.',
        tech: ['TensorFlow', 'Keras', 'VGG16 CNN', 'Python', 'PIL', 'Medical MRI', 'Scikit-Learn']
      },
      'customer-analytics': {
        title: 'Customer Behavior Analyst & Segmentation',
        category: 'Data Science // Predictive Modeling',
        image: 'assets/images/projects/customer-dashboard.jpg',
        desc: 'Conducted high-dimensional customer shopping telemetry analysis across purchasing trends, churn patterns, and behavioral clusters. Integrated SQL relational pipelines and interactive Power BI executive dashboards for decision-grade business intelligence.',
        tech: ['Python', 'Pandas', 'MySQL', 'Power BI', 'EDA', 'Clustering', 'Seaborn']
      },
      'flight-delay': {
        title: 'US Flight Delay Predictive Analytics Engine',
        category: 'Machine Learning // Risk Modeling',
        image: 'assets/images/projects/flight-delay-features.png',
        desc: 'Engineered a supervised predictive classification pipeline to forecast commercial airline delays, diversions, and weather cancellations across key US hub corridors using historical telemetry, air-traffic logistics, and multi-factor regression models.',
        tech: ['Python', 'Scikit-Learn', 'Pandas', 'EDA', 'Classification', 'NumPy']
      },
      'crop-recommend': {
        title: 'AgroSmart Crop Recommendation System (SIH)',
        category: 'Smart Agriculture // AI Decision Engine',
        image: 'assets/images/projects/crop-recommendation.jpg',
        desc: 'Engineered for the prestigious Smart India Hackathon (SIH 2025). An intelligent agronomic recommendation engine that evaluates nitrogen, phosphorus, potassium, pH, moisture, and microclimate parameters to recommend optimal crop yields.',
        tech: ['Python', 'Scikit-Learn', 'Precision Agriculture', 'Streamlit', 'Supervised Learning']
      },
      'walmart-sales': {
        title: 'Walmart Sales Analysis',
        category: 'Data Analytics // Retail Intelligence',
        image: 'assets/images/projects/walmart-sales.jpg',
        desc: 'End-to-end retail analytics pipeline analyzing Walmart transactional data to surface actionable business intelligence. Uncovered top-performing product categories and branch-level sales leaders, identified the most profitable locations, and mapped customer behavior trends including ratings distribution, preferred payment methods (Cash, Credit Card, E-wallet), and peak shopping hours across three city branches.',
        tech: ['Python', 'Pandas', 'SQL', 'EDA', 'Matplotlib', 'Seaborn', 'Retail Analytics']
      },
      'rice-disease': {
        title: 'AgriVisionAI — Rice Leaf Disease Detection',
        category: 'Computer Vision // Precision Agriculture',
        image: 'assets/images/projects/rice-slide-3.jpg',
        desc: 'Deep learning diagnostic platform for rice leaf disease classification, spatial lesion segmentation, and infection severity metrics. Automatically screens leaf samples, generates localized disease masks (Brown Spot, Leaf Blast, etc.), computes affected area percentages, and suggests actionable agronomic interventions.',
        tech: ['Computer Vision', 'Deep Learning', 'PyTorch / TensorFlow', 'Image Segmentation', 'Streamlit', 'Precision Agriculture']
      }
    };

    document.querySelectorAll('[data-project-key]').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        if (e.target.closest('.carousel-nav-btn')) return;
        if (e.target.closest('.carousel-dots')) return;
        if (card.dataset.wasDragged === 'true') return;

        const key = card.getAttribute('data-project-key');
        const data = projectData[key];
        if (!data) return;

        modalTitle.textContent = data.title;
        modalCategory.textContent = data.category;
        modalDesc.textContent = data.desc;
        modalImage.src = data.image;

        modalTech.innerHTML = data.tech.map(t => `<span class="project-tag">${t}</span>`).join('');

        modal.classList.add('open');
        this.playUiSound('chime');
      });
    });

    const closeModal = () => {
      modal.classList.remove('open');
      this.playUiSound('click');
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });
  }

  /* 7. Live Kolkata (IST) Clock */
  initLiveKolkataClock() {
    const clockEl = document.getElementById('kolkata-time');
    if (!clockEl) return;

    const updateClock = () => {
      const options = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      const kolkataTime = new Intl.DateTimeFormat('en-GB', options).format(new Date());
      clockEl.textContent = `${kolkataTime} IST (Kolkata, IN)`;
    };

    updateClock();
    setInterval(updateClock, 1000);
  }

  /* 8. Modern Contact Form Handler */
  initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contact-name')?.value.trim();
      const email = document.getElementById('contact-email')?.value.trim();
      const message = document.getElementById('contact-message')?.value.trim();

      if (!name || !email || !message) {
        this.showToast('Please fill out all fields.');
        return;
      }

      this.playUiSound('chime');
      this.showToast(`Thank you ${name}! Launching email client...`);

      const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
      const body = encodeURIComponent(`${message}\n\n---\nSender: ${name}\nEmail: ${email}`);
      const mailtoUrl = `mailto:sohampal126@gmail.com?subject=${subject}&body=${body}`;

      setTimeout(() => {
        window.location.href = mailtoUrl;
      }, 500);
    });
  }

  /* Project Image Carousel — auto-slides with real touch swipe, mouse drag, and nav arrows */
  initProjectCarousels() {
    document.querySelectorAll('.project-carousel').forEach(carousel => {
      const track  = carousel.querySelector('.carousel-track');
      const slides = carousel.querySelectorAll('.carousel-slide');
      const dots   = carousel.querySelectorAll('.carousel-dot');
      const prevBtn = carousel.querySelector('.carousel-prev');
      const nextBtn = carousel.querySelector('.carousel-next');
      const counter = carousel.querySelector('.carousel-counter');
      const parentCard = carousel.closest('.project-card');

      if (!slides.length || !track) return;

      // Add progress bar element if not already present
      let progress = carousel.querySelector('.carousel-progress');
      if (!progress) {
        progress = document.createElement('div');
        progress.className = 'carousel-progress';
        progress.style.width = '0%';
        carousel.appendChild(progress);
      }

      let current = 0;
      const total = slides.length;
      const INTERVAL = 3200; // ms per slide
      let startTime = null;
      let rafId = null;
      let paused = false;

      // Touch / Drag variables
      let isDragging = false;
      let startX = 0;
      let currentDragDist = 0;

      const updateUI = () => {
        track.style.transition = 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)';
        track.style.transform = `translateX(-${current * 100}%)`;

        slides.forEach((s, i) => s.classList.toggle('active', i === current));
        dots.forEach((d, i) => d.classList.toggle('active', i === current));

        if (counter) {
          counter.textContent = `${current + 1} / ${total}`;
        }

        startTime = null;
        if (progress) progress.style.width = '0%';
      };

      const goTo = (index) => {
        current = (index + total) % total;
        updateUI();
      };

      const tick = (timestamp) => {
        if (!paused && !isDragging) {
          if (!startTime) startTime = timestamp;
          const elapsed = timestamp - startTime;
          const pct = Math.min((elapsed / INTERVAL) * 100, 100);
          if (progress) progress.style.width = pct + '%';
          if (elapsed >= INTERVAL) {
            goTo(current + 1);
          }
        }
        rafId = requestAnimationFrame(tick);
      };

      // Navigation arrows
      if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          goTo(current - 1);
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          goTo(current + 1);
        });
      }

      // Dot click navigation
      dots.forEach(dot => {
        dot.addEventListener('click', (e) => {
          e.stopPropagation();
          goTo(parseInt(dot.dataset.index, 10));
        });
      });

      // Drag / Swipe handling
      const handleDragStart = (clientX) => {
        isDragging = true;
        startX = clientX;
        currentDragDist = 0;
        track.style.transition = 'none';
        carousel.classList.add('is-dragging');
      };

      const handleDragMove = (clientX) => {
        if (!isDragging) return;
        currentDragDist = clientX - startX;
        const width = carousel.offsetWidth || 1;
        const percent = (currentDragDist / width) * 100;
        track.style.transform = `translateX(calc(-${current * 100}% + ${percent}%))`;

        if (Math.abs(currentDragDist) > 8 && parentCard) {
          parentCard.dataset.wasDragged = 'true';
        }
      };

      const handleDragEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        carousel.classList.remove('is-dragging');

        const threshold = 40; // px
        if (currentDragDist < -threshold) {
          goTo(current + 1);
        } else if (currentDragDist > threshold) {
          goTo(current - 1);
        } else {
          goTo(current);
        }

        setTimeout(() => {
          if (parentCard) parentCard.dataset.wasDragged = 'false';
        }, 200);
      };

      // Mouse events
      carousel.addEventListener('mousedown', (e) => {
        if (e.target.closest('.carousel-nav-btn, .carousel-dots')) return;
        handleDragStart(e.clientX);
      });

      window.addEventListener('mousemove', (e) => {
        if (isDragging) handleDragMove(e.clientX);
      });

      window.addEventListener('mouseup', () => {
        if (isDragging) handleDragEnd();
      });

      // Touch events (mobile & tablet)
      carousel.addEventListener('touchstart', (e) => {
        if (e.target.closest('.carousel-nav-btn, .carousel-dots')) return;
        handleDragStart(e.touches[0].clientX);
      }, { passive: true });

      carousel.addEventListener('touchmove', (e) => {
        if (isDragging) handleDragMove(e.touches[0].clientX);
      }, { passive: true });

      carousel.addEventListener('touchend', () => {
        if (isDragging) handleDragEnd();
      });

      // Hover pause
      carousel.addEventListener('mouseenter', () => { paused = true; });
      carousel.addEventListener('mouseleave', () => {
        paused = false;
        startTime = null;
        if (progress) progress.style.width = '0%';
      });

      updateUI();
      rafId = requestAnimationFrame(tick);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.portfolioApp = new PortfolioController();
});
