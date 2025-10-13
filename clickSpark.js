// clickSpark.js - Effet de particules au clic
class ClickSpark {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      sparkColor: options.sparkColor || '#00ffff',
      sparkSize: options.sparkSize || 10,
      sparkRadius: options.sparkRadius || 15,
      sparkCount: options.sparkCount || 8,
      duration: options.duration || 400,
      easing: options.easing || 'ease-out',
      extraScale: options.extraScale || 1.0
    };
    
    this.canvas = null;
    this.ctx = null;
    this.sparks = [];
    this.animationId = null;
    
    this.init();
  }
  
  init() {
    // Créer le canvas
    this.canvas = document.createElement('canvas');
    Object.assign(this.canvas.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      userSelect: 'none',
      display: 'block'
    });
    
    this.ctx = this.canvas.getContext('2d');
    
    // S'assurer que l'élément parent a position relative
    if (getComputedStyle(this.element).position === 'static') {
      this.element.style.position = 'relative';
    }
    
    this.element.appendChild(this.canvas);
    
    // Resize canvas
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    
    // Click event
    this.element.addEventListener('click', (e) => this.handleClick(e));
    
    // Start animation loop
    this.animate();
  }
  
  resizeCanvas() {
    const rect = this.element.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }
  
  easeFunc(t) {
    switch (this.options.easing) {
      case 'linear':
        return t;
      case 'ease-in':
        return t * t;
      case 'ease-in-out':
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      default: // ease-out
        return t * (2 - t);
    }
  }
  
  handleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const now = performance.now();
    
    // Créer les sparks
    for (let i = 0; i < this.options.sparkCount; i++) {
      this.sparks.push({
        x,
        y,
        angle: (2 * Math.PI * i) / this.options.sparkCount,
        startTime: now
      });
    }
  }
  
  animate(timestamp) {
    if (!timestamp) timestamp = performance.now();
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw et filter sparks
    this.sparks = this.sparks.filter(spark => {
      const elapsed = timestamp - spark.startTime;
      
      if (elapsed >= this.options.duration) {
        return false;
      }
      
      const progress = elapsed / this.options.duration;
      const eased = this.easeFunc(progress);
      
      const distance = eased * this.options.sparkRadius * this.options.extraScale;
      const lineLength = this.options.sparkSize * (1 - eased);
      
      const x1 = spark.x + distance * Math.cos(spark.angle);
      const y1 = spark.y + distance * Math.sin(spark.angle);
      const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
      const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);
      
      // Draw line
      this.ctx.strokeStyle = this.options.sparkColor;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();
      
      return true;
    });
    
    this.animationId = requestAnimationFrame((ts) => this.animate(ts));
  }
  
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClickSpark;
}