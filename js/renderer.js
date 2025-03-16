import { CANVAS_WIDTH, CANVAS_HEIGHT, NEXT_CANVAS_WIDTH, NEXT_CANVAS_HEIGHT, COLS, ROWS } from './constants.js';

export class Renderer {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.nextCanvas = document.getElementById('nextPieceCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        // Set canvas sizes
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;
        this.nextCanvas.width = NEXT_CANVAS_WIDTH;
        this.nextCanvas.height = NEXT_CANVAS_HEIGHT;
        
        this.blockSize = CANVAS_WIDTH / COLS;
        this.nextBlockSize = NEXT_CANVAS_WIDTH / 4;
    }

    drawBoard(board) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw the grid
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                const cell = board.grid[y][x];
                if (cell) {
                    this.drawBlock(x, y, cell);
                }
                this.drawGridLine(x, y);
            }
        }
    }

    drawPiece(piece) {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    this.drawBlock(piece.x + x, piece.y + y, piece.color);
                }
            }
        }
    }

    drawGhostPiece(piece, dropDistance) {
        this.ctx.globalAlpha = 0.3;
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    this.drawBlock(piece.x + x, piece.y + y + dropDistance, piece.color);
                }
            }
        }
        this.ctx.globalAlpha = 1;
    }

    drawNextPiece(piece) {
        this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        const offsetX = (this.nextCanvas.width - piece.shape[0].length * this.nextBlockSize) / 2;
        const offsetY = (this.nextCanvas.height - piece.shape.length * this.nextBlockSize) / 2;
        
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    this.drawNextBlock(x, y, piece.color, offsetX, offsetY);
                }
            }
        }
    }

    drawBlock(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize);
        this.ctx.strokeStyle = '#000';
        this.ctx.strokeRect(x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize);
    }

    drawNextBlock(x, y, color, offsetX, offsetY) {
        this.nextCtx.fillStyle = color;
        this.nextCtx.fillRect(
            offsetX + x * this.nextBlockSize,
            offsetY + y * this.nextBlockSize,
            this.nextBlockSize,
            this.nextBlockSize
        );
        this.nextCtx.strokeStyle = '#000';
        this.nextCtx.strokeRect(
            offsetX + x * this.nextBlockSize,
            offsetY + y * this.nextBlockSize,
            this.nextBlockSize,
            this.nextBlockSize
        );
    }

    drawGridLine(x, y) {
        this.ctx.strokeStyle = '#ccc';
        this.ctx.strokeRect(x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize);
    }

    updateScore(score) {
        document.getElementById('scoreValue').textContent = score;
    }

    updateLevel(level) {
        document.getElementById('levelValue').textContent = level;
    }
}
