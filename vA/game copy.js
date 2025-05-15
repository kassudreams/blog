class Matrix4 {
    constructor() {
        this.elements = new Float32Array(16);
        this.identity();
    }
    
    
    identity() {
        this.elements.set([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
        return this;
    }
    
    copy(m) {
        this.elements.set(m.elements);
        return this;
    }
    
    multiply(b) {
        const a = this.elements;
        const out = new Float32Array(16);
        
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                out[j*4+i] = 0;
                for (let k = 0; k < 4; k++) {
                    out[j*4+i] += a[k*4+i] * b.elements[j*4+k];
                }
            }
        }
        
        this.elements.set(out);
        return this;
    }
    
    perspective(fov, aspect, near, far) {
        const f = 1.0 / Math.tan(fov * Math.PI / 360);
        const d = far - near;
        
        this.elements.set([
            f/aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, -(far+near)/d, -1,
            0, 0, -(2*far*near)/d, 0
        ]);
        return this;
    }
    
    translate(tx, ty, tz) {
        this.elements[12] += tx;
        this.elements[13] += ty;
        this.elements[14] += tz;
        return this;
    }
    
    scale(sx, sy, sz) {
        this.elements[0] *= sx;
        this.elements[5] *= sy;
        this.elements[10] *= sz;
        return this;
    }
    
    rotateY(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        
        const m11 = this.elements[0], m12 = this.elements[1], m13 = this.elements[2], m14 = this.elements[3];
        const m31 = this.elements[8], m32 = this.elements[9], m33 = this.elements[10], m34 = this.elements[11];
        
        this.elements[0] = c * m11 + s * m31;
        this.elements[1] = c * m12 + s * m32;
        this.elements[2] = c * m13 + s * m33;
        this.elements[3] = c * m14 + s * m34;
        
        this.elements[8] = c * m31 - s * m11;
        this.elements[9] = c * m32 - s * m12;
        this.elements[10] = c * m33 - s * m13;
        this.elements[11] = c * m34 - s * m14;
        
        return this;
    }
    
    rotateX(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        
        const m21 = this.elements[4], m22 = this.elements[5], m23 = this.elements[6], m24 = this.elements[7];
        const m31 = this.elements[8], m32 = this.elements[9], m33 = this.elements[10], m34 = this.elements[11];
        
        this.elements[4] = c * m21 - s * m31;
        this.elements[5] = c * m22 - s * m32;
        this.elements[6] = c * m23 - s * m33;
        this.elements[7] = c * m24 - s * m34;
        
        this.elements[8] = c * m31 + s * m21;
        this.elements[9] = c * m32 + s * m22;
        this.elements[10] = c * m33 + s * m23;
        this.elements[11] = c * m34 + s * m24;
        
        return this;
    }
    
    invert() {
        // Simplified inversion for affine transformations
        const m = this.elements;
        
        // Invert rotation/scale part
        const a = m[0], b = m[1], c = m[2],
              e = m[4], f = m[5], g = m[6],
              i = m[8], j = m[9], k = m[10];
              
        const det = a*(f*k - g*j) - b*(e*k - g*i) + c*(e*j - f*i);
        
        if (Math.abs(det) < 0.0001) {
            console.warn("Matrix inversion failed - matrix may be singular");
            return this;
        }
        
        const invDet = 1.0 / det;
        
        m[0] = (f*k - g*j) * invDet;
        m[1] = -(b*k - c*j) * invDet;
        m[2] = (b*g - c*f) * invDet;
        
        m[4] = -(e*k - g*i) * invDet;
        m[5] = (a*k - c*i) * invDet;
        m[6] = -(a*g - c*e) * invDet;
        
        m[8] = (e*j - f*i) * invDet;
        m[9] = -(a*j - b*i) * invDet;
        m[10] = (a*f - b*e) * invDet;
        
        // Invert translation
        const tx = m[12], ty = m[13], tz = m[14];
        m[12] = -(m[0]*tx + m[4]*ty + m[8]*tz);
        m[13] = -(m[1]*tx + m[5]*ty + m[9]*tz);
        m[14] = -(m[2]*tx + m[6]*ty + m[10]*tz);
        
        return this;
    }
}



class Geometry {
    constructor(gl) {
        this.gl = gl;
        this.vertexBuffer = null;
        this.normalBuffer = null;
        this.texCoordBuffer = null;
        this.indexBuffer = null;
        this.numIndices = 0;
    }

    render(gl, shaderInfo) {
        // Position
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(
            shaderInfo.attribLocations.position,
            3,
            gl.FLOAT,
            false,
            0,
            0
        );
        gl.enableVertexAttribArray(shaderInfo.attribLocations.position);

        // Normals
        if (this.normalBuffer && shaderInfo.attribLocations.normal) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.vertexAttribPointer(
                shaderInfo.attribLocations.normal,
                3,
                gl.FLOAT,
                false,
                0,
                0
            );
            gl.enableVertexAttribArray(shaderInfo.attribLocations.normal);
        }

