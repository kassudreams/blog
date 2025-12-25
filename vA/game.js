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
                out[j * 4 + i] = 0;
                for (let k = 0; k < 4; k++) {
                    out[j * 4 + i] += a[k * 4 + i] * b.elements[j * 4 + k];
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
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, -(far + near) / d, -1,
            0, 0, -(2 * far * near) / d, 0
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

        const det = a * (f * k - g * j) - b * (e * k - g * i) + c * (e * j - f * i);

        if (Math.abs(det) < 0.0001) {
            console.warn("Matrix inversion failed - matrix may be singular");
            return this;
        }

        const invDet = 1.0 / det;

        m[0] = (f * k - g * j) * invDet;
        m[1] = -(b * k - c * j) * invDet;
        m[2] = (b * g - c * f) * invDet;

        m[4] = -(e * k - g * i) * invDet;
        m[5] = (a * k - c * i) * invDet;
        m[6] = -(a * g - c * e) * invDet;

        m[8] = (e * j - f * i) * invDet;
        m[9] = -(a * j - b * i) * invDet;
        m[10] = (a * f - b * e) * invDet;

        // Invert translation
        const tx = m[12], ty = m[13], tz = m[14];
        m[12] = -(m[0] * tx + m[4] * ty + m[8] * tz);
        m[13] = -(m[1] * tx + m[5] * ty + m[9] * tz);
        m[14] = -(m[2] * tx + m[6] * ty + m[10] * tz);

        return this;
    }

    lookAt(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ) {
        // Compute direction vectors
        const z0 = eyeX - centerX;
        const z1 = eyeY - centerY;
        const z2 = eyeZ - centerZ;
        const zLen = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
        const z0n = z0 * zLen;
        const z1n = z1 * zLen;
        const z2n = z2 * zLen;

        const x0 = upY * z2n - upZ * z1n;
        const x1 = upZ * z0n - upX * z2n;
        const x2 = upX * z1n - upY * z0n;
        const xLen = 1 / Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
        const x0n = x0 * xLen;
        const x1n = x1 * xLen;
        const x2n = x2 * xLen;

        // Correctly calculate the y axis (cross product of z and x)
        const y0 = z1n * x2n - z2n * x1n;
        const y1 = z2n * x0n - z0n * x2n;
        const y2 = z0n * x1n - z1n * x0n;

        // Build lookAt matrix (column-major order)
        this.elements.set([
            x0n, y0, z0n, 0,
            x1n, y1, z1n, 0,
            x2n, y2, z2n, 0,
            -(x0n * eyeX + x1n * eyeY + x2n * eyeZ),
            -(y0 * eyeX + y1 * eyeY + y2 * eyeZ),
            -(z0n * eyeX + z1n * eyeY + z2n * eyeZ),
            1
        ]);
        return this;
    }
   transformPoint(vec) {
        const x = vec[0], y = vec[1], z = vec[2];
        const m = this.elements;

        // Assuming column-major order for 'm' (standard WebGL)
        const transformedX = m[0] * x + m[4] * y + m[8] * z + m[12];
        const transformedY = m[1] * x + m[5] * y + m[9] * z + m[13];
        const transformedZ = m[2] * x + m[6] * y + m[10] * z + m[14];
        const w = m[3] * x + m[7] * y + m[11] * z + m[15]; // Homogeneous coordinate for perspective division

        // Perform perspective division if w is not 0
        if (w !== 0) {
            return [transformedX / w, transformedY / w, transformedZ / w];
        } else {
            // Handle case where w is 0 (e.g., point at infinity)
            console.warn("Attempted to transform a point that resulted in w=0. Division by zero avoided.");
            return [transformedX, transformedY, transformedZ]; // Return untransformed for now
        }
    }

    // NEW: Method to transform a 3D vector (only rotation/scale, ignores translation)
    transformVector(vec) {
        const x = vec[0], y = vec[1], z = vec[2];
        const m = this.elements;

        // Assuming column-major order for 'm' (standard WebGL)
        const transformedX = m[0] * x + m[4] * y + m[8] * z;
        const transformedY = m[1] * x + m[5] * y + m[9] * z;
        const transformedZ = m[2] * x + m[6] * y + m[10] * z;

        // Normals should always be normalized after transformation
        return Vec3.normalize([transformedX, transformedY, transformedZ]);
    }
}
// Perlin Noise Implementation (simplified for demonstration)
// You might want to use a more robust library like 'simplex-noise.js' for production
// This is a basic 2D Perlin noise for terrain heightmap
class PerlinNoise {
    constructor(seed = Math.random()) {
        this.seed = seed;
        this.p = new Uint8Array(512);
        this.permutation = new Uint8Array(256);
        for (let i = 0; i < 256; i++) {
            this.permutation[i] = i;
        }

        // Shuffle the permutation array
        for (let i = 0; i < 256; i++) {
            const r = Math.floor(seed * (256 - i)) + i;
            const tmp = this.permutation[i];
            this.permutation[i] = this.permutation[r];
            this.permutation[r] = tmp;
            seed = this.hash(seed + i); // Update seed for better randomness if needed
        }

        for (let i = 0; i < 512; i++) {
            this.p[i] = this.permutation[i % 256];
        }
    }

    // A simple hash function for seeding (not cryptographically secure)
    hash(n) {
        let x = Math.sin(n) * 10000;
        return x - Math.floor(x);
    }

    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(a, b, t) {
        return a + t * (b - a);
    }

    grad(hash, x, y) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    // 2D Perlin Noise function
    noise2D(x, y) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);

        const u = this.fade(x);
        const v = this.fade(y);

        const A = this.p[X] + Y;
        const B = this.p[X + 1] + Y;

        return this.lerp(
            this.lerp(this.grad(this.p[A], x, y), this.grad(this.p[B], x - 1, y), u),
            this.lerp(this.grad(this.p[A + 1], x, y - 1), this.grad(this.p[B + 1], x - 1, y - 1), u),
            v
        );
    }

    // Fractal Brownian Motion (FBM) for more complex terrain
    fbm2D(x, y, octaves = 4, persistence = 0.5, lacunarity = 2.0) {
        let total = 0;
        let frequency = 1;
        let amplitude = 1;
        let maxValue = 0; // Used for normalizing result to 0.0 - 1.0

        for (let i = 0; i < octaves; i++) {
            total += this.noise2D(x * frequency, y * frequency) * amplitude;

            maxValue += amplitude;

            amplitude *= persistence;
            frequency *= lacunarity;
        }

        return total / maxValue; // Normalize to approx. -1 to 1, then convert below
    }
}



