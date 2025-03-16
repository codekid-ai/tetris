import { INITIAL_DROP_INTERVAL } from './constants.js';
import { Piece } from './piece.js';
import { Board } from './board.js';
import { Renderer } from './renderer.js';
import { InputHandler } from './input.js';

export class Game {
    constructor() {
        this.board = new Board();
        this.renderer = new Renderer();
        this.input = new InputHandler(this);
        
        this.currentPiece = null;
        this.nextPiece = null;
        this.gameOver = false;
        this.dropInterval = INITIAL_DROP_INTERVAL;
        this.lastDrop = 0;
        
        this.showStartScreen();
    }
    
    showStartScreen() {
        document.getElementById('startScreen').classList.remove('hidden');
        document.getElementById('gameOverScreen').classList.add('hidden');
    }
    
    startGame() {
        this.board.reset();
        this.gameOver = false;
        this.dropInterval = INITIAL_DROP_INTERVAL;
        this.lastDrop = performance.now();
        
        this.renderer.updateScore(this.board.score);
        this.renderer.updateLevel(this.board.level);
        
        document.getElementById('startScreen').classList.add('hidden');
        document.getElementById('gameOverScreen').classList.add('hidden');
        
        this.spawnPiece();
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }
    
    spawnPiece() {
        if (!this.nextPiece) {
            this.nextPiece = Piece.createRandom(this.board.grid[0].length);
        }
        
        this.currentPiece = this.nextPiece;
        this.nextPiece = Piece.createRandom(this.board.grid[0].length);
        
        // Game over check
        if (this.board.collision(this.currentPiece)) {
            this.gameOver = true;
            document.getElementById('gameOverScreen').classList.remove('hidden');
            return;
        }
        
        this.renderer.drawNextPiece(this.nextPiece);
    }
    
    movePiece(dx) {
        this.currentPiece.x += dx;
        if (this.board.collision(this.currentPiece)) {
            this.currentPiece.x -= dx;
            return false;
        }
        return true;
    }
    
    rotatePiece() {
        const oldShape = this.currentPiece.rotate();
        if (this.board.collision(this.currentPiece)) {
            this.currentPiece.shape = oldShape;
        }
    }
    
    dropPiece() {
        this.currentPiece.y++;
        if (this.board.collision(this.currentPiece)) {
            this.currentPiece.y--;
            this.board.merge(this.currentPiece);
            this.updateGameState();
            this.spawnPiece();
            return false;
        }
        return true;
    }
    
    hardDrop() {
        while (this.dropPiece()) {}
    }
    
    getDropDistance() {
        let distance = 0;
        while (!this.board.collision({
            ...this.currentPiece,
            y: this.currentPiece.y + distance + 1
        })) {
            distance++;
        }
        return distance;
    }
    
    updateGameState() {
        this.renderer.updateScore(this.board.score);
        this.renderer.updateLevel(this.board.level);
        this.dropInterval = INITIAL_DROP_INTERVAL * Math.pow(0.8, this.board.level - 1);
    }
    
    gameLoop(timestamp) {
        if (this.gameOver) return;
        
        const deltaTime = timestamp - this.lastDrop;
        
        if (deltaTime > this.dropInterval) {
            this.dropPiece();
            this.lastDrop = timestamp;
        }
        
        this.renderer.drawBoard(this.board);
        if (this.currentPiece) {
            const dropDistance = this.getDropDistance();
            this.renderer.drawGhostPiece(this.currentPiece, dropDistance);
            this.renderer.drawPiece(this.currentPiece);
        }
        
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new Game();
});
