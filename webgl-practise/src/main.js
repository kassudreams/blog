import { startGame } from './game.js';
import { initShaderEditor } from './shader-editor.js';

function toggleShaderEditor() {
    const editor = document.getElementById('editor');
    editor.style.display = editor.style.display === 'none' ? 'block' : 'none';
}

function toggleFPSCounter() {
    const fpsCounter = document.getElementById('fps');
    fpsCounter.style.display = fpsCounter.style.display === 'none' ? 'block' : 'none';
}



function resizeCanvasToDisplaySize(canvas, gl) {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    }
}
/*
function updateFPS(fpsElement) {
    let lastFrameTime = performance.now();

    function loop() {
        const currentFrameTime = performance.now();
        const delta = (currentFrameTime - lastFrameTime) / 1000;
        lastFrameTime = currentFrameTime;

        const fps = (1 / delta).toFixed(2);
        fpsElement.textContent = `FPS: ${fps}`;

        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
}
*/

window.onload = () => {
    const canvas = document.getElementById("glCanvas");
    const gl = canvas.getContext("webgl2");

    if (!gl) {
        console.error("Unable to initialize WebGL. Your browser may not support it.");
        return;
    }

    // Set the canvas size
    resizeCanvasToDisplaySize(canvas, gl);

    // Set the viewport to match the canvas dimensions
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Set the clear color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // Enable depth testing
    gl.enable(gl.DEPTH_TEST);
    // Near things obscure far things
    gl.depthFunc(gl.LEQUAL);

    // Make sure the FPS counter is initially visible
    const fpsCounter = document.getElementById('fps');
    fpsCounter.style.display = 'block';

    // Start the game and show FPS counter
    const game = startGame(gl);
    initShaderEditor(gl, game);

        // Camera controls
        const cameraModeSelect = document.getElementById('cameraMode');
        const cameraDistanceSlider = document.getElementById('cameraDistance');
        const cameraAngleXSlider = document.getElementById('cameraAngleX');
        const cameraAngleYSlider = document.getElementById('cameraAngleY');
    
        cameraModeSelect.addEventListener('change', () => {
            game.camera.setMode(cameraModeSelect.value);
        });
    
        cameraDistanceSlider.addEventListener('input', () => {
            game.camera.setDistance(parseFloat(cameraDistanceSlider.value));
        });
    
        cameraAngleXSlider.addEventListener('input', () => {
            game.camera.setAngle(parseFloat(cameraAngleXSlider.value), game.camera.angle.y);
        });
    
        cameraAngleYSlider.addEventListener('input', () => {
            game.camera.setAngle(game.camera.angle.x, parseFloat(cameraAngleYSlider.value));
        });

};

// Expose the toggle function to the global scope
window.toggleShaderEditor = toggleShaderEditor;
window.toggleFPSCounter = toggleFPSCounter;