// Helper class for 3D Vector operations (you might already have something similar)
class Vec3 {
    static add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
    static sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
    static mul(v, s) { return [v[0] * s, v[1] * s, v[2] * s]; }
    static normalize(v) {
        const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        return len > 0 ? [v[0] / len, v[1] / len, v[2] / len] : [0, 0, 0];
    }
    static cross(a, b) {
        return [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0]
        ];
    }
    static rotateX(v, angle) {
        const y = v[1];
        const z = v[2];
        return [
            v[0],
            y * Math.cos(angle) - z * Math.sin(angle),
            y * Math.sin(angle) + z * Math.cos(angle)
        ];
    }
    static rotateY(v, angle) {
        const x = v[0];
        const z = v[2];
        return [
            x * Math.cos(angle) + z * Math.sin(angle),
            v[1],
            -x * Math.sin(angle) + z * Math.cos(angle)
        ];
    }
    static rotateZ(v, angle) {
        const x = v[0];
        const y = v[1];
        return [
            x * Math.cos(angle) - y * Math.sin(angle),
            x * Math.sin(angle) + y * Math.cos(angle),
            v[2]
        ];
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



class PlaneGeometry extends Geometry {
    constructor(gl, width = 10, depth = 10, widthSegments = 10, depthSegments = 10, noiseGenerator = null, heightScale = 5) {
        super(gl);

        const positions = [];
        const normals = [];
        const texCoords = [];
        const indices = [];

        const halfWidth = width / 2;
        const halfDepth = depth / 2;

        const segmentWidth = width / widthSegments;
        const segmentDepth = depth / depthSegments;

        for (let z = 0; z <= depthSegments; z++) {
            const v = z / depthSegments;
            for (let x = 0; x <= widthSegments; x++) {
                const u = x / widthSegments;

                const currentX = -halfWidth + u * width;
                const currentZ = -halfDepth + v * depth;
                let currentY = 0;

                if (noiseGenerator) {
                    // Apply fractal noise for height
                    const noiseVal = noiseGenerator.fbm2D(
                        currentX * 0.1, // Scale input for noise (controls detail frequency)
                        currentZ * 0.1, // Adjust these multipliers for different terrain features
                        4,             // Octaves
                        0.5,           // Persistence
                        2.0            // Lacunarity
                    );
                    currentY = (noiseVal * 0.5 + 0.5) * heightScale; // Map noise from [-1,1] to [0,1] then scale
                }

                positions.push(currentX, currentY, currentZ);
                texCoords.push(u * width, v * depth); // Scale texture coords for repeating texture

                // Placeholder normal, will be recalculated
                normals.push(0, 1, 0);
            }
        }

        // Generate indices for triangles
        for (let z = 0; z < depthSegments; z++) {
            for (let x = 0; x < widthSegments; x++) {
                const a = z * (widthSegments + 1) + x;
                const b = a + 1;
                const c = (z + 1) * (widthSegments + 1) + x;
                const d = c + 1;

                // Two triangles per quad
                indices.push(a, c, b);
                indices.push(b, c, d);
            }
        }

        this.numIndices = indices.length;

        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        this.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW); // Initial normals

        this.texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

        // Recalculate normals after initial buffer creation
        this.recalculateNormals(gl, positions, indices);
    }

    recalculateNormals(gl, positions, indices) {
        const vertexNormals = new Array(positions.length).fill(0);

        for (let i = 0; i < indices.length; i += 3) {
            const i1 = indices[i] * 3;
            const i2 = indices[i + 1] * 3;
            const i3 = indices[i + 2] * 3;

            const v1 = [positions[i1], positions[i1 + 1], positions[i1 + 2]];
            const v2 = [positions[i2], positions[i2 + 1], positions[i2 + 2]];
            const v3 = [positions[i3], positions[i3 + 1], positions[i3 + 2]];

            // Calculate two edges of the triangle
            const edge1 = [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]];
            const edge2 = [v3[0] - v1[0], v3[1] - v1[1], v3[2] - v1[2]];

            // Calculate face normal using cross product
            const normal = [
                edge1[1] * edge2[2] - edge1[2] * edge2[1],
                edge1[2] * edge2[0] - edge1[0] * edge2[2],
                edge1[0] * edge2[1] - edge1[1] * edge2[0]
            ];

            // Add face normal to vertex normals
            vertexNormals[i1] += normal[0];
            vertexNormals[i1 + 1] += normal[1];
            vertexNormals[i1 + 2] += normal[2];

            vertexNormals[i2] += normal[0];
            vertexNormals[i2 + 1] += normal[1];
            vertexNormals[i2 + 2] += normal[2];

            vertexNormals[i3] += normal[0];
            vertexNormals[i3 + 1] += normal[1];
            vertexNormals[i3 + 2] += normal[2];
        }

        // Normalize all vertex normals
        for (let i = 0; i < vertexNormals.length; i += 3) {
            const x = vertexNormals[i];
            const y = vertexNormals[i + 1];
            const z = vertexNormals[i + 2];
            const len = Math.sqrt(x * x + y * y + z * z);
            if (len > 0) {
                vertexNormals[i] /= len;
                vertexNormals[i + 1] /= len;
                vertexNormals[i + 2] /= len;
            }
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);
    }
}

