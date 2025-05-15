export class TransformComponent {
  constructor(data = {}) {
    this.position = data.position || [0, 0, 0];
    this.rotation = data.rotation || [0, 0, 0];
    this.scale = data.scale || [1, 1, 1];
    
    // Add matrix calculation
    this.matrix = new Float32Array(16);
    this.updateMatrix();
  }

  updateMatrix() {
    const mat = new Float32Array(16);
    const [x, y, z] = this.position;
    const [sx, sy, sz] = this.scale;
    
    // Create proper model matrix
    mat[0] = sx;
    mat[5] = sy;
    mat[10] = sz;
    mat[12] = x;
    mat[13] = y;
    mat[14] = z;
    mat[15] = 1;
    
    this.matrix = mat;
  }
}

export class MeshComponent {
  constructor(data = {}) {
    this.geometry = this.createCubeGeometry(); // Generate cube vertices
    this.material = data.material || 'default';
    this.color = [1.0, 0.5, 0.2]; // Default orange color
  }

  createCubeGeometry() {
    return new Float32Array([
      // Front face
      -1, -1,  1,  1, -1,  1,  1,  1,  1,
      -1, -1,  1,  1,  1,  1, -1,  1,  1,
      
      // Back face
      -1, -1, -1, -1,  1, -1,  1,  1, -1,
      -1, -1, -1,  1,  1, -1,  1, -1, -1,
      
      // Top face
      -1,  1, -1, -1,  1,  1,  1,  1,  1,
      -1,  1, -1,  1,  1,  1,  1,  1, -1,
      
      // Bottom face
      -1, -1, -1,  1, -1, -1,  1, -1,  1,
      -1, -1, -1,  1, -1,  1, -1, -1,  1,
      
      // Right face
      1, -1, -1, 1,  1, -1, 1,  1,  1,
      1, -1, -1, 1,  1,  1, 1, -1,  1,
      
      // Left face
      -1, -1, -1, -1, -1,  1, -1,  1,  1,
      -1, -1, -1, -1,  1,  1, -1,  1, -1
    ]);
  }
}

export class CameraComponent {
  constructor(data = {}) {
    this.fov = data.fov || 60;
    this.near = data.near || 0.1;
    this.far = data.far || 1000;
    this.followTarget = data.followTarget || null;
    this.projectionMatrix = new Float32Array(16);
    this.viewMatrix = new Float32Array(16);
  }
}

export class PlayerComponent {
  constructor(data = {}) {
    this.moveSpeed = data.moveSpeed || 5;
    this.jumpForce = data.jumpForce || 8;
    this.isGrounded = false;
    this.velocity = [0, 0, 0];
  }
}