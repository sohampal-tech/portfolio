/**
 * typewriter.js
 * - Typewriter  : letter-by-letter for "Focused to [...]"
 * - KineticText : slide-up word-swap kinetic typography for "Fascinated about [...]"
 */

/* ═══════════════════════════════════════════════════════════════
   TYPEWRITER  — letter-by-letter engine  ("Focused to" row)
═══════════════════════════════════════════════════════════════ */
class Typewriter {
  constructor(elementId, phrases, options = {}) {
    this.element = document.getElementById(elementId);
    if (!this.element) return;

    this.phrases = phrases || [
      'Learn DSA',
      'Learn Java',
      'Build AI Projects'
    ];

    this.typeSpeed   = options.typeSpeed   || 90;    // ms per letter typing
    this.deleteSpeed = options.deleteSpeed || 45;    // ms per letter backspacing
    this.pauseEnd    = options.pauseEnd    || 1800;  // pause when fully typed
    this.pauseStart  = options.pauseStart  || 450;   // pause before next word

    this.phraseIndex = 0;
    this.charIndex   = 0;
    this.isDeleting  = false;

    this.tick();
  }

  tick() {
    const currentPhrase = this.phrases[this.phraseIndex];
    let nextDelay = this.typeSpeed;

    if (this.isDeleting) {
      this.charIndex--;
      this.element.textContent = currentPhrase.substring(0, this.charIndex);
      nextDelay = this.deleteSpeed;

      if (this.charIndex === 0) {
        this.isDeleting  = false;
        this.phraseIndex = (this.phraseIndex + 1) % this.phrases.length;
        nextDelay = this.pauseStart;
      }
    } else {
      this.charIndex++;
      this.element.textContent = currentPhrase.substring(0, this.charIndex);

      if (this.charIndex === currentPhrase.length) {
        this.isDeleting = true;
        nextDelay = this.pauseEnd;
      }
    }

    setTimeout(() => this.tick(), nextDelay);
  }
}


/* ═══════════════════════════════════════════════════════════════
   KINETIC TEXT  — slide-up word-swap  ("Fascinated about" row)
═══════════════════════════════════════════════════════════════ */
class KineticText {
  /**
   * @param {string} wrapperId  — id of the .kinetic-word-wrap <span>
   * @param {string[]} words    — phrases to cycle through
   * @param {number} holdMs     — how long each word is visible (ms)
   * @param {number} exitMs     — duration of exit animation (matches CSS)
   * @param {number} enterMs    — duration of enter animation (matches CSS)
   */
  constructor(wrapperId, words, holdMs = 2200, exitMs = 450, enterMs = 550) {
    this.wrap    = document.getElementById(wrapperId);
    if (!this.wrap) return;

    this.words   = words;
    this.holdMs  = holdMs;
    this.exitMs  = exitMs;
    this.enterMs = enterMs;
    this.index   = 0;

    // Seed initial word (already in HTML, just ensure class)
    this.current = this.wrap.querySelector('.kinetic-word');
    if (this.current) {
      this.current.classList.add('enter');
    }

    // Start cycle after first hold
    setTimeout(() => this.next(), this.holdMs);
  }

  next() {
    this.index = (this.index + 1) % this.words.length;

    // 1. Exit current word
    if (this.current) {
      this.current.classList.remove('enter');
      this.current.classList.add('exit');
    }

    // 2. After exit anim completes → swap text & enter
    setTimeout(() => {
      if (this.current) {
        this.current.textContent = this.words[this.index];
        this.current.classList.remove('exit');
        // Force reflow so browser restarts animation
        void this.current.offsetWidth;
        this.current.classList.add('enter');
      }

      // 3. Schedule next swap
      setTimeout(() => this.next(), this.holdMs);
    }, this.exitMs);
  }
}


/* ═══════════════════════════════════════════════════════════════
   BOOT
═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  // "Focused to [...]" — letter-by-letter typewriter (learning journey)
  new Typewriter('typewriter-text', [
    'Learn DSA',
    'Learn Java',
    'Build AI Projects'
  ]);

  // "Fascinated about [...]" — kinetic slide-up (only ML & DS, staggered 800 ms)
  setTimeout(() => {
    new KineticText('kinetic-fascinated-wrap', [
      'Machine Learning',
      'Data Science'
    ], 2400, 450, 550);
  }, 800);

});
