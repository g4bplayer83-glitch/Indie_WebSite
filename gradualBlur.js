// gradualBlur.js - Effet de blur graduel au scroll
class GradualBlur {
  constructor(options = {}) {
    this.options = {
      position: options.position || 'bottom', // 'top', 'bottom', 'left', 'right'
      strength: options.strength || 2,
      height: options.height || '6rem',
      divCount: options.divCount || 5,
      exponential: options.exponential || false,
      zIndex: options.zIndex || 1000,
      opacity: options.opacity || 1,
      curve: options.curve || 'linear', // 'linear', 'bezier', 'ease-in', 'ease-out', 'ease-in-out'
      target: options.target || 'parent', // 'parent' ou 'page'
      className: options.className || ''
    };
    
    this.container = null;
    this.init();
  }
  
  init() {
    this.container = document.createElement('div');
    this.container.className = `gradual-blur ${this.options.className}`;
    this.applyStyles();
    this.createBlurDivs();
    
    if (this.options.target === 'page') {
      document.body.appendChild(this.container);
    }
  }
  
  applyStyles() {
    const isVertical = ['top', 'bottom'].includes(this.options.position);
    
    const styles = {
      position: this.options.target === 'page' ? 'fixed' : 'absolute',
      pointerEvents: 'none',
      zIndex: this.options.zIndex,
      [this.options.position]: '0',
      opacity: this.options.opacity
    };
    
    if (isVertical) {
      styles.height = this.options.height;
      styles.width = '100%';
      styles.left = '0';
      styles.right = '0';
    } else {
      styles.width = this.options.height;
      styles.height = '100%';
      styles.top = '0';
      styles.bottom = '0';
    }
    
    Object.assign(this.container.style, styles);
  }
  
  getCurveValue(progress) {
    switch (this.options.curve) {
      case 'linear':
        return progress;
      case 'bezier':
        return progress * progress * (3 - 2 * progress);
      case 'ease-in':
        return progress * progress;
      case 'ease-out':
        return 1 - Math.pow(1 - progress, 2);
      case 'ease-in-out':
        return progress < 0.5 
          ? 2 * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      default:
        return progress;
    }
  }
  
  getGradientDirection() {
    const directions = {
      top: 'to top',
      bottom: 'to bottom',
      left: 'to left',
      right: 'to right'
    };
    return directions[this.options.position] || 'to bottom';
  }
  
  createBlurDivs() {
    const increment = 100 / this.options.divCount;
    const direction = this.getGradientDirection();
    
    for (let i = 1; i <= this.options.divCount; i++) {
      const progress = this.getCurveValue(i / this.options.divCount);
      
      // Calcul du blur
      let blurValue;
      if (this.options.exponential) {
        blurValue = Math.pow(2, progress * 4) * 0.0625 * this.options.strength;
      } else {
        blurValue = 0.0625 * (progress * this.options.divCount + 1) * this.options.strength;
      }
      
      // Positions du gradient
      const p1 = Math.round((increment * i - increment) * 10) / 10;
      const p2 = Math.round(increment * i * 10) / 10;
      const p3 = Math.round((increment * i + increment) * 10) / 10;
      const p4 = Math.round((increment * i + increment * 2) * 10) / 10;
      
      let gradient = `transparent ${p1}%, black ${p2}%`;
      if (p3 <= 100) gradient += `, black ${p3}%`;
      if (p4 <= 100) gradient += `, transparent ${p4}%`;
      
      // Créer la div de blur
      const blurDiv = document.createElement('div');
      Object.assign(blurDiv.style, {
        position: 'absolute',
        inset: '0',
        maskImage: `linear-gradient(${direction}, ${gradient})`,
        WebkitMaskImage: `linear-gradient(${direction}, ${gradient})`,
        backdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
        WebkitBackdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
        opacity: this.options.opacity
      });
      
      this.container.appendChild(blurDiv);
    }
  }
  
  attachToElement(element) {
    if (this.options.target !== 'parent') {
      console.warn('Use target: "parent" to attach to specific element');
      return;
    }
    
    element.style.position = 'relative';
    element.appendChild(this.container);
  }
  
  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GradualBlur;
}