        // Texture coordinates
        if (this.texCoordBuffer && shaderInfo.attribLocations.texCoord) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
            gl.vertexAttribPointer(
                shaderInfo.attribLocations.texCoord,
                2,
                gl.FLOAT,
                false,
                0,
                0
            );
            gl.enableVertexAttribArray(shaderInfo.attribLocations.texCoord);
        }

        // Draw
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(gl.TRIANGLES, this.numIndices, gl.UNSIGNED_SHORT, 0);
    }
}

class CubeGeometry extends Geometry {
    constructor(gl) {
        super(gl);

        // Vertex positions
        const positions = [
            // Front face
            -1, -1,  1,  1, -1,  1,  1,  1,  1, -1,  1,  1,
            // Back face
            -1, -1, -1, -1,  1, -1,  1,  1, -1,  1, -1, -1,
            // Top face
            -1,  1, -1, -1,  1,  1,  1,  1,  1,  1,  1, -1,
            // Bottom face
            -1, -1, -1,  1, -1, -1,  1, -1,  1, -1, -1,  1,
            // Right face
             1, -1, -1,  1,  1, -1,  1,  1,  1,  1, -1,  1,
            // Left face
            -1, -1, -1, -1, -1,  1, -1,  1,  1, -1,  1, -1
        ];

        // Normals
        const normals = [
            // Front
            0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
            // Back
            0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
            // Top
            0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
            // Bottom
            0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
            // Right
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
            // Left
            -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0
        ];

        // Texture coordinates
        const texCoords = [
            // Front
            0, 0, 1, 0, 1, 1, 0, 1,
            // Back
            1, 0, 1, 1, 0, 1, 0, 0,
            // Top
            0, 1, 0, 0, 1, 0, 1, 1,
            // Bottom
            1, 1, 0, 1, 0, 0, 1, 0,
            // Right
            1, 0, 1, 1, 0, 1, 0, 0,
            // Left
            0, 0, 1, 0, 1, 1, 0, 1
        ];

        // Indices
        const indices = [
            0, 1, 2,  0, 2, 3,    // Front
            4, 5, 6,  4, 6, 7,    // Back
            8, 9, 10, 8, 10, 11,  // Top
            12, 13, 14, 12, 14, 15, // Bottom
            16, 17, 18, 16, 18, 19, // Right
            20, 21, 22, 20, 22, 23  // Left
        ];

        this.numIndices = indices.length;

        // Create buffers
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        this.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

        this.texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    }
}

class BasicMaterial {
    constructor(gl, texture = null) {
        this.gl = gl;
        this.texture = texture;
    }

    activate() {
        if (this.texture) {
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
            return true;
        }
        return false;
    }
}

class SceneNode {
    constructor() {
        this.children = [];
        this.localMatrix = new Matrix4();
        this.worldMatrix = new Matrix4();
        this.visible = true;
    }

    addChild(node) {
        this.children.push(node);
        return node;
    }

    update(parentWorldMatrix) {
        if (parentWorldMatrix) {
            this.worldMatrix.copy(parentWorldMatrix).multiply(this.localMatrix);
        } else {
            this.worldMatrix.copy(this.localMatrix);
        }

        this.children.forEach(child => {
            if (child.update) child.update(this.worldMatrix);
        });
    }

    render(gl, shaderInfo) {
        if (!this.visible) return;

        this.children.forEach(child => {
            if (child.render) child.render(gl, shaderInfo);
        });
    }
}

class MeshNode extends SceneNode {
    constructor(geometry, material) {
        super();
        this.geometry = geometry;
        this.material = material;
    }

    render(gl, shaderInfo) {
        if (!this.visible) return;

        gl.uniformMatrix4fv(
            shaderInfo.uniformLocations.modelMatrix,
            false,
            this.worldMatrix.elements
        );

        if (this.material) {
            this.material.activate();
        }

        this.geometry.render(gl, shaderInfo);

        super.render(gl, shaderInfo);
    }
}

class PhysicsNode extends SceneNode {
    constructor(physicsBody) {
        super();
        this.physicsBody = physicsBody;
    }

    update(parentWorldMatrix) {
        if (this.physicsBody) {
            this.physicsBody.update(1/60); // Fixed timestep for physics
            
            this.localMatrix.identity();
            this.localMatrix.translate(
                this.physicsBody.position[0],
                this.physicsBody.position[1],
                this.physicsBody.position[2]
            );
        }

        super.update(parentWorldMatrix);
    }
}

