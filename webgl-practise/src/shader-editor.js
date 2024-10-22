// shader-editor.js

export function initShaderEditor(gl, game) {
    const editor = document.getElementById('editor');
    editor.style.display = 'block';

    // Initially load the vertex shader code into the editor
    let shaderCode = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main(void) {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vColor = aVertexColor;
    }`;

    editor.value = shaderCode;

    // Listen for changes in the shader code and apply them
    editor.addEventListener('input', () => {
        const updatedShaderCode = editor.value;
        game.updateShaders(updatedShaderCode, updatedShaderCode);
    });
}
