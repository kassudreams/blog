export function createPyramidModel(gl) {
    // Define the vertices for a pyramid
    const vertices = new Float32Array([
        // Base
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0, 1.0,
        -1.0, -1.0, 1.0,

        // Apex
        0.0, 1.0, 0.0
    ]);

    // Define the colors for each vertex
    const colors = new Float32Array([
        // Base - red, green, blue, yellow
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        1.0, 1.0, 0.0, 1.0,

        // Apex - white
        1.0, 1.0, 1.0, 1.0
    ]);

    // Define the indices for the pyramid faces
    const indices = new Uint16Array([
        // Base
        0, 1, 2,
        0, 2, 3,

        // Sides
        0, 1, 4,
        1, 2, 4,
        2, 3, 4,
        3, 0, 4
    ]);

    // Create and bind buffers
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    // Return an object containing the buffers and the number of indices
    return {
        vertexBuffer: vertexBuffer,
        colorBuffer: colorBuffer,
        indexBuffer: indexBuffer,
        vertexCount: indices.length,

        draw(gl, shaderProgram, modelViewMatrix, projectionMatrix) {
            const vertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vertexPosition);

            const vertexColor = gl.getAttribLocation(shaderProgram, 'aVertexColor');
            gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
            gl.vertexAttribPointer(vertexColor, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vertexColor);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

            gl.uniformMatrix4fv(
                gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
                false,
                modelViewMatrix
            );
            gl.uniformMatrix4fv(
                gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
                false,
                projectionMatrix
            );

            gl.drawElements(gl.TRIANGLES, this.vertexCount, gl.UNSIGNED_SHORT, 0);
        }
    };
}

export function createGroundModel(gl) {
    const vertices = new Float32Array([
        -10.0, 0.0, -10.0,
        10.0, 0.0, -10.0,
        10.0, 0.0, 10.0,
        -10.0, 0.0, 10.0,
    ]);

    const colors = new Float32Array([
        0.5, 0.5, 0.5, 1.0, // Grey color for the ground
        0.5, 0.5, 0.5, 1.0,
        0.5, 0.5, 0.5, 1.0,
        0.5, 0.5, 0.5, 1.0,
    ]);

    const indices = new Uint16Array([
        0, 1, 2,
        0, 2, 3
    ]);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return {
        vertexBuffer: vertexBuffer,
        colorBuffer: colorBuffer,
        indexBuffer: indexBuffer,
        vertexCount: indices.length,

        draw(gl, shaderProgram, modelViewMatrix, projectionMatrix) {
            const vertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vertexPosition);

            const vertexColor = gl.getAttribLocation(shaderProgram, 'aVertexColor');
            gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
            gl.vertexAttribPointer(vertexColor, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vertexColor);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

            gl.uniformMatrix4fv(
                gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
                false,
                modelViewMatrix
            );
            gl.uniformMatrix4fv(
                gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
                false,
                projectionMatrix
            );

            gl.drawElements(gl.TRIANGLES, this.vertexCount, gl.UNSIGNED_SHORT, 0);
        }
    };
}
