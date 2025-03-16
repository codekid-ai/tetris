class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.nextCanvas = document.getElementById('nextPieceCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        // Set canvas sizes
        this.canvas.width = 300;
        this.canvas.height = 600;
        this.nextCanvas.width = 100;
        this.nextCanvas.height = 100;
        
        // Game board dimensions (10x20 grid)
        this.cols = 10;
        this.rows = 20;
        this.blockSize = this.canvas.width / this.cols;
        
        // Game state
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        this.score = 0;
        this.level = 1;
        this.gameOver = false;
        this.dropInterval = 1000; // Initial drop speed in ms
        this.lastDrop = 0;
        
        // Current and next piece
        this.currentPiece = null;
        this.nextPiece = null;
        
        // Controls
        this.keys = {
            ArrowLeft: false,
            ArrowRight: false,
            ArrowUp: false,
            ArrowDown: false,
            ' ': false
        };
        
        this.setupEventListeners();
        this.showStartScreen();
    }
    
    // Tetris pieces (tetriminoes)
    static PIECES = {
        I: {
            shape: [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ],
            color: '#00f0f0'
        },
        O: {
            shape: [
                [1, 1],
                [1, 1]
            ],
            color: '#f0f000'
        },
        T: {
            shape: [
                [0, 1, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            color: '#a000f0'
        },
        S: {
            shape: [
                [0, 1, 1],
                [1, 1, 0],
                [0, 0, 0]
            ],
            color: '#00f000'
        },
        Z: {
            shape: [
                [1, 1, 0],
                [0, 1, 1],
                [0, 0, 0]
            ],
            color: '#f00000'
        },
        J: {
            shape: [
                [1, 0, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            color: '#0000f0'
        },
        L: {
            shape: [
                [0, 0, 1],
                [1, 1, 1],
                [0, 0, 0]
            ],
            color: '#f0a000'
        }
    };
    
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
        
        document.getElementById('startButton').addEventListener('click', () => this.startGame());
        document.getElementById('restartButton').addEventListener('click', () => this.startGame());
    }
    
    showStartScreen() {
        document.getElementById('startScreen').classList.remove('hidden');
        document.getElementById('gameOverScreen').classList.add('hidden');
    }
    
    startGame() {
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        this.score = 0;
        this.level = 1;
        this.gameOver = false;
        this.dropInterval = 1000;
        this.updateScore();
        this.updateLevel();
        
        document.getElementById('startScreen').classList.add('hidden');
        document.getElementById('gameOverScreen').classList.add('hidden');
        
        this.spawnPiece();
        this.gameLoop();
    }
    
    spawnPiece() {
        if (!this.nextPiece) {
            this.nextPiece = this.createPiece();
        }
        
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.createPiece();
        
        // Game over check
        if (this.collision()) {
            this.gameOver = true;
            document.getElementById('gameOverScreen').classList.remove('hidden');
            return;
        }
        
        this.drawNextPiece();
    }
    
    createPiece() {
        const pieces = Object.keys(Game.PIECES);
        const type = pieces[Math.floor(Math.random() * pieces.length)];
        const piece = {
            type,
            shape: Game.PIECES[type].shape,
            color: Game.PIECES[type].color,
            x: Math.floor(this.cols / 2) - Math.floor(Game.PIECES[type].shape[0].length / 2),
            y: 0
        };
        return piece;
    }
    
    handleInput(key) {
        if (!this.currentPiece || this.gameOver) return;
        
        switch (key) {
            case 'ArrowLeft':
                this.movePiece(-1);
                break;
            case 'ArrowRight':
                this.movePiece(1);
                break;
            case 'ArrowUp':
                this.rotatePiece();
                break;
            case 'ArrowDown':
                this.dropPiece();
                break;
            case ' ':
                this.hardDrop();
                break;
        }
    }
    
    movePiece(dx) {
        this.currentPiece.x += dx;
        if (this.collision()) {
            this.currentPiece.x -= dx;
        }
    }
    
    rotatePiece() {
        const originalShape = this.currentPiece.shape;
        const size = originalShape.length;
        const rotated = Array(size).fill().map(() => Array(size).fill(0));
        
        // Rotate matrix
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                rotated[x][size - 1 - y] = originalShape[y][x];
            }
        }
        
        this.currentPiece.shape = rotated;
        if (this.collision()) {
            this.currentPiece.shape = originalShape;
        }
    }
    
    dropPiece() {
        this.currentPiece.y++;
        if (this.collision()) {
            this.currentPiece.y--;
            this.mergePiece();
            this.clearLines();
            this.spawnPiece();
        }
    }
    
    hardDrop() {
        while (!this.collision()) {
            this.currentPiece.y++;
        }
        this.currentPiece.y--;
        this.mergePiece();
        this.clearLines();
        this.spawnPiece();
    }
    
    collision() {
        const shape = this.currentPiece.shape;
        const pos = {x: this.currentPiece.x, y: this.currentPiece.y};
        
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const boardX = pos.x + x;
                    const boardY = pos.y + y;
                    
                    if (boardX < 0 || boardX >= this.cols ||
                        boardY >= this.rows ||
                        (boardY >= 0 && this.board[boardY][boardX])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    mergePiece() {
        const shape = this.currentPiece.shape;
        const pos = {x: this.currentPiece.x, y: this.currentPiece.y};
        
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const boardY = pos.y + y;
                    if (boardY >= 0) {
                        this.board[boardY][pos.x + x] = this.currentPiece.color;
                    }
                }
            }
        }
    }
    
    clearLines() {
        let linesCleared = 0;
        
        for (let y = this.rows - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(this.cols).fill(0));
                linesCleared++;
                y++; // Check the same row again
            }
        }
        
        if (linesCleared > 0) {
            this.updateScore(linesCleared);
        }
    }
    
    updateScore(linesCleared = 0) {
        const points = [0, 100, 300, 500, 800]; // Points for 0, 1, 2, 3, 4 lines
        this.score += points[linesCleared];
        document.getElementById('scoreValue').textContent = this.score;
        document.getElementById('finalScore').textContent = this.score;
        
        // Update level
        const newLevel = Math.floor(this.score / 1000) + 1;
        if (newLevel !== this.level) {
            this.level = newLevel;
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100); // Speed up as level increases
            this.updateLevel();
        }
    }
    
    updateLevel() {
        document.getElementById('levelValue').textContent = this.level;
    }
    
    drawBlock(ctx, x, y, color) {
        const size = this.blockSize;
        const padding = 1;
        
        // Main block
        ctx.fillStyle = color;
        ctx.fillRect(x * size + padding, y * size + padding, size - padding * 2, size - padding * 2);
        
        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(x * size + padding, y * size + padding, size - padding * 2, 2);
        ctx.fillRect(x * size + padding, y * size + padding, 2, size - padding * 2);
        
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(x * size + size - padding - 2, y * size + padding, 2, size - padding * 2);
        ctx.fillRect(x * size + padding, y * size + size - padding - 2, size - padding * 2, 2);
    }
    
    drawPiece(ctx, piece, offsetX = 0, offsetY = 0) {
        const shape = piece.shape;
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    this.drawBlock(
                        ctx,
                        piece.x + x + offsetX,
                        piece.y + y + offsetY,
                        piece.color
                    );
                }
            }
        }
    }
    
    drawNextPiece() {
        this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        const blockSize = 20;
        const piece = this.nextPiece;
        const shape = piece.shape;
        const offsetX = (this.nextCanvas.width - shape[0].length * blockSize) / 2 / blockSize;
        const offsetY = (this.nextCanvas.height - shape.length * blockSize) / 2 / blockSize;
        
        // Temporarily adjust the block size for the next piece preview
        const originalBlockSize = this.blockSize;
        this.blockSize = blockSize;
        
        // Draw the piece centered in the next piece canvas
        this.drawPiece(
            this.nextCtx,
            {
                ...piece,
                x: offsetX,
                y: offsetY
            }
        );
        
        // Restore the original block size
        this.blockSize = originalBlockSize;
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw board
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.board[y][x]) {
                    this.drawBlock(this.ctx, x, y, this.board[y][x]);
                }
            }
        }
        
        // Draw current piece
        if (this.currentPiece) {
            // Draw ghost piece
            const ghostPiece = {
                ...this.currentPiece,
                y: this.currentPiece.y
            };
            
            while (!this.collision()) {
                ghostPiece.y++;
            }
            ghostPiece.y--;
            
            // Draw ghost with transparency
            const originalAlpha = this.ctx.globalAlpha;
            this.ctx.globalAlpha = 0.2;
            this.drawPiece(this.ctx, ghostPiece);
            this.ctx.globalAlpha = originalAlpha;
            
            // Draw actual piece
            this.drawPiece(this.ctx, this.currentPiece);
        }
    }
    
    gameLoop(timestamp = 0) {
        if (this.gameOver) {
            return;
        }
        
        const deltaTime = timestamp - this.lastDrop;
        
        if (deltaTime > this.dropInterval) {
            this.dropPiece();
            this.lastDrop = timestamp;
        }
        
        this.draw();
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new Game();
});
