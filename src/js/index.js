class Tetris {
    constructor() {
        this.canvas = document.querySelector("canvas");
        this.ctx = this.canvas.getContext("2d");

        this.totalScore = 0;
        this.linesScore = 0;
        this.startTime = Date.now();

        this.nextFiguresContainer = document.getElementById("next-figures-contianer");
        this.scoreCounterElement = document.getElementById("score-counter");
        this.linesCounterElement = document.getElementById("lines-counter");
        this.timeCounterElement = document.getElementById("time-counter");
        this.speetInputElement = document.getElementById("speed-input");

        this.startButtonElement = document.getElementById("start-button");
        this.startButtonElement.addEventListener("click", this.startButtonHandler.bind(this));

        this.drawInterval = undefined;

        this.figurePull = [
            this.getRandomFigureName(),
            this.getRandomFigureName(),
            this.getRandomFigureName(),
            this.getRandomFigureName(),
            this.getRandomFigureName(),
        ];
        this.icons = {
            invL: '<img src="./png/invL.png" alt="invL" id="invL-icon-template">',
            invZ: '<img src="./png/invZ.png" alt="invZ" id="invZ-icon-template">',
            L: '<img src="./png/L.png" alt="L" id="L-icon-template">',
            line: '<img src="./png/line.png" alt="line" id="line-icon-template">',
            rect: '<img src="./png/rect.png" alt="rect" id="rect-icon-template">',
            T: '<img src="./png/T.png" alt="T" id="T-icon-template">',
            Z: '<img src="./png/Z.png" alt="Z" id="Z-icon-template">',
        };
        // for (let fig in this.icons) {
        //     this.icons[fig].src = `./png/${fig}.png`
        // }
        this.nextFiguresContainer.innerHTML = this.figurePull.map((Fig) => this.icons[Fig]).join("");

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
            if (newEvent) {
                document.dispatchEvent(newEvent);
            }
        });
    }

    Figure = class {
        constructor(Game, type) {
            this.game = Game;
            this.field = Game.field;
            this.type = type;
            this.isFalling = true;
            this.rotate = 0;
            const moveIntervalTime = [0, 700, 1000, 1700][+this.game.speetInputElement.value];
            this.color = {
                line: "blue",
                Z: "pink",
                invZ: "cyan",
                L: "green",
                invL: "violet",
                rect: "red",
                T: "yellow",
            }[this.type];
            this.zeroPointCoords = this.type === "line" ? { x: 4, y: 2 } : { x: 4, y: 1 };
            this.listnersParams = [
                { key: "upKey", func: () => this.rotateFigure() },
                { key: "downKey", func: () => this.moveDown() },
                { key: "leftKey", func: () => this.moveLeft() },
                { key: "rightKey", func: () => this.moveRight() },
            ];
            this.listnersParams.forEach((Params) => document.addEventListener(Params.key, Params.func));
            this.updateChildren();
            this.moveInterval = setInterval(() => this.moveDown(), moveIntervalTime);
        }

        rotateFigure() {
            const oldRotate = this.rotate;
            this.rotate = (this.rotate + 1) % 4;
            try {
                let children = this.getChildren();
                if (!children.every((Child) => Child.contain === false || Child.contain.isFalling === true)) this.rotate = oldRotate;
            } catch (error) {
                this.rotate = oldRotate;
            }
            this.updateChildren();
        }

        updateChildren() {
            this.children = this.getChildren();
            this.game.clearFallingFigure();
            this.children.forEach((Child) => {
                Child.contain = this;
            });
            this.game.drawTetris();
            if (!this.isCollised()) this.setStatic();
        }

        setStatic() {
            if (!this.children.every((Child) => Child.y !== 1)) {
                document.dispatchEvent(new Event("GameOver"));
            }
            {
                const { func, key } = this.listnersParams[0];
                document.removeEventListener(key, func);
            }
            {
                const { func, key } = this.listnersParams[1];
                document.removeEventListener(key, func);
            }
            clearInterval(this.moveInterval);
            this.listnersParams.forEach((Params) => document.removeEventListener(Params.key, Params.func));
            delete this.game, this.field, this.type, this.zeroPointCoords, this.rotate, this.listnersParams, this.moveInterval;
            delete this.updateChildren, this.moveDown, this.moveLeft, this.moveRight, this.setStatic, this.rotateFigure;
            this.isFalling = false;
            document.dispatchEvent(new Event("FigureFell"));
        }

        getChildren() {
            const { x, y } = this.zeroPointCoords;
            this.zeroCell = this.field[`${x}:${y}`];
            const cell = this.zeroCell;

            if (this.type === "line" && this.rotate === 0) {
                return [cell.up, cell, cell.down, cell.down.down];
            }
            if (this.type === "line" && this.rotate === 1) {
                return [cell.left.left, cell.left, cell, cell.right];
            }
            if (this.type === "line" && this.rotate === 2) {
                return [cell.up, cell, cell.down, cell.down.down];
            }
            if (this.type === "line" && this.rotate === 3) {
                return [cell.left.left, cell.left, cell, cell.right];
            }

            if (this.type === "Z" && this.rotate === 0) {
                return [cell.left, cell, cell.down, cell.down.right];
            }
            if (this.type === "Z" && this.rotate === 1) {
                return [cell.right.up, cell.right, cell, cell.down];
            }
            if (this.type === "Z" && this.rotate === 2) {
                return [cell.left, cell, cell.down, cell.down.right];
            }
            if (this.type === "Z" && this.rotate === 3) {
                return [cell.right.up, cell.right, cell, cell.down];
            }

            if (this.type === "invZ" && this.rotate === 0) {
                return [cell.down.left, cell.down, cell, cell.right];
            }
            if (this.type === "invZ" && this.rotate === 1) {
                return [cell.up, cell, cell.right, cell.right.down];
            }
            if (this.type === "invZ" && this.rotate === 2) {
                return [cell.down.left, cell.down, cell, cell.right];
            }
            if (this.type === "invZ" && this.rotate === 3) {
                return [cell.up, cell, cell.right, cell.right.down];
            }

            if (this.type === "L" && this.rotate === 0) {
                return [cell.left.down, cell.left, cell, cell.right];
            }
            if (this.type === "L" && this.rotate === 1) {
                return [cell.up.left, cell.up, cell, cell.down];
            }
            if (this.type === "L" && this.rotate === 2) {
                return [cell.left, cell, cell.right, cell.right.up];
            }
            if (this.type === "L" && this.rotate === 3) {
                return [cell.up, cell, cell.down, cell.down.right];
            }

            if (this.type === "invL" && this.rotate === 0) {
                return [cell.left, cell, cell.right, cell.right.down];
            }
            if (this.type === "invL" && this.rotate === 1) {
                return [cell.up, cell, cell.down, cell.down.left];
            }
            if (this.type === "invL" && this.rotate === 2) {
                return [cell.left.up, cell.left, cell, cell.right];
            }
            if (this.type === "invL" && this.rotate === 3) {
                return [cell.up.right, cell.up, cell, cell.down];
            }

            if (this.type === "rect" && this.rotate === 0) {
                return [cell, cell.right, cell.down, cell.down.right];
            }
            if (this.type === "rect" && this.rotate === 1) {
                return [cell, cell.right, cell.down, cell.down.right];
            }
            if (this.type === "rect" && this.rotate === 2) {
                return [cell, cell.right, cell.down, cell.down.right];
            }
            if (this.type === "rect" && this.rotate === 3) {
                return [cell, cell.right, cell.down, cell.down.right];
            }

            if (this.type === "T" && this.rotate === 0) {
                return [cell.down, cell.left, cell, cell.right];
            }
            if (this.type === "T" && this.rotate === 1) {
                return [cell.up, cell, cell.down, cell.left];
            }
            if (this.type === "T" && this.rotate === 2) {
                return [cell.up, cell.left, cell, cell.right];
            }
            if (this.type === "T" && this.rotate === 3) {
                return [cell.up, cell, cell.down, cell.right];
            }
        }

        isCollised() {
            return this.children.every((Cell) => {
                if (Cell.y === 20) return false;
                if (Cell.down.contain.isFalling === false) return false;
                return true;
            });
        }

        moveDown() {
            if (!this.children.every((Child) => Child.y !== 20 && Child.down.contain.isFalling !== false)) return;
            this.zeroPointCoords.y++;
            this.updateChildren();
        }

        moveLeft() {
            if (!this.children.every((Child) => Child.x !== 1 && Child.left.contain.isFalling !== false)) return;
            this.zeroPointCoords.x--;
            this.updateChildren();
        }

        moveRight() {
            if (!this.children.every((Child) => Child.x !== 10 && Child.right.contain.isFalling !== false)) return;
            this.zeroPointCoords.x++;
            this.updateChildren();
        }
    };

    startButtonHandler() {
        const params1 = {
            key: "FigureFell",
            func: () => {
                this.desroyLines();
                this.spawnFigure(this.figurePull.shift());
                this.figurePull.push(this.getRandomFigureName());
            },
        };

        this.startTime = Date.now();
        this.linesScore = 0;
        this.totalScore = 0;

        this.startButtonElement.style.color = "gray";
        this.startButtonElement.style.cursor = "not-allowed";
        this.createField();

        this.figurePull.push(this.getRandomFigureName());
        this.spawnFigure(this.figurePull.shift());

        this.drawInterval = setInterval(() => this.drawTetris(), 500);

        const params2 = {
            key: "GameOver",
            func: () => {
                document.removeEventListener(params1.key, params1.func);
                document.removeEventListener(params2.key, params2.func);
                this.startButtonElement.style.color = "black";
                this.startButtonElement.style.cursor = "pointer";
                clearInterval(this.drawInterval);
            },
        };
        document.addEventListener(params2.key, params2.func);
        document.addEventListener(params1.key, params1.func);
    }

    spawnFigure(type) {
        this.fallingFigure = new this.Figure(this, type);
        this.nextFiguresContainer.innerHTML = this.figurePull.map((Fig) => this.icons[Fig]).join("");
    }

    desroyLines() {
        let fillLinies = [];
        for (let y = 20; y >= 1; y--) {
            if (this.isLineFill(y)) fillLinies.push(y);
        }

        for (let y of fillLinies) {
            this.clearLine(y);
        }

        this.linesScore += fillLinies.length;
        this.totalScore += [0, 100, 300, 700, 1500][fillLinies.length];

        whle: while (true) {
            let isRepalced = false;
            fr: for (let Y = 19; Y >= 1; Y--) {
                if (this.isLineEmpty(Y + 1) && !this.isLineEmpty(Y)) {
                    this.replaceLines(Y, Y + 1);
                    isRepalced = true;
                    continue whle;
                }
            }
            if (!isRepalced) break whle;
        }
        this.drawTetris();
    }

    clearLine(y) {
        let Cell = this.field[`${1}:${y}`];
        while (Cell.right) {
            Cell.contain = false;
            Cell = Cell.right;
        }
        Cell.contain = false;
    }

    isLineFill(y) {
        let Cell = this.field[`${1}:${y}`];
        while (Cell.right) {
            if (Cell.contain === false) return false;
            Cell = Cell.right;
        }
        return Cell.contain !== false;
    }

    isLineEmpty(y) {
        let Cell = this.field[`${1}:${y}`];
        while (Cell.right) {
            if (Cell.contain !== false) return false;
            Cell = Cell.right;
        }
        return Cell.contain === false;
    }

    replaceLines(y1, y2) {
        console.log(`y1 = ${y1}, y2 = ${y2}`);
        let Cell1 = this.field[`1:${y1}`];
        let Cell2 = this.field[`1:${y2}`];
        while (Cell1.right) {
            const temp = Cell1.contain;
            Cell1.contain = Cell2.contain;
            Cell2.contain = temp;
            Cell1 = Cell1.right;
            Cell2 = Cell2.right;
        }
        const temp = Cell1.contain;
        Cell1.contain = Cell2.contain;
        Cell2.contain = temp;
    }

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

    getRandomFigureName() {
        return ["T", "rect", "invL", "L", "invZ", "Z", "line"][Math.trunc(Math.random() * 7)];
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

    getTimeCount() {
        const timeDifference = Date.now() - this.startTime;
        const hours = String(Math.floor(timeDifference / (1000 * 60 * 60))).padStart(2, "0");
        const minutes = String(Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, "0");
        const seconds = String(Math.floor((timeDifference % (1000 * 60)) / 1000)).padStart(2, "0");

        return `${hours}:${minutes}:${seconds}`;
    }

    drawTetris() {
        const w = 40;
        this.ctx.clearRect(0, 0, 400, 800);

        this.linesCounterElement.innerText = this.linesScore;
        this.scoreCounterElement.innerText = this.totalScore;
        this.timeCounterElement.innerText = this.getTimeCount();
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
