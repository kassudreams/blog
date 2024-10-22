import { createProgram, createPerspectiveMatrix } from './utils.js';
import { createPyramidModel, createGroundModel } from './models.js';
import { vertexShaderSource, fragmentShaderSource } from './shaders.js';
import { Camera } from './camera.js';
import { Player } from './player.js';
import { mat4 } from 'gl-matrix';

export function startGame(gl) {
    const shaderProgram = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    const playerModel = createPyramidModel(gl);
    const groundModel = createGroundModel(gl);
    const player = new Player([0, 0, 0]);
    const camera = new Camera([0, 5, 10], player.getPosition());
    const projectionMatrix = createPerspectiveMatrix(
        Math.PI / 4,
        gl.canvas.clientWidth / gl.canvas.clientHeight,
        0.1,
        100.0
    );
    camera.setProjectionMatrix(projectionMatrix);

    let keys = {};

    function handleInput() {
        if (keys["ArrowUp"]) player.move("forward");
        if (keys["ArrowDown"]) player.move("backward");
        if (keys["ArrowLeft"]) player.move("left");
        if (keys["ArrowRight"]) player.move("right");
    }
    


    // Function to update shaders
    function updateShaders(newVertexShaderSource, newFragmentShaderSource) {
        const newShaderProgram = createProgram(gl, newVertexShaderSource, newFragmentShaderSource);
        if (newShaderProgram) {
            shaderProgram = newShaderProgram;
        } else {
            console.error('Failed to update shaders. Reverting to the previous version.');
        }
    }

    let lastFrameTime = 0;

    function updateFPS(currentTime) {
        const fpsCounter = document.getElementById('fps');
        const delta = currentTime - lastFrameTime;
        const fps = (1000 / delta).toFixed(2);

        fpsCounter.textContent = `FPS: ${fps}`; // Update the text content

        lastFrameTime = currentTime;
    }
    
    window.addEventListener("keydown", function (event) {
        keys[event.key] = true;
    });
    window.addEventListener("keyup", function (event) {
        keys[event.key] = false;
    });

    function drawScene(currentTime) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Activate the shader program
        gl.useProgram(shaderProgram);

        console.log("Active Program:", gl.getParameter(gl.CURRENT_PROGRAM));

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            console.error('Shader program failed to link:', gl.getProgramInfoLog(shaderProgram));
        }

    // Set uniform locations
    const uViewMatrixLocation = gl.getUniformLocation(shaderProgram, 'uViewMatrix');
    const uModelViewMatrixLocation = gl.getUniformLocation(shaderProgram, 'uModelViewMatrix');
    const uProjectionMatrixLocation = gl.getUniformLocation(shaderProgram, 'uProjectionMatrix');

    // Ensure the player movement is handled before updating the camera
    handleInput();

    const playerPosition = player.getPosition();
    camera.update(playerPosition);

    // Set the ground's model matrix
    const groundModelViewMatrix = mat4.create();
    mat4.translate(groundModelViewMatrix, groundModelViewMatrix, [0, -1.0, 0]);
    gl.uniformMatrix4fv(uModelViewMatrixLocation, false, groundModelViewMatrix);

    // Set the camera's view matrix
    gl.uniformMatrix4fv(uViewMatrixLocation, false, camera.getViewMatrix());

    // Set the projection matrix
    gl.uniformMatrix4fv(uProjectionMatrixLocation, false, camera.getProjectionMatrix());

    // Draw the ground
    groundModel.draw(gl, shaderProgram, groundModelViewMatrix, camera.getProjectionMatrix());

    // Set the player's model matrix
    const playerModelViewMatrix = mat4.create();
    mat4.translate(playerModelViewMatrix, playerModelViewMatrix, playerPosition);
    gl.uniformMatrix4fv(uModelViewMatrixLocation, false, playerModelViewMatrix);

    // Draw the player
    playerModel.draw(gl, shaderProgram, playerModelViewMatrix, camera.getProjectionMatrix());

    // Request to draw the next frame
    requestAnimationFrame(drawScene);
}

    document.addEventListener('keydown', (e) => (keys[e.key] = true));
    document.addEventListener('keyup', (e) => (keys[e.key] = false));


    // Start drawing the scene
    requestAnimationFrame(drawScene);

    return { updateShaders, camera };
}