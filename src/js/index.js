class Tetris {
    constructor() {
        this.canvas = document.querySelector("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.createField();
        this.drawTetris();
        this.fallingFigure = false;
        document.addEventListener("keydown", (event) => {
            let newEvent = undefined;
            if (event.key === "ArrowUp") {
                newEvent = new Event("upKey");
            } else if (event.key === "ArrowDown") {
                newEvent = new Event("downKey");
            } else if (event.key === "ArrowLeft") {
                newEvent = new Event("leftKey");
            } else if (event.key === "ArrowRight") {
                newEvent = new Event("rightKey");
            }
            document.dispatchEvent(newEvent);
        });
    }

    Figure = class {
        constructor(Game, type) {
            this.game = Game;
            this.field = Game.field;
            this.type = type;
            this.isFalling = true;
            this.rotate = 0;
            this.color = {
                line: "blue",
                Z: "pink",
                invZ: "cyan",
                L: "green",
                invL: "violet",
                rect: "red",
                T: "yellow",
            }[this.type];
            this.zeroPointCoords = { x: 4, y: 2 };
            document.addEventListener("upKey", this.rotateFigure.bind(this));
            document.addEventListener("leftKey", this.moveLeft.bind(this));
            document.addEventListener("rightKey", this.moveRight.bind(this));
            document.addEventListener("downKey", this.moveDown.bind(this));
            this.updateChildren();
        }
        rotateFigure() {
            this.rotate = (this.rotate + 1) % 4;
            // Здесь придестя прописывать исключения при выпирании повернутой фигуры за границы
            this.updateChildren();
        }
        updateChildren() {
            const { x, y } = this.zeroPointCoords;
            this.zeroCell = this.field[`${x}:${y}`];
            const cell = this.zeroCell;
            this.children = {
                // Переписать как то по другому
                // Такие массивы при инициализации дропают ошибки
                line: [
                    [cell.up, cell, cell.down, cell.down.down],
                    [cell.left.left, cell.left, cell, cell.right],
                    [cell.up, cell, cell.down, cell.down.down],
                    [cell.left.left, cell.left, cell, cell.right],
                ],
                Z: [
                    [cell.left, cell, cell.down, cell.down.right],
                    [cell.right.up, cell.right, cell, cell.down],
                    [cell.left, cell, cell.down, cell.down.right],
                    [cell.right.up, cell.right, cell, cell.down],
                ],
                invZ: [
                    [cell.down.left, cell.down, cell, cell.right],
                    [cell.up, cell, cell.right, cell.right.down],
                    [cell.down.left, cell.down, cell, cell.right],
                    [cell.up, cell, cell.right, cell.right.down],
                ],
                L: [
                    [cell.left.down, cell.left, cell, cell.right],
                    [cell.up.left, cell.up, cell, cell.down],
                    [cell.left, cell, cell.right, cell.right.up],
                    [cell.up, cell, cell.down, cell.down.right],
                ],
                invL: [
                    [cell.left, cell, cell.right, cell.right.down],
                    [cell.up, cell, cell.down, cell.down.left],
                    [cell.left.up, cell.left, cell, cell.right],
                    [cell.up.right, cell.up, cell, cell.down],
                ],
                rect: [
                    [cell, cell.right, cell.down, cell.down.right],
                    [cell, cell.right, cell.down, cell.down.right],
                    [cell, cell.right, cell.down, cell.down.right],
                    [cell, cell.right, cell.down, cell.down.right],
                ],
                T: [
                    [cell.left.left, cell.left, cell, cell.right],
                    [cell.up, cell, cell.down, cell.down.down],
                    [cell.left.left, cell.left, cell, cell.right],
                    [cell.up, cell, cell.down, cell.down.down],
                ],
            }[this.type][this.rotate];
            this.game.clearFallingFigure();
            console.log(this.children);
            this.children.forEach((Child) => {
                Child.contain = this;
            });
            this.game.drawTetris();
            if (!this.isCollised()) this.setStatic();
        }
        setStatic() {
            delete this.game, this.field, this.type, this.zeroPointCoords;
            delete this.updateChildren, this.moveDown, this.moveLeft, this.moveRight, this.setStatic;
            this.isFalling = false;
            document.removeEventListener("leftKey", null);
            document.removeEventListener("rightKey", null);
            document.removeEventListener("downKey", null);
        }
        isCollised() {
            return this.children.every((Cell) => {
                if (Cell.y === 20) return false;
                if (Cell.down.contain.isFalling === false) return false;
                return true;
            });
        }
        moveDown() {
            if (!this.children.every((Child) => Child.y !== 20)) return;
            this.zeroPointCoords.y++;
            this.updateChildren();
        }
        moveLeft() {
            if (!this.children.every((Child) => Child.x !== 1)) return;
            this.zeroPointCoords.x--;
            this.updateChildren();
        }
        moveRight() {
            if (!this.children.every((Child) => Child.x !== 10)) return;
            this.zeroPointCoords.x++;
            this.updateChildren();
        }
    };

    spawnFigure(type) {
        this.fallingFigure = new this.Figure(this, type);
    }
    rotateLeft() {}
    rotateRight() {}

    clearFallingFigure() {
        for (let cell in this.field) {
            let Cell = this.field[cell];
            if (Cell.contain.isFalling) Cell.contain = false;
        }
    }

    isFallingCellCollised(cell) {
        if (cell.y === 20) return true;
        if (cell.y.contain.type === "static") return true;
        return false;
    }

    createField() {
        this.field = {};
        for (let x = 1; x <= 10; x++) {
            for (let y = 1; y <= 20; y++) {
                this.field[`${x}:${y}`] = {};
                let cell = this.field[`${x}:${y}`];
                cell.x = x;
                cell.y = y;
                cell.contain = false;
            }
        }
        for (let x = 1; x <= 10; x++) {
            for (let y = 1; y <= 20; y++) {
                let cell = this.field[`${x}:${y}`];
                if (y !== 0) cell.up = this.field[`${x}:${y - 1}`];
                if (y !== 20) cell.down = this.field[`${x}:${y + 1}`];
                if (x !== 0) cell.left = this.field[`${x - 1}:${y}`];
                if (x !== 10) cell.right = this.field[`${x + 1}:${y}`];
            }
        }
    }

    drawTetris() {
        const w = 40;
        this.ctx.clearRect(0, 0, 400, 800);
        for (let x = 1; x <= 10; x++) {
            for (let y = 1; y <= 20; y++) {
                const cell = this.field[`${x}:${y}`];
                const pX = (x - 1) * w;
                const pY = (y - 1) * w;
                this.ctx.beginPath();
                if (cell.contain) {
                    this.ctx.fillStyle = cell.contain.color;
                    this.ctx.fillRect(pX, pY, w, w);
                }
                this.ctx.lineWidth = 1;
                this.ctx.strokeStyle = "black";
                this.ctx.strokeRect(pX, pY, w, w);
                this.ctx.stroke();
            }
        }
    }
}

const app = new Tetris();

window.app = app;
