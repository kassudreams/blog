export class Player {
    constructor(initialPosition = [0, 0, 0]) {
        this.position = [...initialPosition]; // Spread syntax to create a copy of the initial position
        this.speed = 0.1;
    }

    // Method to move the player
    move(direction) {
        switch (direction) {
            case "forward":
                this.position[2] -= this.speed;
                break;
            case "backward":
                this.position[2] += this.speed;
                break;
            case "left":
                this.position[0] -= this.speed;
                break;
            case "right":
                this.position[0] += this.speed;
                break;
        }
    }

    // Method to get the player's current position
    getPosition() {
        return this.position;
    }
}