class PhysicsBody {
    constructor() {
        this.position = [0, 0, 0];
        this.velocity = [0, 0, 0];
        this.acceleration = [0, -9.8, 0]; // Gravity
        this.mass = 1;
        this.restitution = 0.5;
        this.friction = 0.98;
    }

    update(deltaTime) {
        // Update velocity
        this.velocity[0] += this.acceleration[0] * deltaTime;
        this.velocity[1] += this.acceleration[1] * deltaTime;
        this.velocity[2] += this.acceleration[2] * deltaTime;

        // Apply friction
        this.velocity[0] *= this.friction;
        this.velocity[2] *= this.friction;

        // Update position
        this.position[0] += this.velocity[0] * deltaTime;
        this.position[1] += this.velocity[1] * deltaTime;
        this.position[2] += this.velocity[2] * deltaTime;

        // Simple ground collision
        if (this.position[1] < 0) {
            this.position[1] = 0;
            this.velocity[1] = -this.velocity[1] * this.restitution;
        }
    }
}

class AssetLoader {
    constructor(gl) {
        this.gl = gl;
        this.textures = {};
        this.models = {};
    }

    loadTexture(name, url) {
        return new Promise((resolve, reject) => {
            const texture = this.gl.createTexture();
            const image = new Image();
            
            image.onload = () => {
                this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
                this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 
                                  this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
                this.gl.generateMipmap(this.gl.TEXTURE_2D);
                this.textures[name] = texture;
                resolve(texture);
            };
            
            image.onerror = () => {
                console.error(`Failed to load texture: ${url}`);
                reject(new Error(`Texture load failed: ${url}`));
            };
            
            image.src = url;
        });
    }

    loadJSON(name, url) {
        return fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                this.models[name] = data;
                return data;
            })
            .catch(error => {
                console.error(`Failed to load JSON: ${url}`, error);
                throw error;
            });
    }
}

class Camera {
    constructor(canvas) {
        this.canvas = canvas;
        this.mode = 'orbit'; // Start with orbit camera
        this.target = [0, 0, 0];
        this.position = [0, 5, 10];
        this.up = [0, 1, 0];
        this.fov = 60;
        this.aspect = 1;
        this.near = 0.1;
        this.far = 1000;
        
        // Enhanced orbit mode parameters
        this.orbitDistance = 15; // Increased default distance
        this.orbitMinDistance = 2;
        this.orbitMaxDistance = 50; // Much bigger zoom range
        this.orbitAngleX = Math.PI; // Start behind player
        this.orbitAngleY = Math.PI/6;
        this.orbitSpeed = 2;
        this.orbitPosition = [0, 2, 0];
        this.orbitForwardAngle = 0;
        
        // Enhanced third-person parameters
        this.thirdPersonDistance = 5;
        this.thirdPersonHeight = 2;
        this.thirdPersonAngleX = Math.PI; // Properly behind player
        this.thirdPersonAngleY = 0.3;
        this.thirdPersonMaxY = Math.PI/3;
        this.rightMouseDown = false;
    
        // First-person parameters
        this.fpHeight = 1.8;
        this.lookAngleX = 0;
        this.lookAngleY = 0;
        this.maxPitch = Math.PI/3;
        
        // Smoothing
        this.smoothSpeed = 5;
        this.currentPosition = [...this.position];
        this.currentTarget = [...this.target];
    }

    update(deltaTime, targetPosition, input) {
        this.target = targetPosition;
        this.aspect = this.canvas.width / this.canvas.height;
        
        // Camera mode switching
        if (input.isKeyPressed('1')) this.mode = 'firstperson';
        if (input.isKeyPressed('2')) this.mode = 'orbit';
        if (input.isKeyPressed('3')) this.mode = 'thirdperson';
        
        // Update based on mode
        switch (this.mode) {
            case 'firstperson':
                this.updateFirstPersonCamera(deltaTime, input);
                break;
            case 'orbit':
                this.updateOrbitCamera(deltaTime, input);
                break;
            case 'thirdperson':
                this.updateThirdPersonCamera(deltaTime, input);
                break;
        }
        
        // Apply smoothing
        this.applySmoothing(deltaTime);
    }

    updateFirstPersonCamera(deltaTime, input) {
        // Update look angles from mouse
        if (document.pointerLockElement === this.canvas) {
            this.lookAngleX -= input.mouseMovementX * 0.002;
            this.lookAngleY = Math.max(-this.maxPitch, 
                Math.min(this.maxPitch, 
                    this.lookAngleY - input.mouseMovementY * 0.002));
            input.mouseMovementX = 0;
            input.mouseMovementY = 0;
        }
        
        // Position at player's head
        this.position = [
            this.target[0],
            this.target[1] + this.fpHeight,
            this.target[2]
        ];
        
        // Calculate look direction
        const lookDistance = 10;
        this.target = [
            this.position[0] + Math.sin(this.lookAngleX) * Math.cos(this.lookAngleY) * lookDistance,
            this.position[1] + Math.sin(this.lookAngleY) * lookDistance,
            this.position[2] + Math.cos(this.lookAngleX) * Math.cos(this.lookAngleY) * lookDistance
        ];
    }

