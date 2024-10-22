import { mat4, vec3 } from 'gl-matrix';

export class Camera {
    constructor(position, target) {
        this.position = vec3.fromValues(...position);
        this.target = vec3.fromValues(...target);
        this.up = vec3.fromValues(0, 1, 0);
        this.viewMatrix = mat4.create();
        this.projectionMatrix = mat4.create();

        this.mode = 'third-person'; // Default mode
        this.distance = 10.0; // Default distance from player in third-person mode
        this.angle = { x: 45, y: 0 }; // Default angles for third-person view

        this.updateViewMatrix();
    }

    updateViewMatrix() {
        switch (this.mode) {
            case 'third-person':
                this.calculateThirdPersonView();
                break;
            case 'first-person':
                this.calculateFirstPersonView();
                break;
            case 'top-down':
                this.calculateTopDownView();
                break;
        }
        mat4.lookAt(this.viewMatrix, this.position, this.target, this.up);
    }

    calculateThirdPersonView() {
        const offset = vec3.create();
        vec3.set(
            offset,
            this.distance * Math.sin(this.angle.x) * Math.cos(this.angle.y),
            this.distance * Math.sin(this.angle.y),
            this.distance * Math.cos(this.angle.x) * Math.cos(this.angle.y)
        );
        vec3.add(this.position, this.target, offset);
    }

    calculateFirstPersonView() {
        vec3.set(this.position, ...this.target); // Align camera position with player
        vec3.add(this.position, this.position, [0, 1.5, 0]); // Offset the camera height for a first-person view
    }

    calculateTopDownView() {
        vec3.set(this.position, ...this.target);
        vec3.add(this.position, this.position, [0, this.distance, 0]); // Position camera directly above the player
    }

    setMode(mode) {
        if (['third-person', 'first-person', 'top-down'].includes(mode)) {
            this.mode = mode;
            this.updateViewMatrix();
        } else {
            console.error(`Invalid camera mode: ${mode}`);
        }
    }

    setDistance(distance) {
        this.distance = distance;
        this.updateViewMatrix();
    }

    setAngle(x, y) {
        this.angle.x = x;
        this.angle.y = y;
        this.updateViewMatrix();
    }

    followPlayer(playerPosition) {
        vec3.copy(this.target, playerPosition);
        this.updateViewMatrix();
    }

    update(playerPosition) {
        this.followPlayer(playerPosition);
        mat4.lookAt(this.viewMatrix, this.position, this.target, this.up);
    }

    getViewMatrix() {
        return this.viewMatrix;
    }

    setProjectionMatrix(projectionMatrix) {
        this.projectionMatrix = projectionMatrix;
    }

    getProjectionMatrix() {
        return this.projectionMatrix;
    }
}
