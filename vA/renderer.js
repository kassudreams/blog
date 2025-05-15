export class RenderSystem {
    constructor(renderer) {
      this.renderer = renderer;
      this.requiredComponents = ['Transform', 'Mesh'];
    }
  
    update(delta) {
      const entities = this.ecs.queryEntities(this.requiredComponents);
      this.renderer.render(entities);
    }
  }
  
 export class DebugSystem {
    constructor(debug) {
      this.debug = debug;
    }
  
    update() {
      this.debug.draw();
    }
  }
  
  export class Renderer {
    constructor(gl) {
      this.gl = gl;
      this.programs = new Map();
      this.activeCamera = null;
      this.defaultProgram = null;
    }
  
    async init() {
      this.defaultProgram = await this.createProgram(
        await this.loadShader('vert', '/shaders/default.vert'),
        await this.loadShader('frag', '/shaders/default.frag')
      );
    }
  
    async loadShader(type, path) {
      const response = await fetch(path);
      return await response.text();
    }
  
    async createProgram(vertSource, fragSource) {
      const program = this.gl.createProgram();
      const vertShader = this.compileShader(this.gl.VERTEX_SHADER, vertSource);
      const fragShader = this.compileShader(this.gl.FRAGMENT_SHADER, fragSource);
      
      this.gl.attachShader(program, vertShader);
      this.gl.attachShader(program, fragShader);
      this.gl.linkProgram(program);
      
      if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
        console.error('Shader program error:', this.gl.getProgramInfoLog(program));
      }
      
      return program;
    }
  
    compileShader(type, source) {
      const shader = this.gl.createShader(type);
      this.gl.shaderSource(shader, source);
      this.gl.compileShader(shader);
      
      if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', this.gl.getShaderInfoLog(shader));
      }
      
      return shader;
    }

    drawMesh(mesh) {
      const gl = this.gl;
      
      // Create vertex buffer if it doesn't exist
      if (!mesh.vertexBuffer) {
        mesh.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, mesh.geometry, gl.STATIC_DRAW);
      }
  
      // Set up vertex attributes
      const positionLocation = gl.getAttribLocation(gl.getParameter(gl.CURRENT_PROGRAM), 'position');
      gl.enableVertexAttribArray(positionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
      gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
  
      // Draw the cube
      gl.drawArrays(gl.TRIANGLES, 0, mesh.geometry.length / 3);
    }
  
    setUniforms(modelMatrix, camera) {
      const gl = this.gl;
      const program = gl.getParameter(gl.CURRENT_PROGRAM);
      
      // Matrix uniforms
      gl.uniformMatrix4fv(
        gl.getUniformLocation(program, 'modelMatrix'),
        false,
        modelMatrix
      );
      
      gl.uniformMatrix4fv(
        gl.getUniformLocation(program, 'viewMatrix'),
        false,
        camera.viewMatrix
      );
      
      gl.uniformMatrix4fv(
        gl.getUniformLocation(program, 'projectionMatrix'),
        false,
        camera.projectionMatrix
      );
  
      // Color uniform
      gl.uniform3fv(
        gl.getUniformLocation(program, 'color'),
        new Float32Array([0.8, 0.2, 0.3]) // Default red color
      );
    }
  }
