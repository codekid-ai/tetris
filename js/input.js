export class InputHandler {
    constructor(game) {
        this.game = game;
        this.keys = {
            ArrowLeft: false,
            ArrowRight: false,
            ArrowUp: false,
            ArrowDown: false,
            ' ': false
        };
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (this.keys.hasOwnProperty(e.key)) {
                e.preventDefault();
                this.keys[e.key] = true;
                this.handleInput(e.key);
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (this.keys.hasOwnProperty(e.key)) {
                this.keys[e.key] = false;
            }
        });
        
        document.getElementById('startButton').addEventListener('click', () => this.game.startGame());
        document.getElementById('restartButton').addEventListener('click', () => this.game.startGame());
    }

    handleInput(key) {
        if (this.game.gameOver) return;
        
        switch (key) {
            case 'ArrowLeft':
                this.game.movePiece(-1);
                break;
            case 'ArrowRight':
                this.game.movePiece(1);
                break;
            case 'ArrowUp':
                this.game.rotatePiece();
                break;
            case 'ArrowDown':
                this.game.dropPiece();
                break;
            case ' ':
                this.game.hardDrop();
                break;
        }
    }
}