    updateOrbitCamera(deltaTime, input) {
        // Mouse look (no right mouse button requirement)
        if (document.pointerLockElement === this.canvas) {
            this.orbitAngleX -= input.mouseMovementX * 0.002;
            this.orbitAngleY = Math.max(-Math.PI/3, 
                Math.min(Math.PI/3, 
                    this.orbitAngleY - input.mouseMovementY * 0.002));
            input.mouseMovementX = 0;
            input.mouseMovementY = 0;
            
            // Update forward angle when moving
            if (input.isKeyDown('w') || input.isKeyDown('a') || 
                input.isKeyDown('s') || input.isKeyDown('d')) {
                this.orbitForwardAngle = this.orbitAngleX;
            }
        }
        
        // Enhanced zoom with mouse wheel
        if (input.mouseWheelDelta) {
            this.orbitDistance = Math.max(this.orbitMinDistance, 
                Math.min(this.orbitMaxDistance, 
                    this.orbitDistance - input.mouseWheelDelta * 0.5)); // Faster zoom
            input.mouseWheelDelta = 0;
        }
        
        // Move camera with WASD (relative to view)
        const moveSpeed = 10 * deltaTime;
        const forwardX = Math.sin(this.orbitForwardAngle);
        const forwardZ = Math.cos(this.orbitForwardAngle);
        const rightX = Math.cos(this.orbitForwardAngle);
        const rightZ = -Math.sin(this.orbitForwardAngle);
        
        if (input.isKeyDown('w')) {
            this.orbitPosition[0] += forwardX * moveSpeed;
            this.orbitPosition[2] += forwardZ * moveSpeed;
        }
        if (input.isKeyDown('s')) {
            this.orbitPosition[0] -= forwardX * moveSpeed;
            this.orbitPosition[2] -= forwardZ * moveSpeed;
        }
        if (input.isKeyDown('a')) {
            this.orbitPosition[0] -= rightX * moveSpeed;
            this.orbitPosition[2] -= rightZ * moveSpeed;
        }
        if (input.isKeyDown('d')) {
            this.orbitPosition[0] += rightX * moveSpeed;
            this.orbitPosition[2] += rightZ * moveSpeed;
        }
        
        // Calculate orbit position
        const verticalOffset = Math.sin(this.orbitAngleY) * this.orbitDistance;
        const horizontalDistance = Math.cos(this.orbitAngleY) * this.orbitDistance;
        
        this.position = [
            this.orbitPosition[0] + Math.sin(this.orbitAngleX) * horizontalDistance,
            this.orbitPosition[1] + verticalOffset,
            this.orbitPosition[2] + Math.cos(this.orbitAngleX) * horizontalDistance
        ];
        
        // Look at orbit center
        this.target = [...this.orbitPosition];
    }

    updateThirdPersonCamera(deltaTime, input) {
        // Track right mouse button state
        this.rightMouseDown = input.isMouseDown(2);
        
        // Only rotate camera when right mouse button is held
        if (this.rightMouseDown && document.pointerLockElement === this.canvas) {
            this.thirdPersonAngleX -= input.mouseMovementX * 0.002;
            this.thirdPersonAngleY = Math.max(-this.thirdPersonMaxY, 
                Math.min(this.thirdPersonMaxY, 
                    this.thirdPersonAngleY - input.mouseMovementY * 0.002));
            input.mouseMovementX = 0;
            input.mouseMovementY = 0;
        }
        
        // Calculate camera position (behind player)
        const verticalOffset = Math.sin(this.thirdPersonAngleY) * this.thirdPersonDistance;
        const horizontalDistance = Math.cos(this.thirdPersonAngleY) * this.thirdPersonDistance;
        
        this.position = [
            this.target[0] + Math.sin(this.thirdPersonAngleX) * horizontalDistance,
            this.target[1] + this.thirdPersonHeight + verticalOffset,
            this.target[2] + Math.cos(this.thirdPersonAngleX) * horizontalDistance
        ];
        
        // Look slightly above player's head
        this.target = [
            this.target[0],
            this.target[1] + 0.5,
            this.target[2]
        ];
    }

