export class PlayerSystem {
    constructor(inputManager) {
      this.input = inputManager;
      this.requiredComponents = ['Player', 'Transform'];
    }
  
    update(delta) {
      const entities = this.ecs.queryEntities(this.requiredComponents);
      
      entities.forEach(entity => {
        const transform = this.ecs.components.Transform.store.get(entity);
        const player = this.ecs.components.Player.store.get(entity);
        
        // Basic movement
        if(this.input.keys?.ArrowUp) transform.position[2] -= player.moveSpeed * delta;
        if(this.input.keys?.ArrowDown) transform.position[2] += player.moveSpeed * delta;
        if(this.input.keys?.ArrowLeft) transform.position[0] -= player.moveSpeed * delta;
        if(this.input.keys?.ArrowRight) transform.position[0] += player.moveSpeed * delta;
        
        // Simple jump
        if(this.input.keys?.Space && player.isGrounded) {
          player.velocity[1] = player.jumpForce;
          player.isGrounded = false;
        }
        
        // Apply gravity
        transform.position[1] += player.velocity[1] * delta;
        player.velocity[1] -= 9.8 * delta;
        
        // Ground check
        if(transform.position[1] <= 0) {
          transform.position[1] = 0;
          player.isGrounded = true;
        }
        
        transform.updateMatrix();
      });
    }
  }
  
  export class CameraSystem {
    update() {
      const cameras = this.ecs.queryEntities(['Camera', 'Transform']);
      const activeCamera = cameras[0];
      
      if(activeCamera) {
        const cameraComp = this.ecs.components.Camera.store.get(activeCamera);
        const cameraTransform = this.ecs.components.Transform.store.get(activeCamera);
        
        // Calculate projection matrix
        const aspect = this.ecs.engine.canvas.width / this.ecs.engine.canvas.height;
        const fov = cameraComp.fov * Math.PI / 180;
        const near = cameraComp.near;
        const far = cameraComp.far;
        
        cameraComp.projectionMatrix = this.perspectiveMatrix(fov, aspect, near, far);
        
        // Calculate view matrix
        cameraComp.viewMatrix = this.lookAtMatrix(
          cameraTransform.position,
          [cameraTransform.position[0], cameraTransform.position[1], cameraTransform.position[2] - 1],
          [0, 1, 0]
        );
        
        if(cameraComp.followTarget) {
          // Update camera position to follow target
          const targetTransform = this.ecs.components.Transform.store.get(cameraComp.followTarget);
          cameraTransform.position[0] = targetTransform.position[0];
          cameraTransform.position[1] = targetTransform.position[1] + 5;
          cameraTransform.position[2] = targetTransform.position[2] + 10;
          cameraTransform.updateMatrix();
        }
      }
      
      this.ecs.engine.renderer.activeCamera = activeCamera;
    }
  
    perspectiveMatrix(fov, aspect, near, far) {
      const mat = new Float32Array(16);
      const f = 1.0 / Math.tan(fov / 2);
      
      mat[0] = f / aspect;
      mat[5] = f;
      mat[10] = (far + near) / (near - far);
      mat[11] = -1;
      mat[14] = (2 * far * near) / (near - far);
      
      return mat;
    }
  
    lookAtMatrix(position, target, up) {
      const mat = new Float32Array(16);
      const zAxis = this.normalize(this.subtractVectors(position, target));
      const xAxis = this.normalize(this.cross(up, zAxis));
      const yAxis = this.normalize(this.cross(zAxis, xAxis));
      
      mat[0] = xAxis[0];
      mat[1] = xAxis[1];
      mat[2] = xAxis[2];
      mat[3] = 0;
      
      mat[4] = yAxis[0];
      mat[5] = yAxis[1];
      mat[6] = yAxis[2];
      mat[7] = 0;
      
      mat[8] = zAxis[0];
      mat[9] = zAxis[1];
      mat[10] = zAxis[2];
      mat[11] = 0;
      
      mat[12] = position[0];
      mat[13] = position[1];
      mat[14] = position[2];
      mat[15] = 1;
      
      return mat;
    }
  
  }