class Tetris {
    constructor() {
        this.canvas = document.querySelector('canvas')
        this.ctx = this.canvas.getContext('2d')
        this.createField()
        this.drawTetris()
        this.fallingFigure = false
    }

    colors = {
        line: 'blue',
        Z: 'ping',
        invZ: 'cyan',
        L: 'green',
        invL: 'red',
        rect: 'violet',
        T: 'yellow'
    }

    // ['line', 'Z', 'invZ', 'L', 'invL', 'rect', 'T']
    spawnFigure() { }
    moveLeft() { }
    moveRight() { }
    moveDown() { }
    rotateLeft() { }
    rotateRight() { }

    createField() {
        this.field = {}
        for (let x = 1; x <= 10; x++) {
            for (let y = 1; y <= 20; y++) {
                this.field[`${x}:${y}`] = {}
                let cell = this.field[`${x}:${y}`]
                cell.x = x
                cell.y = y
                cell.contain = false
            }
        }
        for (let x = 1; x <= 10; x++) {
            for (let y = 1; y <= 20; y++) {
                let cell = this.field[`${x}:${y}`]
                if (y !== 0) cell.up = this.field[`${x}:${y - 1}`]
                if (y !== 20) cell.down = this.field[`${x}:${y + 1}`]
                if (x !== 0) cell.left = this.field[`${x - 1}:${y}`]
                if (x !== 10) cell.right = this.field[`${x + 1}:${y}`]
            }
        }
    }

    drawTetris() {
        const w = 40
        this.ctx.clearRect(0, 0, 400, 800)
        for (let x = 1; x <= 10; x++) {
            for (let y = 1; y <= 20; y++) {
                const cell = this.field[`${x}:${y}`]
                const pX = (x - 1) * w
                const pY = (y - 1) * w
                this.ctx.beginPath()
                if (cell.contain) {
                    this.ctx.fillStyle = cell.contain.color
                    this.ctx.fillRect(pX, pY, w, w)
                }
                this.ctx.lineWidth = 1
                this.ctx.strokeStyle = 'black'
                this.ctx.strokeRect(pX, pY, w, w)
                this.ctx.stroke()
            }
        }
    }
}

const app = new Tetris()

console.log(app)