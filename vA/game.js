export class ThirdPersonDemo {
    constructor(engine) {
      this.engine = engine;
      this.playerEntity = null;
      this.cameraEntity = null;
    }
  
    async initialize() {
      await this.engine.loadBaseAssets();
      this.createScene();
      this.createPlayer();
      this.createCamera();
    }
  
    createScene() {
      const ground = this.engine.ecs.createEntity();
      this.engine.ecs.addComponent(ground, 'Transform', {
        position: [0, -1, 0],
        scale: [100, 1, 100]
      });
      this.engine.ecs.addComponent(ground, 'Mesh', {
        material: 'grid',
        color: [0.5, 0.5, 0.5] // Gray color
      });
    }
  
    createPlayer() {
      this.playerEntity = this.engine.ecs.createEntity();
      this.engine.ecs.addComponent(this.playerEntity, 'Transform');
      this.engine.ecs.addComponent(this.playerEntity, 'Mesh', {
        geometry: 'cube',
        material: 'player'
      });
      this.engine.ecs.addComponent(this.playerEntity, 'Player', {
        moveSpeed: 5,
        jumpForce: 8
      });
    }
  
    createCamera() {
      this.cameraEntity = this.engine.ecs.createEntity();
      this.engine.ecs.addComponent(this.cameraEntity, 'Transform', {
        position: [0, 5, 10]
      });
      this.engine.ecs.addComponent(this.cameraEntity, 'Camera', {
        fov: 60,
        near: 0.1,
        far: 1000,
        followTarget: this.playerEntity
      });
    }
  }
