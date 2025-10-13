// decryptedText.js - Effet de texte décrypté
class DecryptedText {
  constructor(element, options = {}) {
    this.element = element;
    this.originalText = element.textContent;
    this.options = {
      speed: options.speed || 50,
      maxIterations: options.maxIterations || 10,
      characters: options.characters || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+',
      animateOn: options.animateOn || 'hover', // 'hover', 'view', 'both'
      sequential: options.sequential || false,
      revealDirection: options.revealDirection || 'start' // 'start', 'end', 'center'
    };
    
    this.isAnimating = false;
    this.hasAnimated = false;
    this.currentIteration = 0;
    this.revealedIndices = new Set();
    this.interval = null;
    
    this.init();
  }
  
  init() {
    // Ajouter un wrapper pour l'accessibilité
    const originalHTML = this.element.innerHTML;
    this.element.innerHTML = `<span aria-hidden="true"></span>`;
    this.animatedSpan = this.element.querySelector('span');
    this.animatedSpan.textContent = this.originalText;
    
    // Events hover
    if (this.options.animateOn === 'hover' || this.options.animateOn === 'both') {
      this.element.addEventListener('mouseenter', () => this.startAnimation());
      this.element.addEventListener('mouseleave', () => this.stopAnimation());
    }
    
    // Intersection Observer pour 'view'
    if (this.options.animateOn === 'view' || this.options.animateOn === 'both') {
      this.setupIntersectionObserver();
    }
  }
  
  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.hasAnimated) {
          this.startAnimation();
          this.hasAnimated = true;
        }
      });
    }, { threshold: 0.1 });
    
    observer.observe(this.element);
  }
  
  getRandomChar() {
    return this.options.characters[Math.floor(Math.random() * this.options.characters.length)];
  }
  
  getNextIndex() {
    const textLength = this.originalText.length;
    
    switch (this.options.revealDirection) {
      case 'start':
        return this.revealedIndices.size;
        
      case 'end':
        return textLength - 1 - this.revealedIndices.size;
        
      case 'center': {
        const middle = Math.floor(textLength / 2);
        const offset = Math.floor(this.revealedIndices.size / 2);
        const nextIndex = this.revealedIndices.size % 2 === 0 
          ? middle + offset 
          : middle - offset - 1;
          
        if (nextIndex >= 0 && nextIndex < textLength && !this.revealedIndices.has(nextIndex)) {
          return nextIndex;
        }
        
        for (let i = 0; i < textLength; i++) {
          if (!this.revealedIndices.has(i)) return i;
        }
        return 0;
      }
      
      default:
        return this.revealedIndices.size;
    }
  }
  
  shuffleText() {
    return this.originalText
      .split('')
      .map((char, i) => {
        if (char === ' ') return ' ';
        if (this.revealedIndices.has(i)) return this.originalText[i];
        return this.getRandomChar();
      })
      .join('');
  }
  
  startAnimation() {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    this.currentIteration = 0;
    this.revealedIndices.clear();
    
    this.interval = setInterval(() => {
      if (this.options.sequential) {
        // Mode séquentiel : révèle lettre par lettre
        if (this.revealedIndices.size < this.originalText.length) {
          const nextIndex = this.getNextIndex();
          this.revealedIndices.add(nextIndex);
          this.animatedSpan.textContent = this.shuffleText();
        } else {
          this.stopAnimation();
        }
      } else {
        // Mode simultané : scramble tout puis révèle
        this.animatedSpan.textContent = this.shuffleText();
        this.currentIteration++;
        
        if (this.currentIteration >= this.options.maxIterations) {
          this.stopAnimation();
          this.animatedSpan.textContent = this.originalText;
        }
      }
    }, this.options.speed);
  }
  
  stopAnimation() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    
    this.isAnimating = false;
    this.animatedSpan.textContent = this.originalText;
    this.revealedIndices.clear();
    this.currentIteration = 0;
  }
  
  destroy() {
    this.stopAnimation();
    this.element.textContent = this.originalText;
  }
}

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DecryptedText;
}