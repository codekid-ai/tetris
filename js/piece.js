import { PIECES } from './constants.js';

export class Piece {
    constructor(type, x, y) {
        this.type = type;
        this.shape = PIECES[type].shape;
        this.color = PIECES[type].color;
        this.x = x;
        this.y = y;
    }

    rotate() {
        const newShape = Array(this.shape.length).fill()
            .map(() => Array(this.shape[0].length).fill(0));
        
        for (let y = 0; y < this.shape.length; y++) {
            for (let x = 0; x < this.shape[y].length; x++) {
                newShape[x][this.shape.length - 1 - y] = this.shape[y][x];
            }
        }
        
        const oldShape = this.shape;
        this.shape = newShape;
        
        return oldShape;
    }

    static createRandom(cols) {
        const pieces = Object.keys(PIECES);
        const type = pieces[Math.floor(Math.random() * pieces.length)];
        const x = Math.floor(cols / 2) - Math.floor(PIECES[type].shape[0].length / 2);
        return new Piece(type, x, 0);
    }
}
