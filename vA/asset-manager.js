export class AssetManager {
    constructor(gl) {
      this.gl = gl;
      this.assets = {
        shaders: new Map(),
        textures: new Map(),
        models: new Map()
      };
    }
  
    async loadShader(name, vertPath, fragPath) {
      const [vertSource, fragSource] = await Promise.all([
        this._fetchText(vertPath),
        this._fetchText(fragPath)
      ]);
      
      this.assets.shaders.set(name, {
        vert: vertSource,
        frag: fragSource
      });
    }
  
    async loadTexture(name) {  // Remove path parameter
        const texture = this.gl.createTexture();
        const size = 64; // Grid texture size
        
        // Create procedural grid texture
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Draw grid pattern
        ctx.fillStyle = '#303030';
        ctx.fillRect(0, 0, size, size);
        ctx.strokeStyle = '#404040';
        ctx.lineWidth = 2;
        
        // Vertical lines
        for(let x = 0; x <= size; x += size/8) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, size);
          ctx.stroke();
        }
        
        // Horizontal lines
        for(let y = 0; y <= size; y += size/8) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(size, y);
          ctx.stroke();
        }
      
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, canvas);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        
        this.assets.textures.set(name, texture);
      }
  
    async loadModel(name, path) {
      const response = await fetch(path);
      const modelData = await response.json();
      this.assets.models.set(name, modelData);
    }
  
    // Helper methods
    async _fetchText(url) {
      const response = await fetch(url);
      return await response.text();
    }
  
    _loadImage(src) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    }
  }