    applySmoothing(deltaTime) {
        const t = this.smoothSpeed * deltaTime;
        this.currentPosition[0] = this.lerp(this.currentPosition[0], this.position[0], t);
        this.currentPosition[1] = this.lerp(this.currentPosition[1], this.position[1], t);
        this.currentPosition[2] = this.lerp(this.currentPosition[2], this.position[2], t);
        
        this.currentTarget[0] = this.lerp(this.currentTarget[0], this.target[0], t);
        this.currentTarget[1] = this.lerp(this.currentTarget[1], this.target[1], t);
        this.currentTarget[2] = this.lerp(this.currentTarget[2], this.target[2], t);
    }

    lerp(a, b, t) {
        return a + (b - a) * Math.min(t, 1);
    }

    getViewMatrix() {
        const viewMatrix = new Matrix4();
        viewMatrix.lookAt(
            this.currentPosition[0], 
            this.currentPosition[1], 
            this.currentPosition[2],
            this.currentTarget[0], 
            this.currentTarget[1], 
            this.currentTarget[2],
            this.up[0], 
            this.up[1], 
            this.up[2]
        );
        return viewMatrix;
    }

    getProjectionMatrix() {
        const projectionMatrix = new Matrix4();
        projectionMatrix.perspective(this.fov, this.aspect, this.near, this.far);
        return projectionMatrix;
    }
}


// Initialize the game when the page loads
window.addEventListener('load', () => {
    const game = new WebGLGame();
    window.addEventListener('beforeunload', () => game.cleanup());
});

// Add to Matrix4 class
Matrix4.prototype.lookAt = function(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ) {
    // Compute direction vectors
    const z0 = eyeX - centerX;
    const z1 = eyeY - centerY;
    const z2 = eyeZ - centerZ;
    const zLen = 1 / Math.sqrt(z0*z0 + z1*z1 + z2*z2);
    const z0n = z0 * zLen;
    const z1n = z1 * zLen;
    const z2n = z2 * zLen;
    
    const x0 = upY * z2n - upZ * z1n;
    const x1 = upZ * z0n - upX * z2n;
    const x2 = upX * z1n - upY * z0n;
    const xLen = 1 / Math.sqrt(x0*x0 + x1*x1 + x2*x2);
    const x0n = x0 * xLen;
    const x1n = x1 * xLen;
    const x2n = x2 * xLen;
    
    // Correctly calculate the y axis (cross product of z and x)
    const y0 = z1n * x2n - z2n * x1n;
    const y1 = z2n * x0n - z0n * x2n;
    const y2 = z0n * x1n - z1n * x0n;
    
    // Build lookAt matrix (column-major order)
    this.elements.set([
        x0n,  y0, z0n, 0,
        x1n,  y1, z1n, 0,
        x2n,  y2, z2n, 0,
        -(x0n*eyeX + x1n*eyeY + x2n*eyeZ),
        -(y0*eyeX + y1*eyeY + y2*eyeZ),
        -(z0n*eyeX + z1n*eyeY + z2n*eyeZ),
        1
    ]);
    return this;
};

class InputManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.keys = {};
        this.pressedKeys = {};
        this.mouse = { x: 0, y: 0, buttons: {} };
        this.mouseMovementX = 0;
        this.mouseMovementY = 0;
        this.mouseWheelDelta = 0;
        
        // Key events
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (!this.keys[key]) {
                this.pressedKeys[key] = true;
            }
            this.keys[key] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        this.mouseButtons = {};

        canvas.addEventListener('mousedown', (e) => {
            this.mouseButtons[e.button] = true;
        });
        
        canvas.addEventListener('mouseup', (e) => {
            this.mouseButtons[e.button] = false;
        });
    

        
        // Mouse movement
        canvas.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            if (document.pointerLockElement === canvas) {
                this.mouseMovementX += e.movementX;
                this.mouseMovementY += e.movementY;
            }
        });
        
        // Mouse wheel
        canvas.addEventListener('wheel', (e) => {
            this.mouseWheelDelta = e.deltaY;
            e.preventDefault();
        }, { passive: false });
        
        // Pointer lock on click
        canvas.addEventListener('click', () => {
            canvas.requestPointerLock();
        });
    }

    isMouseDown(button) {
        return !!this.mouseButtons[button];
    }
    
    isKeyDown(key) {
        return !!this.keys[key.toLowerCase()];
    }
    
    isKeyPressed(key) {
        return !!this.pressedKeys[key.toLowerCase()];
    }
    
    clearPressedKeys() {
        this.pressedKeys = {};
    }
}

class WebGLGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            throw new Error('Canvas element not found');
        }

        // Initialize WebGL context
        const contextOptions = {
            antialias: true,
            alpha: false,
            powerPreference: "high-performance"
        };
        
        this.gl = this.canvas.getContext('webgl2', contextOptions) || 
                 this.canvas.getContext('experimental-webgl2', contextOptions) ||
                 this.canvas.getContext('webgl', contextOptions);
        
        if (!this.gl) {
            const errorMessage = 'WebGL not supported in your browser';
            document.body.innerHTML = `<div style="color:white;background:red;padding:20px">${errorMessage}</div>`;
            throw new Error(errorMessage);
        }

        // Initialize systems with proper canvas reference
        this.input = new InputManager(this.canvas);
        this.camera = new Camera(this.canvas); // Pass canvas to Camera
        this.assets = new AssetLoader(this.gl);
        this.scene = new SceneNode();
        
        // Matrices
        this.projectionMatrix = new Matrix4();
        this.viewMatrix = new Matrix4();
        this.modelMatrix = new Matrix4();
        
        // Lighting
        this.lightDirection = [0.5, 1.0, 0.7];
        
        // Initialize
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.initShaders();
        this.initTextures();
        
        // Load assets and start game
        this.loadAssets().then(() => {
            this.setupScene();
            this.startGameLoop();
        }).catch(err => {
            console.error('Asset loading failed:', err);
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.projectionMatrix.perspective(45, this.canvas.width/this.canvas.height, 0.1, 1000);
    }

    initShaders() {
        // Vertex shader
        const vsSource = `#version 300 es
        in vec3 aPosition;
        in vec3 aNormal;
        in vec2 aTexCoord;

        uniform mat4 uProjectionMatrix;
        uniform mat4 uViewMatrix;
        uniform mat4 uModelMatrix;

        out vec3 vNormal;
        out vec2 vTexCoord;

        void main() {
            gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
            vNormal = mat3(uModelMatrix) * aNormal;
            vTexCoord = aTexCoord;
        }`;

        // Fragment shader
        const fsSource = `#version 300 es
        precision highp float;

        in vec3 vNormal;
        in vec2 vTexCoord;

        uniform sampler2D uTexture;
        uniform vec3 uLightDirection;

        out vec4 fragColor;

        void main() {
            vec4 texColor = texture(uTexture, vTexCoord);
            float light = max(dot(normalize(vNormal), normalize(uLightDirection)), 0.0);
            fragColor = vec4(texColor.rgb * (0.7 + 0.3 * light), texColor.a);
        }`;

        const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, fsSource);

        this.shaderProgram = this.gl.createProgram();
        this.gl.attachShader(this.shaderProgram, vertexShader);
        this.gl.attachShader(this.shaderProgram, fragmentShader);
        this.gl.linkProgram(this.shaderProgram);

        if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
            console.error('Shader program error:', this.gl.getProgramInfoLog(this.shaderProgram));
        }

        // Get attribute and uniform locations
        this.attribLocations = {
            position: this.gl.getAttribLocation(this.shaderProgram, 'aPosition'),
            normal: this.gl.getAttribLocation(this.shaderProgram, 'aNormal'),
            texCoord: this.gl.getAttribLocation(this.shaderProgram, 'aTexCoord')
        };

        this.uniformLocations = {
            projectionMatrix: this.gl.getUniformLocation(this.shaderProgram, 'uProjectionMatrix'),
            viewMatrix: this.gl.getUniformLocation(this.shaderProgram, 'uViewMatrix'),
            modelMatrix: this.gl.getUniformLocation(this.shaderProgram, 'uModelMatrix'),
            texture: this.gl.getUniformLocation(this.shaderProgram, 'uTexture'),
            lightDirection: this.gl.getUniformLocation(this.shaderProgram, 'uLightDirection')
        };
    }

    compileShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            const shaderType = type === this.gl.VERTEX_SHADER ? 'VERTEX' : 'FRAGMENT';
            console.error(`${shaderType} SHADER COMPILE ERROR:`, this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    initTextures() {
        // Create default white texture
        this.defaultTexture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.defaultTexture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, 
                          this.gl.RGBA, this.gl.UNSIGNED_BYTE, 
                          new Uint8Array([255, 255, 255, 255]));
        
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
    }

    async loadAssets() {
        try {
            // Load default assets
            await this.assets.loadTexture('default', 'textures/default.png');
            console.log('Assets loaded successfully');
        } catch (error) {
            console.error('Error loading assets:', error);
            throw error;
        }
    }

    setupScene() {
        // Create floor (larger and positioned correctly)
        const floorSize = 20;
        const floorNode = new SceneNode();
        floorNode.localMatrix
            .scale(floorSize, 0.1, floorSize)
            .translate(0, -2, 0); // Position below the cube
        
        const floorGeometry = new CubeGeometry(this.gl);
        const floorMaterial = new BasicMaterial(this.gl, this.assets.textures.default);
        const floorMesh = new MeshNode(floorGeometry, floorMaterial);
        floorNode.addChild(floorMesh);
        this.scene.addChild(floorNode);

        // Create player cube with physics
        this.playerBody = new PhysicsBody();
        this.playerBody.position = [0, 2, 0]; // Start above the floor
        this.playerBody.restitution = 0.7; // Make it bouncy
        
        this.playerNode = new PhysicsNode(this.playerBody);
        const playerGeometry = new CubeGeometry(this.gl);
        const playerMaterial = new BasicMaterial(this.gl, this.assets.textures.default);
        const playerMesh = new MeshNode(playerGeometry, playerMaterial);
        this.playerNode.addChild(playerMesh);
        this.scene.addChild(this.playerNode);

        // Create camera node that follows the player
        this.cameraNode = new SceneNode();
        this.cameraOffset = 5; // Distance behind player
        this.cameraHeight = 2; // Height above player
        this.scene.addChild(this.cameraNode);

        // Add some obstacles for fun
        this.createObstacles();
    }

    createObstacles() {
        // Add some boxes to jump on
        for (let i = 0; i < 5; i++) {
            const obstacleBody = new PhysicsBody();
            obstacleBody.position = [Math.random() * 10 - 5, 0.5, Math.random() * 10 - 5];
            obstacleBody.velocity = [0, 0, 0];
            obstacleBody.restitution = 0.3;
            
            const obstacleNode = new PhysicsNode(obstacleBody);
            obstacleNode.localMatrix.scale(1, 1, 1);
            
            const obstacleGeometry = new CubeGeometry(this.gl);
            const obstacleMaterial = new BasicMaterial(this.gl, this.assets.textures.default);
            const obstacleMesh = new MeshNode(obstacleGeometry, obstacleMaterial);
            
            obstacleNode.addChild(obstacleMesh);
            this.scene.addChild(obstacleNode);
        }
    }

    update(deltaTime) {
        // Handle player movement based on camera mode
        const moveSpeed = 10;
        let moveX = 0;
        let moveZ = 0;
        
        if (this.camera.mode === 'firstperson' || this.camera.mode === 'thirdperson') {
            // Get proper forward direction based on camera angle
            let forwardX, forwardZ, rightX, rightZ;
            
            if (this.camera.mode === 'thirdperson') {
                // In third-person, forward is the opposite of camera view direction
                forwardX = -Math.sin(this.camera.thirdPersonAngleX);
                forwardZ = -Math.cos(this.camera.thirdPersonAngleX);
                
                // Right vector is perpendicular
                rightX = Math.cos(this.camera.thirdPersonAngleX);
                rightZ = -Math.sin(this.camera.thirdPersonAngleX);
                
                // Rotate player to face movement direction when moving
                if (this.input.isKeyDown('w') || this.input.isKeyDown('a') || 
                    this.input.isKeyDown('s') || this.input.isKeyDown('d')) {
                    // Only update player rotation when right mouse isn't held
                    if (!this.camera.rightMouseDown) {
                        this.playerBody.rotationY = Math.atan2(-forwardX, -forwardZ);
                    }
                }
            } else { // firstperson
                forwardX = Math.sin(this.camera.lookAngleX);
                forwardZ = Math.cos(this.camera.lookAngleX);
                rightX = Math.cos(this.camera.lookAngleX);
                rightZ = -Math.sin(this.camera.lookAngleX);
            }
            
            if (this.input.isKeyDown('w')) {
                moveX += forwardX * moveSpeed * deltaTime;
                moveZ += forwardZ * moveSpeed * deltaTime;
            }
            if (this.input.isKeyDown('s')) {
                moveX -= forwardX * moveSpeed * deltaTime;
                moveZ -= forwardZ * moveSpeed * deltaTime;
            }
            if (this.input.isKeyDown('a')) {
                moveX += rightX * moveSpeed * deltaTime;
                moveZ += rightZ * moveSpeed * deltaTime;
            }
            if (this.input.isKeyDown('d')) {
                moveX -= rightX * moveSpeed * deltaTime;
                moveZ -= rightZ * moveSpeed * deltaTime;
            }
        }
        
        // Apply movement to player
        this.playerBody.velocity[0] = moveX;
        this.playerBody.velocity[2] = moveZ;
        
        // Jump
        if (this.input.isKeyDown(' ') && this.playerBody.position[1] <= 0.6) {
            this.playerBody.velocity[1] = 8;
        }
        
        // Update scene and camera
        this.scene.update();
        this.camera.update(deltaTime, this.playerBody.position, this.input);
        
        // Update matrices
        this.viewMatrix.copy(this.camera.getViewMatrix());
        this.projectionMatrix.copy(this.camera.getProjectionMatrix());
        
        // Clear input
        this.input.clearPressedKeys();
        this.input.mouseMovementX = 0;
        this.input.mouseMovementY = 0;
    }

    updateCamera(deltaTime) {
        // Smooth camera follow
        const targetX = this.playerBody.position[0];
        const targetY = this.playerBody.position[1] + this.cameraHeight;
        const targetZ = this.playerBody.position[2] + this.cameraOffset;
        
        // Current camera position (from its matrix)
        const currentX = this.cameraNode.localMatrix.elements[12];
        const currentY = this.cameraNode.localMatrix.elements[13];
        const currentZ = this.cameraNode.localMatrix.elements[14];
        
        // Smooth interpolation
        const smoothSpeed = 5.0;
        const newX = currentX + (targetX - currentX) * smoothSpeed * deltaTime;
        const newY = currentY + (targetY - currentY) * smoothSpeed * deltaTime;
        const newZ = currentZ + (targetZ - currentZ) * smoothSpeed * deltaTime;
        
        // Update camera matrix
        this.cameraNode.localMatrix.identity()
            .translate(newX, newY, newZ)
            .rotateY(Math.PI); // Make it face the player
    }

    render() {
        if (!this.gl || !this.shaderProgram) return;

        this.gl.clearColor(0.1, 0.1, 0.1, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.enable(this.gl.DEPTH_TEST);

        this.gl.useProgram(this.shaderProgram);

        // Set projection and view matrices
        this.gl.uniformMatrix4fv(
            this.uniformLocations.projectionMatrix,
            false,
            this.projectionMatrix.elements
        );

        this.gl.uniformMatrix4fv(
            this.uniformLocations.viewMatrix,
            false,
            this.viewMatrix.elements
        );

        // Set light direction
        this.gl.uniform3fv(
            this.uniformLocations.lightDirection,
            this.lightDirection
        );

        // Activate texture unit 0
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.uniform1i(this.uniformLocations.texture, 0);

        // Render scene
        this.scene.render(this.gl, {
            uniformLocations: this.uniformLocations,
            attribLocations: this.attribLocations
        });
    }

    startGameLoop() {
        let lastTime = 0;
        const gameLoop = (timestamp) => {
            try {
                const deltaTime = (timestamp - lastTime) / 1000;
                lastTime = timestamp;

                this.update(Math.min(deltaTime, 0.1)); // Cap delta time
                this.render();

                requestAnimationFrame(gameLoop);
            } catch (error) {
                console.error('Game loop error:', error);
            }
        };
        requestAnimationFrame(gameLoop);
    }

    cleanup() {
        if (this.gl) {
            // Clean up WebGL resources
            if (this.shaderProgram) this.gl.deleteProgram(this.shaderProgram);
            if (this.defaultTexture) this.gl.deleteTexture(this.defaultTexture);
            // Clean up any other resources...
        }
        window.removeEventListener('resize', this.resize);
    }
}

