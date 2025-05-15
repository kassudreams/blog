import { ECS } from './ecs.js';
import { RenderSystem, DebugSystem, Renderer } from './renderer.js';
import { AssetManager } from './asset-manager.js';
import { 
  TransformComponent,
  MeshComponent,
  CameraComponent,
  PlayerComponent
} from './components.js'; 

import { PlayerSystem, CameraSystem } from './systems.js';
class DebugTools {
  constructor(gl) {
    this.gl = gl;
  }
  draw() {}
  update() {}
}

class InputManager {
  constructor(canvas) {
    canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    // Add more input handlers
  }
  handleMouseMove(e) {}
}

class TimeManager {
  constructor() {
    this.startTime = 0;
    this.delta = 0;
  }
  start() {
    this.startTime = performance.now();
  }
  update() {
    const now = performance.now();
    this.delta = (now - this.startTime) * 0.001;
    this.startTime = now;
  }
}

export class GameEngine {
    constructor(canvas) {
      this.canvas = canvas;
      this.gl = this.initWebGL();
      this.ecs = new ECS();
      this.assets = new AssetManager(this.gl);
      this.renderer = new Renderer(this.gl);
      this.debug = new DebugTools(this.gl);
      this.input = new InputManager(canvas);
      this.time = new TimeManager();
      
      this.registerCoreComponents();
      this.registerCoreSystems();

      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    }
  
    initWebGL() {
        const gl = this.canvas.getContext('webgl2') || this.canvas.getContext('webgl');
        if (!gl) {
          throw new Error('WebGL not supported');
        }
        
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.clearColor(0.1, 0.1, 0.1, 1);
        
        // Handle canvas resize
        const resizeObserver = new ResizeObserver(() => {
          this.canvas.width = this.canvas.clientWidth;
          this.canvas.height = this.canvas.clientHeight;
          gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        });
        resizeObserver.observe(this.canvas);
        
        return gl;
      }
  
    registerCoreComponents() {
      this.ecs.registerComponent('Transform', TransformComponent);
      this.ecs.registerComponent('Mesh', MeshComponent);
      this.ecs.registerComponent('Camera', CameraComponent);
      this.ecs.registerComponent('Player', PlayerComponent);
    }
  
    registerCoreSystems() {
      this.ecs.registerSystem(new RenderSystem(this.renderer));
      this.ecs.registerSystem(new CameraSystem());
      this.ecs.registerSystem(new PlayerSystem(this.input));
      this.ecs.registerSystem(new DebugSystem(this.debug));
    }
  
    async loadBaseAssets() {
      await this.assets.loadShader('default', '/shaders/default.vert', '/shaders/default.frag');
      await this.assets.loadTexture('grid'); // Remove path parameter
      await this.renderer.init();
    }
  
    start() {
      this.time.start();
      this.gameLoop();
    }
  
    gameLoop() {
      this.time.update();
      this.ecs.update(this.time.delta);
      this.debug.update();
      requestAnimationFrame(() => this.gameLoop());
    }
  }

  class LevelEditor extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.engine = null;
      this.selectedEntity = null;
    }
  
    connectedCallback() {
      this.shadowRoot.innerHTML = `
        <div class="editor">
          <div class="viewport"></div>
          <div class="inspector">
            <h3>Entity Properties</h3>
            <div id="properties"></div>
          </div>
        </div>
      `;
      
      this.initEngine();
      this.setupEventListeners();
    }
  
    initEngine() {
      const canvas = document.createElement('canvas');
      this.shadowRoot.querySelector('.viewport').appendChild(canvas);
      this.engine = new GameEngine(canvas);
      this.engine.start();
    }
  
    setupEventListeners() {
      this.engine.canvas.addEventListener('click', e => this.handleCanvasClick(e));
    }
  
    handleCanvasClick(e) {
      // Entity picking implementation
    }
  
    showEntityProperties(entity) {
      const props = this.shadowRoot.querySelector('#properties');
      props.innerHTML = '';
      
      entity.components.forEach(component => {
        const section = document.createElement('div');
        section.innerHTML = `<h4>${component.constructor.name}</h4>`;
        
        Object.entries(component).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.value = value;
          input.addEventListener('change', e => {
            component[key] = e.target.value;
          });
          section.appendChild(input);
        });
        
        props.appendChild(section);
      });
    }
  }
  
  customElements.define('level-editor', LevelEditor);

  // Hot-reload System
class HotReloader {
    constructor(engine) {
      this.engine = engine;
      this.watchers = new Map();
      
      if('WebSocket' in window) {
        this.socket = new WebSocket('ws://localhost:8080/hot-reload');
        this.socket.onmessage = () => location.reload();
      }
    }
  
    watch(path, callback) {
      this.watchers.set(path, callback);
    }
  }
  
  // Entity Debugger
  class EntityDebugger {
    constructor(engine) {
      this.engine = engine;
      this.selectedEntity = null;
      this.observer = new MutationObserver(() => this.update());
    }
  
    attachToDOM(element) {
      this.observer.observe(element, {
        childList: true,
        subtree: true,
        attributes: true
      });
    }
  
    update() {
      if(this.selectedEntity) {
        this.showEntityInfo(this.selectedEntity);
      }
    }
  
    showEntityInfo(entity) {
      console.table({
        Components: [...entity.components],
        Position: entity.transform.position,
        Rotation: entity.transform.rotation
      });
    }
  }
  
  export { HotReloader, EntityDebugger };

