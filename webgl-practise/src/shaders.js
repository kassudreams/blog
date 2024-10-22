export const vertexShaderSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;
    
    uniform mat4 uViewMatrix;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main(void) {
        mat4 modelViewProjection = uProjectionMatrix * uViewMatrix * uModelViewMatrix;
        gl_Position = modelViewProjection * aVertexPosition;
        vColor = aVertexColor;
    }
`;

export const fragmentShaderSource = `
    varying lowp vec4 vColor;

    void main(void) {
        gl_FragColor = vColor;
    }

`;