// Initialize the game
window.addEventListener('load', () => {
    const game = new WebGLGame();
    window.addEventListener('beforeunload', () => game.cleanup());
});



// Add missing matrix operations to Matrix4 class
Matrix4.prototype.translate = function(tx, ty, tz) {
    this.elements[12] += tx;
    this.elements[13] += ty;
    this.elements[14] += tz;
    return this;
};

Matrix4.prototype.rotateY = function(angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    
    const m11 = this.elements[0], m12 = this.elements[1], m13 = this.elements[2], m14 = this.elements[3];
    const m31 = this.elements[8], m32 = this.elements[9], m33 = this.elements[10], m34 = this.elements[11];
    
    this.elements[0] = c * m11 + s * m31;
    this.elements[1] = c * m12 + s * m32;
    this.elements[2] = c * m13 + s * m33;
    this.elements[3] = c * m14 + s * m34;
    
    this.elements[8] = c * m31 - s * m11;
    this.elements[9] = c * m32 - s * m12;
    this.elements[10] = c * m33 - s * m13;
    this.elements[11] = c * m34 - s * m14;
    
    return this;
};

Matrix4.prototype.rotateX = function(angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    
    const m21 = this.elements[4], m22 = this.elements[5], m23 = this.elements[6], m24 = this.elements[7];
    const m31 = this.elements[8], m32 = this.elements[9], m33 = this.elements[10], m34 = this.elements[11];
    
    this.elements[4] = c * m21 - s * m31;
    this.elements[5] = c * m22 - s * m32;
    this.elements[6] = c * m23 - s * m33;
    this.elements[7] = c * m24 - s * m34;
    
    this.elements[8] = c * m31 + s * m21;
    this.elements[9] = c * m32 + s * m22;
    this.elements[10] = c * m33 + s * m23;
    this.elements[11] = c * m34 + s * m24;
    
    return this;
};

// Initialize the game
new WebGLGame();