class CubeGeometry extends Geometry {
    constructor(gl) {
        super(gl);

        // Vertex positions
        const positions = [
            // Front face
            -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1,
            // Back face
            -1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1, -1,
            // Top face
            -1, 1, -1, -1, 1, 1, 1, 1, 1, 1, 1, -1,
            // Bottom face
            -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1,
            // Right face
            1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1,
            // Left face
            -1, -1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1
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
            0, 1, 0, 0, 1, 0, 1, 0,
            // Bottom
            1, 1, 0, 1, 0, 0, 1, 0,
            // Right
            1, 0, 1, 1, 0, 1, 0, 0,
            // Left
            0, 0, 1, 0, 1, 1, 0, 1
        ];

        // Indices
        const indices = [
            0, 1, 2, 0, 2, 3,    // Front
            4, 5, 6, 4, 6, 7,    // Back
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

class SphereGeometry extends Geometry {
    constructor(gl, radius = 1, segments = 32) {
        super(gl);

        const positions = [];
        const normals = [];
        const texCoords = [];
        const indices = [];

        // Generate vertices
        for (let latNumber = 0; latNumber <= segments; latNumber++) {
            const theta = latNumber * Math.PI / segments;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            for (let longNumber = 0; longNumber <= segments; longNumber++) {
                const phi = longNumber * 2 * Math.PI / segments;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);

                const x = cosPhi * sinTheta;
                const y = cosTheta;
                const z = sinPhi * sinTheta;

                positions.push(radius * x, radius * y, radius * z);
                normals.push(x, y, z); // Normals point outwards from center for a sphere
                texCoords.push(1 - (longNumber / segments), 1 - (latNumber / segments));
            }
        }

        // Generate indices
        for (let latNumber = 0; latNumber < segments; latNumber++) {
            for (let longNumber = 0; longNumber < segments; longNumber++) {
                const first = (latNumber * (segments + 1)) + longNumber;
                const second = first + segments + 1;

                indices.push(first, second, first + 1);
                indices.push(second, second + 1, first + 1);
            }
        }

        this.numIndices = indices.length;

        // Create buffers (same as CubeGeometry)
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

// NEW: CylinderGeometry for the shield
class CylinderGeometry extends Geometry {
    constructor(gl, radiusTop = 1, radiusBottom = 1, height = 2, radialSegments = 32, heightSegments = 1) {
        super(gl);

        const positions = [];
        const normals = [];
        const texCoords = [];
        const indices = [];

        // Vertices for the body
        for (let j = 0; j <= heightSegments; j++) {
            const v = j / heightSegments; // 0 to 1 along height
            const y = -height / 2 + v * height;
            const radius = radiusBottom + (radiusTop - radiusBottom) * v;

            for (let i = 0; i <= radialSegments; i++) {
                const u = i / radialSegments; // 0 to 1 around circumference
                const theta = u * Math.PI * 2;
                const sinTheta = Math.sin(theta);
                const cosTheta = Math.cos(theta);

                const x = radius * cosTheta;
                const z = radius * sinTheta;

                positions.push(x, y, z);
                // Normals for the side, pointing outwards
                const normalX = cosTheta;
                const normalZ = sinTheta;
                normals.push(normalX, 0, normalZ); // Only horizontal component for cylindrical surface
                texCoords.push(u, v);
            }
        }

        // Indices for the body
        for (let j = 0; j < heightSegments; j++) {
            for (let i = 0; i < radialSegments; i++) {
                const a = j * (radialSegments + 1) + i;
                const b = (j + 1) * (radialSegments + 1) + i;
                const c = (j + 1) * (radialSegments + 1) + i + 1;
                const d = j * (radialSegments + 1) + i + 1;

                indices.push(a, b, d);
                indices.push(b, c, d);
            }
        }

        // Vertices and indices for top cap
        if (radiusTop > 0) {
            const topCenterIndex = positions.length / 3;
            positions.push(0, height / 2, 0); // Top center
            normals.push(0, 1, 0);
            texCoords.push(0.5, 0.5);

            for (let i = 0; i <= radialSegments; i++) {
                const u = i / radialSegments;
                const theta = u * Math.PI * 2;
                const sinTheta = Math.sin(theta);
                const cosTheta = Math.cos(theta);

                positions.push(radiusTop * cosTheta, height / 2, radiusTop * sinTheta);
                normals.push(0, 1, 0); // All normals point straight up
                texCoords.push(0.5 + 0.5 * cosTheta, 0.5 + 0.5 * sinTheta); // Disk texture coords
            }
            const startIndex = topCenterIndex + 1;
            for (let i = 0; i < radialSegments; i++) {
                indices.push(topCenterIndex, startIndex + i, startIndex + i + 1);
            }
        }

        // Vertices and indices for bottom cap
        if (radiusBottom > 0) {
            const bottomCenterIndex = positions.length / 3;
            positions.push(0, -height / 2, 0); // Bottom center
            normals.push(0, -1, 0);
            texCoords.push(0.5, 0.5);

            for (let i = 0; i <= radialSegments; i++) {
                const u = i / radialSegments;
                const theta = u * Math.PI * 2;
                const sinTheta = Math.sin(theta);
                const cosTheta = Math.cos(theta);

                positions.push(radiusBottom * cosTheta, -height / 2, radiusBottom * sinTheta);
                normals.push(0, -1, 0); // All normals point straight down
                texCoords.push(0.5 + 0.5 * cosTheta, 0.5 + 0.5 * sinTheta); // Disk texture coords
            }
            const startIndex = bottomCenterIndex + 1;
            for (let i = 0; i < radialSegments; i++) {
                indices.push(bottomCenterIndex, startIndex + i + 1, startIndex + i); // Winding order reversed for bottom
            }
        }


        this.numIndices = indices.length;

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
        this.parent = null; // Added for easier removal
    }

    addChild(node) {
        this.children.push(node);
        node.parent = this; // Set parent reference
        return node;
    }

    removeChild(node) {
        const index = this.children.indexOf(node);
        if (index > -1) {
            this.children.splice(index, 1);
            node.parent = null;
        }
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
            this.physicsBody.update(1 / 60); // Fixed timestep for physics

            this.localMatrix.identity();
            this.localMatrix.translate(
                this.physicsBody.position[0],
                this.physicsBody.position[1],
                this.physicsBody.position[2]
            );
            // Apply rotation from physics body
            if (this.physicsBody.rotationY !== undefined) {
                this.localMatrix.rotateY(-this.physicsBody.rotationY);
            }
            if (this.physicsBody.rotationX !== undefined) {
                this.localMatrix.rotateX(+this.physicsBody.rotationX);
            }
        }

        super.update(parentWorldMatrix);
    }
}

// New node to represent the combined Witch and Broom model
class PlayerModelNode extends SceneNode {
    constructor(gl, material) {
        super();
        // Witch's body (simple cube)
        const witchBodyGeometry = new CubeGeometry(gl);
        this.witchBody = new MeshNode(witchBodyGeometry, material);
        this.witchBody.localMatrix.scale(0.5, 0.8, 0.4); // Slim and tall
        this.witchBody.localMatrix.translate(0, 0.8, 0); // Position above broom
        this.addChild(this.witchBody);

        // Broom (stretched cube) - oriented to show forward direction
        const broomGeometry = new CubeGeometry(gl);
        this.broom = new MeshNode(broomGeometry, material);
        this.broom.localMatrix.scale(0.2, 0.1, 1.5); // Long and thin
        this.broom.localMatrix.translate(0, 0.3, -0.75); // Position under witch, extending backward
        this.addChild(this.broom);
    }
}


class PhysicsBody {
    constructor() {
        this.position = [0, 0, 0];
        this.velocity = [0, 0, 0];
        this.acceleration = [0, 0, 0]; // No constant gravity for flying
        this.mass = 1;
        this.restitution = 0.5;
        this.friction = 0.95; // Slightly less friction for sustained flight feel
        this.rotationY = 0; // Yaw
        this.rotationX = 0; // Pitch
        this.maxPitch = Math.PI / 4; // Limit for pitch
    }

    update(deltaTime) {
        // Update velocity (acceleration might be used for external forces if needed)
        this.velocity[0] += this.acceleration[0] * deltaTime;
        this.velocity[1] += this.acceleration[1] * deltaTime;
        this.velocity[2] += this.acceleration[2] * deltaTime;

        // Apply friction/drag to slow down when no input
        this.velocity[0] *= this.friction;
        this.velocity[1] *= this.friction; // Apply friction to vertical movement
        this.velocity[2] *= this.friction;

        // Update position
        this.position[0] += this.velocity[0] * deltaTime;
        this.position[1] += this.velocity[1] * deltaTime;
        this.position[2] += this.velocity[2] * deltaTime;

        // Simple ground collision (for initial ground contact or if you want landing)
        if (this.position[1] < 0) {
            this.position[1] = 0;
            this.velocity[1] = -this.velocity[1] * this.restitution * 0.5; // Dampen bounce on ground
        }

        // Clamp pitch to limits
        this.rotationX = Math.max(-this.maxPitch, Math.min(this.maxPitch, this.rotationX));
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
        this.target = [0, 0, 0];
        this.position = [0, 5, 10]; // Initial position, will be updated
        this.up = [0, 1, 0];
        this.fov = 60;
        this.aspect = 1;
        this.near = 0.1;
        this.far = 1000;

        // Third-person parameters, adapted for flying witch
        this.distance = 7; // Distance behind the witch
        this.height = 2.5; // Height above the witch
        this.angleX = 0; // Horizontal angle relative to witch's facing
        this.angleY = 0.3; // Vertical angle looking down slightly
        this.minAngleY = -Math.PI / 6; // Limit camera look up
        this.maxAngleY = Math.PI / 3; // Limit camera look down

        this.horizontalSensitivity = 0.002;
        this.verticalSensitivity = 0.002;

        // Zoom limits
        this.minDistance = 2;
        this.maxDistance = 20;

        // Smoothing for camera movement
        this.smoothSpeed = 5;
        this.currentPosition = [...this.position];
        this.currentTarget = [...this.target];
    }

    update(deltaTime, playerPosition, playerRotationY, playerRotationX, input) {
        this.aspect = this.canvas.width / this.canvas.height;

        if (document.pointerLockElement === this.canvas) {
            if (input.isMouseDown(2)) {
                this.angleX = 0;
                this.angleY = Math.max(this.minAngleY, Math.min(this.maxAngleY, -playerRotationX));
            } else {
                this.angleX -= input.mouseMovementX * this.horizontalSensitivity;
                this.angleY -= input.mouseMovementY * this.verticalSensitivity;
                // Clamp vertical angle to prevent flipping
                this.angleY = Math.max(this.minAngleY, Math.min(this.maxAngleY, this.angleY));
            }

            // Zoom with scroll wheel
            if (Math.abs(input.mouseWheelDelta) > 0) {
                const zoomSpeed = 0.01;
                this.distance += input.mouseWheelDelta * zoomSpeed;
                this.distance = Math.max(this.minDistance, Math.min(this.maxDistance, this.distance));
                input.mouseWheelDelta = 0; // Reset after using
            }
        }

        // Camera follows and rotates with the player
        // Calculate camera position relative to player
        const effectiveAngleX = playerRotationY + Math.PI + this.angleX;
        const effectiveAngleY = this.angleY;

        const verticalOffset = Math.sin(effectiveAngleY) * this.distance;
        const horizontalDistance = Math.cos(effectiveAngleY) * this.distance;

        this.position = [
            playerPosition[0] + Math.sin(effectiveAngleX) * horizontalDistance,
            playerPosition[1] + this.height + verticalOffset,
            playerPosition[2] + Math.cos(effectiveAngleX) * horizontalDistance
        ];

        // True orbit camera: always look at the player
        this.target = [
            playerPosition[0],
            playerPosition[1] + 1,
            playerPosition[2]
        ];

        this.applySmoothing(deltaTime);
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

class InputManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.keys = {};
        this.pressedKeys = {}; // Keep track of keys pressed down *once* per frame
        this.mouse = { x: 0, y: 0, buttons: {} };
        this.mouseMovementX = 0;
        this.mouseMovementY = 0;
        this.mouseWheelDelta = 0;

        // Key events
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (!this.keys[key]) { // If key was not already down
                this.pressedKeys[key] = true;
            }
            this.keys[key] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        this.mouseButtons = {};
        this.mousePressedButtons = {};

        canvas.addEventListener('mousedown', (e) => {
            if (!this.mouseButtons[e.button]) {
                this.mousePressedButtons[e.button] = true;
            }
            this.mouseButtons[e.button] = true;
        });

        canvas.addEventListener('mouseup', (e) => {
            this.mouseButtons[e.button] = false;
        });

        canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
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

    isMousePressed(button) {
        return !!this.mousePressedButtons[button];
    }

    isKeyDown(key) {
        return !!this.keys[key.toLowerCase()];
    }

    // NEW: Check for a key pressed once (e.g., for spell casting)
    isKeyPressed(key) {
        return !!this.pressedKeys[key.toLowerCase()];
    }

    clearPressedKeys() {
        this.pressedKeys = {};
    }

    clearPressedMouseButtons() {
        this.mousePressedButtons = {};
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
            const errorMessage = 'WebGL not supported in your browser. Please try a different browser or update your graphics drivers.';
            document.body.innerHTML = `<div style="color:white;background:red;padding:20px;text-align:center;">${errorMessage}</div>`;
            throw new Error(errorMessage);
        }

        // Initialize systems with proper canvas reference
        this.input = new InputManager(this.canvas);
        this.camera = new Camera(this.canvas); // Pass canvas to Camera
        this.assets = new AssetLoader(this.gl);
        this.scene = new SceneNode();
        this.activeSpells = []; // NEW: Array to hold active spell nodes

        this.wasRightMouseDown = false;

        this.crosshairEl = document.getElementById('crosshair');

        this.pickables = [];
        this.hoveredPickable = null;
        this.selectedPickable = null;
        this.selectedOutlineNode = null;

        this.interactionMenuEl = document.getElementById('interactionMenu');
        this.interactionTitleEl = document.getElementById('interactionTitle');
        this.isInteractionMenuOpen = false;
        this.interactionTarget = null;
        this.interactionRange = 6;

        // Matrices
        this.projectionMatrix = new Matrix4();
        this.viewMatrix = new Matrix4();
        this.modelMatrix = new Matrix4();

        // Lighting
        this.lightDirection = [0.5, 1.0, 0.7]; // Directional light
        this.ambientColor = [0.2, 0.2, 0.2]; // Ambient light color

        // Initialize
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.initShaders();
        this.initTextures();

        if (this.interactionMenuEl) {
            this.interactionMenuEl.addEventListener('click', (e) => {
                const btn = e.target && e.target.closest ? e.target.closest('button') : null;
                if (!btn) return;
                const action = btn.getAttribute('data-action');
                if (action === 'close') {
                    this.closeInteractionMenu(true);
                }
                if (action === 'inspect') {
                    console.log('Inspect target:', this.interactionTarget);
                }
            });
        }

        window.addEventListener('keydown', (e) => {
            if (!this.isInteractionMenuOpen) return;
            const key = (e.key || '').toLowerCase();
            if (key === 'escape' || key === 'q') {
                e.preventDefault();
                this.closeInteractionMenu(true);
            }
        });

        // Load assets and start game
        this.loadAssets().then(() => {
            this.setupScene();
            document.getElementById('loading').style.display = 'none'; // Hide loading message
            this.startGameLoop();
        }).catch(err => {
            console.error('Asset loading failed:', err);
            const loading = document.getElementById('loading');
            loading.textContent = `Error loading game: ${err.message}`;
            loading.style.color = 'red';
            loading.style.display = 'block';
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.projectionMatrix.perspective(45, this.canvas.width / this.canvas.height, 0.1, 1000);
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
        out vec3 vPosition; // Pass world-space position for specular

        void main() {
            vec4 worldPosition = uModelMatrix * vec4(aPosition, 1.0);
            gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;
            vNormal = mat3(uModelMatrix) * aNormal;
            vTexCoord = aTexCoord;
            vPosition = worldPosition.xyz;
        }`;

        // Fragment shader
        const fsSource = `#version 300 es
        precision highp float;

        in vec3 vNormal;
        in vec2 vTexCoord;
        in vec3 vPosition;

        uniform sampler2D uTexture;
        uniform vec3 uLightDirection;
        uniform vec3 uAmbientColor;
        uniform vec3 uCameraPosition; // For specular highlight calculation
        uniform vec4 uOverrideColor; // NEW: For specific spell colors

        out vec4 fragColor;

        void main() {
            vec4 texColor = texture(uTexture, vTexCoord);
            vec3 finalColor = texColor.rgb;

            if (uOverrideColor.a > 0.0) { // If an override color is provided
                finalColor = uOverrideColor.rgb;
                // Add some basic light for override colors too
                vec3 normal = normalize(vNormal);
                vec3 lightDirection = normalize(uLightDirection);
                float diffuse = max(dot(normal, lightDirection), 0.0);
                finalColor = finalColor * (uAmbientColor + diffuse * 0.7); // Apply simple lighting
            } else {
                // Regular textured lighting
                vec3 normal = normalize(vNormal);
                vec3 lightDirection = normalize(uLightDirection);

                // Ambient light
                vec3 ambient = uAmbientColor;

                // Diffuse light
                float diffuse = max(dot(normal, lightDirection), 0.0);

                // Specular light
                vec3 viewDirection = normalize(uCameraPosition - vPosition);
                vec3 reflectDirection = reflect(-lightDirection, normal);
                float specPower = 32.0; // Shininess
                float specular = pow(max(dot(viewDirection, reflectDirection), 0.0), specPower);
                vec3 specularColor = vec3(0.8, 0.8, 0.8); // White specular highlight

                finalColor = texColor.rgb * (ambient + diffuse * 0.7 + specular * specularColor);
            }

            fragColor = vec4(finalColor, texColor.a);
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
            lightDirection: this.gl.getUniformLocation(this.shaderProgram, 'uLightDirection'),
            ambientColor: this.gl.getUniformLocation(this.shaderProgram, 'uAmbientColor'),
            cameraPosition: this.gl.getUniformLocation(this.shaderProgram, 'uCameraPosition'),
            overrideColor: this.gl.getUniformLocation(this.shaderProgram, 'uOverrideColor') // NEW
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
        // Create floor (larger and positioned correctly) - still useful for orientation
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

        // Initialize Perlin Noise generator
        const perlinNoise = new PerlinNoise(Math.random()); // Use a random seed for different terrains

        // Create terrain (PlaneGeometry)
        const terrainWidth = 200; // Make it large
        const terrainDepth = 200;
        const terrainSegments = 100; // More segments for better detail with noise
        const terrainHeightScale = 20; // How tall the mountains/hills are

        const terrainGeometry = new PlaneGeometry(
            this.gl,
            terrainWidth,
            terrainDepth,
            terrainSegments,
            terrainSegments,
            perlinNoise,
            terrainHeightScale
        );
        const terrainMaterial = new BasicMaterial(this.gl, this.assets.textures.default);
        const terrainMesh = new MeshNode(terrainGeometry, terrainMaterial);

        // Position the terrain so its center is at (0, 0, 0) and the lowest points are near y=0
        // The noise is mapped from [0, heightScale], so offset by half heightScale downwards
        terrainMesh.localMatrix.translate(0, -terrainHeightScale / 2, 0);
        this.scene.addChild(terrainMesh);


        // Create player (Witch on a broom) with physics
        this.playerBody = new PhysicsBody();
        this.playerBody.position = [0, terrainHeightScale / 2 + 5, 0]; // Start higher in the air, above terrain
        this.playerBody.friction = 0.95;

        this.playerPhysicsNode = new PhysicsNode(this.playerBody, 'player');
        const playerMaterial = new BasicMaterial(this.gl, this.assets.textures.default);
        const playerModel = new PlayerModelNode(this.gl, playerMaterial);
        this.playerPhysicsNode.addChild(playerModel);
        this.scene.addChild(this.playerPhysicsNode);

        // Remove the old 'magical orb' or reposition it relative to the new terrain
        // For now, let's keep it but be aware of its position
        // Add a magical orb (procedurally generated sphere)
        const orbGeometry = new SphereGeometry(this.gl, 1, 64); // Radius 1, 64 segments for smoothness
        const orbMaterial = new BasicMaterial(this.gl, this.assets.textures.default); // Using default texture for now

        const orbNode = new MeshNode(orbGeometry, orbMaterial);
        orbNode.localMatrix.identity();
        orbNode.localMatrix.translate(0, terrainHeightScale + 5, -5); // Position it in front of the player
        orbNode.localMatrix.scale(1.5, 1.5, 1.5); // Make it a bit larger
        this.scene.addChild(orbNode);

        this.pickables.push({
            type: 'sphere',
            node: orbNode,
            center: [0, terrainHeightScale + 5, -5],
            radius: 1.5
        });

        this.rotatingOrb = orbNode;



        // ===========================================

        // Add some obstacles for fun (can be adapted for flying obstacles later)
        this.createObstacles();
    }

    createObstacles() {
        // Add some boxes to fly around
        for (let i = 0; i < 10; i++) {
            const obstacleBody = new PhysicsBody();
            obstacleBody.position = [
                (Math.random() * 40 - 20),
                (Math.random() * 10) + 1, // Place obstacles in the air
                (Math.random() * 40 - 20)
            ];
            obstacleBody.velocity = [0, 0, 0];
            obstacleBody.restitution = 0.3;

            const obstacleNode = new PhysicsNode(obstacleBody);
            const scaleX = 0.5 + Math.random() * 1.5;
            const scaleY = 0.5 + Math.random() * 1.5;
            const scaleZ = 0.5 + Math.random() * 1.5;
            obstacleNode.localMatrix.scale(scaleX, scaleY, scaleZ);

            const obstacleGeometry = new CubeGeometry(this.gl);
            const obstacleMaterial = new BasicMaterial(this.gl, this.assets.textures.default);
            const obstacleMesh = new MeshNode(obstacleGeometry, obstacleMaterial);

            obstacleNode.addChild(obstacleMesh);
            this.scene.addChild(obstacleNode);

            this.pickables.push({
                type: 'aabb',
                node: obstacleNode,
                center: obstacleBody.position,
                halfExtents: [scaleX, scaleY, scaleZ]
            });
        }
    }

    // NEW: Function to spawn a fireball
    spawnFireball() {
        const fireballRadius = 0.8;
        const fireballSpeed = 50; // How fast the fireball travels
        const fireballDuration = 3; // seconds

        const fireballGeometry = new SphereGeometry(this.gl, fireballRadius, 16);
        // We will use a strong override color for a "glowing" effect
        const fireballMaterial = new BasicMaterial(this.gl); // No texture needed for solid color

        const fireballNode = new MeshNode(fireballGeometry, fireballMaterial);
        fireballNode.overrideColor = [1.0, 0.4, 0.0, 1.0]; // Bright orange/red (A > 0 enables override)

        // Position the fireball slightly in front of the player
        const playerPos = this.playerBody.position;
        const playerYaw = this.playerBody.rotationY;
        const playerPitch = this.playerBody.rotationX;

        const forwardX = Math.sin(playerYaw) * Math.cos(playerPitch);
        const forwardY = Math.sin(playerPitch);
        const forwardZ = Math.cos(playerYaw) * Math.cos(playerPitch);

        const spawnOffset = 2.0; // Distance in front of player to spawn

        fireballNode.localMatrix.identity();
        fireballNode.localMatrix.translate(
            playerPos[0] - forwardX * spawnOffset,
            playerPos[1] + 0.5 - forwardY * spawnOffset, // Adjust 0.5 for height relative to witch's center
            playerPos[2] - forwardZ * spawnOffset
        );

        // Store spell properties
        fireballNode.velocity = [
            forwardX * fireballSpeed,
            forwardY * fireballSpeed,
            forwardZ * fireballSpeed
        ];
        fireballNode.lifetime = fireballDuration;
        fireballNode.spawnTime = this.gameTime;

        this.scene.addChild(fireballNode);
        this.activeSpells.push(fireballNode);
    }

    // NEW: Function to spawn a shield
    spawnShield() {
        const shieldRadius = 1.5;
        const shieldHeight = 3.0;
        const shieldDuration = 5; // seconds

        const shieldGeometry = new CylinderGeometry(this.gl, shieldRadius, shieldRadius, shieldHeight, 32);
        // Make the shield a translucent blue. For true translucency with depth,
        // you'd need to enable blending and render transparent objects last.
        // For simplicity, we'll just use a solid color for now.
        const shieldMaterial = new BasicMaterial(this.gl);

        const shieldNode = new MeshNode(shieldGeometry, shieldMaterial);
        shieldNode.overrideColor = [0.2, 0.5, 1.0, 1.0]; // Blue color, A=1 for opaque

        // Position the shield centered on the player
        const playerPos = this.playerBody.position;
        shieldNode.localMatrix.identity();
        shieldNode.localMatrix.translate(
            playerPos[0],
            playerPos[1] + 0.5, // Center around the witch's height
            playerPos[2]
        );
        // Make it slightly transparent visually, requires blending to look proper
        // For basic visual, you could just set alpha in overrideColor: [0.2, 0.5, 1.0, 0.5]
        // BUT WebGL blending needs explicit setup (gl.enable(gl.BLEND), gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA))
        // and rendering transparent objects after opaque ones. Let's keep it opaque for now.

        shieldNode.lifetime = shieldDuration;
        shieldNode.spawnTime = this.gameTime;

        this.scene.addChild(shieldNode);
        this.activeSpells.push(shieldNode);
    }


    update(deltaTime) {
        this.gameTime += deltaTime; // Keep track of total game time

        if (this.isInteractionMenuOpen) {
            // Still update matrices for rendering, but skip gameplay input/movement while menu is open
            this.scene.update();
            this.camera.update(deltaTime, this.playerBody.position, this.playerBody.rotationY, this.playerBody.rotationX, this.input);

            this.viewMatrix.copy(this.camera.getViewMatrix());
            this.projectionMatrix.copy(this.camera.getProjectionMatrix());

            this.updateCrosshair();

            this.input.clearPressedKeys();
            this.input.clearPressedMouseButtons();
            this.input.mouseMovementX = 0;
            this.input.mouseMovementY = 0;
            return;
        }

        const flightSpeed = 1000;
        const verticalSpeed = 1000;
        const turnSpeed = 2; // Radians per second for yaw
        const pitchSpeed = 1; // Radians per second for pitch

        // Horizontal movement based on player's current orientation
        let forwardMovement = 0;
        let strafeMovement = 0;
        let verticalMovement = 0;

        if (this.input.isKeyDown('w')) { // Forward
            forwardMovement += flightSpeed;
        }
        if (this.input.isKeyDown('s')) { // Backward
            forwardMovement -= flightSpeed;
        }
        if (this.input.isKeyDown('a')) { // Strafe Left
            strafeMovement += flightSpeed * 0.5; // Slower strafing
        }
        if (this.input.isKeyDown('d')) { // Strafe Right
            strafeMovement -= flightSpeed * 0.5; // Slower strafing
        }

        // Vertical movement
        if (this.input.isKeyDown(' ')) { // Spacebar for ascent
            verticalMovement += verticalSpeed;
        }
        if (this.input.isKeyDown('shift')) { // Left Shift for descent
            verticalMovement -= verticalSpeed;
        }

        // Calculate velocity components based on player's rotation
        const currentYaw = this.playerBody.rotationY;
        const currentPitch = this.playerBody.rotationX;

        // Aircraft-style movement: if RMB+W, turn toward aim direction
        const rightMouseDown = this.input.isMouseDown(2);
        let targetYaw = currentYaw;
        let targetPitch = currentPitch;
        
        if (rightMouseDown && this.input.isKeyDown('w')) {
            // Calculate aim direction from camera angles
            targetYaw = currentYaw + this.camera.angleX;
            targetPitch = Math.max(-this.playerBody.maxPitch, Math.min(this.playerBody.maxPitch, -this.camera.angleY));
            
            // Smoothly rotate toward target
            const rotSpeed = 3.0 * deltaTime;
            const yawDiff = targetYaw - currentYaw;
            const pitchDiff = targetPitch - currentPitch;
            
            // Handle yaw wrapping
            let adjustedYawDiff = yawDiff;
            if (yawDiff > Math.PI) adjustedYawDiff -= 2 * Math.PI;
            if (yawDiff < -Math.PI) adjustedYawDiff += 2 * Math.PI;
            
            this.playerBody.rotationY += adjustedYawDiff * rotSpeed;
            this.playerBody.rotationX += pitchDiff * rotSpeed;
        }

        // Forward/Backward component (influenced by pitch for climbing/diving)
        const forwardX = Math.sin(this.playerBody.rotationY) * Math.cos(this.playerBody.rotationX);
        const forwardY = Math.sin(this.playerBody.rotationX);
        const forwardZ = Math.cos(this.playerBody.rotationY) * Math.cos(this.playerBody.rotationX);

        // Strafe component (flat horizontal movement relative to yaw)
        const strafeX = Math.cos(this.playerBody.rotationY);
        const strafeZ = -Math.sin(this.playerBody.rotationY);

        this.playerBody.velocity[0] = (forwardX * forwardMovement + strafeX * strafeMovement) * deltaTime;
        this.playerBody.velocity[1] = (forwardY * forwardMovement + verticalMovement) * deltaTime;
        this.playerBody.velocity[2] = (forwardZ * forwardMovement + strafeZ * strafeMovement) * deltaTime;

        // Apply mouse movement for rotation (yaw and pitch)
        if (document.pointerLockElement === this.canvas) {
            const rightMouseDown = this.input.isMouseDown(2);

            if (rightMouseDown && !this.wasRightMouseDown) {
                this.playerBody.rotationY += this.camera.angleX;
                this.playerBody.rotationX = Math.max(-this.playerBody.maxPitch, Math.min(this.playerBody.maxPitch, -this.camera.angleY));
                this.camera.angleX = 0;
            }

            if (rightMouseDown) {
                this.playerBody.rotationY -= this.input.mouseMovementX * 0.002 * turnSpeed; // Yaw
                this.playerBody.rotationX -= this.input.mouseMovementY * 0.002 * pitchSpeed; // Pitch
            }

            this.wasRightMouseDown = rightMouseDown;
        }

        // NEW: Spell Casting Input
        if (this.input.isKeyPressed('f')) { // 'F' for Fireball
            this.spawnFireball();
        }
        if (this.input.isKeyPressed('e')) { // 'E' for Shield
            this.spawnShield();
        }


        // Update scene and camera
        this.scene.update();
        this.camera.update(deltaTime, this.playerBody.position, this.playerBody.rotationY, this.playerBody.rotationX, this.input);

        // NEW: Update active spells
        for (let i = this.activeSpells.length - 1; i >= 0; i--) {
            const spell = this.activeSpells[i];
            const elapsed = this.gameTime - spell.spawnTime;

            if (spell.lifetime && elapsed > spell.lifetime) {
                // Remove spell if its lifetime has expired
                if (spell.parent) {
                    spell.parent.removeChild(spell);
                }
                this.activeSpells.splice(i, 1);
            } else {
                // Update fireball position if it has velocity
                if (spell.velocity) {
                    spell.localMatrix.translate(
                        spell.velocity[0] * deltaTime,
                        spell.velocity[1] * deltaTime,
                        spell.velocity[2] * deltaTime
                    );
                }
                // Update shield position if it's tied to the player
                // For the shield, we'll keep its position tied to the player
                if (spell === this.playerShield) { // Example for tying to player
                    const playerPos = this.playerBody.position;
                    spell.localMatrix.identity();
                    spell.localMatrix.translate(
                        playerPos[0],
                        playerPos[1] + 0.5,
                        playerPos[2]
                    );
                }
                spell.update(spell.parent ? spell.parent.worldMatrix : null); // Ensure spell node updates its world matrix
            }
        }


        // Update matrices
        this.viewMatrix.copy(this.camera.getViewMatrix());
        this.projectionMatrix.copy(this.camera.getProjectionMatrix());

        this.updateTargeting();

        if (this.input.isKeyPressed('q')) {
            this.tryOpenInteractionMenu();
        }

        this.updateCrosshair();

        // Clear input
        this.input.clearPressedKeys(); // Clear only "pressed once" keys
        this.input.clearPressedMouseButtons();
        this.input.mouseMovementX = 0;
        this.input.mouseMovementY = 0;
    }

    tryOpenInteractionMenu() {
        if (!this.selectedPickable) return;

        const playerPos = this.playerBody.position;
        const targetPos = this.getPickableWorldCenter(this.selectedPickable);
        if (!targetPos) return;

        const dx = targetPos[0] - playerPos[0];
        const dy = targetPos[1] - playerPos[1];
        const dz = targetPos[2] - playerPos[2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist > this.interactionRange) return;

        this.openInteractionMenu(this.selectedPickable);
    }

    getPickableWorldCenter(pickable) {
        if (!pickable) return null;
        if (pickable.type === 'sphere') return pickable.center;
        if (pickable.type === 'aabb') return pickable.center;
        return null;
    }

    openInteractionMenu(pickable) {
        if (!this.interactionMenuEl) return;

        this.isInteractionMenuOpen = true;
        this.interactionTarget = pickable;

        if (this.interactionTitleEl) {
            const label = pickable.type === 'sphere' ? 'Sphere' : 'Cube';
            this.interactionTitleEl.textContent = `Interact: ${label}`;
        }

        this.interactionMenuEl.style.display = 'block';
        if (document.pointerLockElement === this.canvas && document.exitPointerLock) {
            document.exitPointerLock();
        }
    }

    closeInteractionMenu(requestPointerLock) {
        if (!this.interactionMenuEl) return;
        this.isInteractionMenuOpen = false;
        this.interactionTarget = null;
        this.interactionMenuEl.style.display = 'none';

        if (requestPointerLock && this.canvas && this.canvas.requestPointerLock) {
            this.canvas.requestPointerLock();
        }
    }

    updateTargeting() {
        if (!this.input || document.pointerLockElement !== this.canvas || !this.input.isMouseDown(2)) {
            this.hoveredPickable = null;
            return;
        }

        const origin = this.playerBody.position;
        const yaw = this.playerBody.rotationY;
        const pitch = this.playerBody.rotationX;
        const dir = [
            Math.sin(yaw) * Math.cos(pitch),
            Math.sin(pitch),
            Math.cos(yaw) * Math.cos(pitch)
        ];

        let bestT = Infinity;
        let best = null;

        for (const p of this.pickables) {
            let t = null;
            if (p.type === 'sphere') {
                t = this.raySphere(origin, dir, p.center, p.radius);
            } else if (p.type === 'aabb') {
                t = this.rayAabb(origin, dir, p.center, p.halfExtents);
            }

            if (t !== null && t > 0 && t < bestT) {
                bestT = t;
                best = p;
            }
        }

        this.hoveredPickable = best;

        if (this.input.isMousePressed(0) && this.hoveredPickable) {
            this.selectPickable(this.hoveredPickable);
        }
    }

    raySphere(origin, dir, center, radius) {
        const ocX = origin[0] - center[0];
        const ocY = origin[1] - center[1];
        const ocZ = origin[2] - center[2];

        const b = ocX * dir[0] + ocY * dir[1] + ocZ * dir[2];
        const c = ocX * ocX + ocY * ocY + ocZ * ocZ - radius * radius;
        const h = b * b - c;
        if (h < 0) return null;
        const sqrtH = Math.sqrt(h);
        const t1 = -b - sqrtH;
        const t2 = -b + sqrtH;
        if (t1 > 0) return t1;
        if (t2 > 0) return t2;
        return null;
    }

    rayAabb(origin, dir, center, halfExtents) {
        const minX = center[0] - halfExtents[0];
        const minY = center[1] - halfExtents[1];
        const minZ = center[2] - halfExtents[2];
        const maxX = center[0] + halfExtents[0];
        const maxY = center[1] + halfExtents[1];
        const maxZ = center[2] + halfExtents[2];

        let tmin = -Infinity;
        let tmax = Infinity;

        const axes = [
            { o: origin[0], d: dir[0], min: minX, max: maxX },
            { o: origin[1], d: dir[1], min: minY, max: maxY },
            { o: origin[2], d: dir[2], min: minZ, max: maxZ }
        ];

        for (const a of axes) {
            if (Math.abs(a.d) < 1e-8) {
                if (a.o < a.min || a.o > a.max) return null;
                continue;
            }
            const invD = 1 / a.d;
            let t1 = (a.min - a.o) * invD;
            let t2 = (a.max - a.o) * invD;
            if (t1 > t2) {
                const tmp = t1;
                t1 = t2;
                t2 = tmp;
            }
            tmin = Math.max(tmin, t1);
            tmax = Math.min(tmax, t2);
            if (tmax < tmin) return null;
        }

        if (tmin > 0) return tmin;
        if (tmax > 0) return tmax;
        return null;
    }

    selectPickable(pickable) {
        if (this.selectedOutlineNode && this.selectedOutlineNode.parent) {
            this.selectedOutlineNode.parent.removeChild(this.selectedOutlineNode);
        }
        this.selectedOutlineNode = null;

        this.selectedPickable = pickable;

        const outlineColor = [1.0, 1.0, 1.0, 1.0];
        const outlineScale = 1.08;

        if (pickable.type === 'sphere' && pickable.node instanceof MeshNode) {
            const outline = new MeshNode(pickable.node.geometry, new BasicMaterial(this.gl));
            outline.overrideColor = outlineColor;
            outline.isOutline = true;
            outline.localMatrix.identity();
            outline.localMatrix.scale(outlineScale, outlineScale, outlineScale);
            pickable.node.addChild(outline);
            this.selectedOutlineNode = outline;
        }

        if (pickable.type === 'aabb' && pickable.node instanceof SceneNode) {
            const meshChild = pickable.node.children.find(c => c instanceof MeshNode);
            if (meshChild) {
                const outline = new MeshNode(meshChild.geometry, new BasicMaterial(this.gl));
                outline.overrideColor = outlineColor;
                outline.isOutline = true;
                outline.localMatrix.identity();
                outline.localMatrix.scale(outlineScale, outlineScale, outlineScale);
                pickable.node.addChild(outline);
                this.selectedOutlineNode = outline;
            }
        }
    }

    updateCrosshair() {
        if (!this.crosshairEl) return;

        if (!this.input || !this.input.isMouseDown(2)) {
            this.crosshairEl.style.display = 'none';
            return;
        }

        const playerPos = this.playerBody.position;
        const playerYaw = this.playerBody.rotationY;
        const playerPitch = this.playerBody.rotationX;

        const forwardX = Math.sin(playerYaw) * Math.cos(playerPitch);
        const forwardY = Math.sin(playerPitch);
        const forwardZ = Math.cos(playerYaw) * Math.cos(playerPitch);

        const aimDistance = 50;
        const aimPoint = [
            playerPos[0] + forwardX * aimDistance,
            playerPos[1] + forwardY * aimDistance,
            playerPos[2] + forwardZ * aimDistance
        ];

        const vp = new Matrix4();
        vp.copy(this.projectionMatrix).multiply(this.viewMatrix);
        const ndc = vp.transformPoint(aimPoint);

        const onScreen =
            ndc[0] >= -1 && ndc[0] <= 1 &&
            ndc[1] >= -1 && ndc[1] <= 1 &&
            ndc[2] >= -1 && ndc[2] <= 1;

        if (!onScreen) {
            this.crosshairEl.style.display = 'none';
            return;
        }

        const rect = this.canvas.getBoundingClientRect();
        const x = rect.left + (ndc[0] * 0.5 + 0.5) * rect.width;
        const y = rect.top + (-ndc[1] * 0.5 + 0.5) * rect.height;

        this.crosshairEl.style.display = 'block';
        this.crosshairEl.style.left = `${x}px`;
        this.crosshairEl.style.top = `${y}px`;
    }

    render() {
        if (!this.gl || !this.shaderProgram) return;

        this.gl.clearColor(0.2, 0.3, 0.5, 1.0); // A bit of a sky blue background
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

        // Set light direction and ambient color
        this.gl.uniform3fv(
            this.uniformLocations.lightDirection,
            this.lightDirection
        );
        this.gl.uniform3fv(
            this.uniformLocations.ambientColor,
            this.ambientColor
        );
        // Pass camera position for specular calculations
        this.gl.uniform3fv(
            this.uniformLocations.cameraPosition,
            this.camera.currentPosition
        );

        // Activate texture unit 0
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.uniform1i(this.uniformLocations.texture, 0);

        // Before rendering each mesh, set the overrideColor uniform
        // If overrideColor.a is 0, the shader uses texture/regular lighting
        // If overrideColor.a is > 0, the shader uses the overrideColor as a base color
        const renderRecursive = (node) => {
            if (!node.visible) return;

            if (node instanceof MeshNode) {
                const isOutline = !!node.isOutline;

                if (isOutline) {
                    this.gl.enable(this.gl.CULL_FACE);
                    this.gl.cullFace(this.gl.FRONT);
                }

                this.gl.uniformMatrix4fv(
                    this.uniformLocations.modelMatrix,
                    false,
                    node.worldMatrix.elements
                );

                // Set override color. If not present, default to transparent black (0,0,0,0)
                this.gl.uniform4fv(
                    this.uniformLocations.overrideColor,
                    node.overrideColor || [0.0, 0.0, 0.0, 0.0]
                );

                if (node.material) {
                    node.material.activate();
                }
                node.geometry.render(this.gl, {
                    uniformLocations: this.uniformLocations,
                    attribLocations: this.attribLocations
                });

                if (isOutline) {
                    this.gl.cullFace(this.gl.BACK);
                    this.gl.disable(this.gl.CULL_FACE);
                }
            }

            node.children.forEach(child => renderRecursive(child));
        };

        renderRecursive(this.scene);
    }

    startGameLoop() {
        let lastTime = 0;
        this.gameTime = 0; // Initialize game time
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