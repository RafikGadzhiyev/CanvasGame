const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.clientWidth = document.body.clientWidth * window.devicePixelRatio;
canvas.clientHeight = document.body.clientHeight * window.devicePixelRatio;


ctx.fillStyle = 'white';
ctx.strokeStyle = 'white';

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const CENTERX = WIDTH / 2;
const CENTERY = HEIGHT / 2;


class Game {
    constructor() {
        this.startPlayer = 0;
        this.platformWidth = 10;
        this.platformHeight = 100;
        this.playersPosition = [
            [0, CENTERY - this.platformHeight / 2],
            [WIDTH - this.platformWidth, CENTERY - this.platformHeight / 2]
        ];
        this.playersScore = [0, 0];
        this.ballPosition = [CENTERX, CENTERY];
        this.ballColor = 'white';
        this.platformsColor = 'gray';
        this.backgroundColor = 'gray';
        this.ballSize = 10;
        this.platformSpeed = 10;
        this.botSpeed = 10;
        this.botDirection = -1;
        this.gameStartedTime;
        this.ballVelocity = 1;
        this.startedVelocity = 1;
        this.ballAcceleration = 0.001;
        this.dx = -1;
        this.dy = -1;
        this.ballAnimationID;
        this.botAnimationID;
    }

    init() {
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        this.drawBackground();
        this.playersPosition.forEach(item => {
            this.drawPlatform(item[0], item[1])
        })
        this.drawScore();
        this.drawBall();
        this.getFPS();
        requestAnimationFrame(this.init.bind(this))
    }

    getFPS() {
        let time;
        if (this.gameStartedTime) {
            time = (Date.now() - this.gameStartedTime) / 1000;
            let fps = Math.round(1 / time);
            ctx.fillStyle = 'aqua';
            ctx.font = '20px arial'
            ctx.fillText(`FPS: ${fps}`, CENTERX - 35, 20)
        }

        this.gameStartedTime = Date.now();
    }

    setBallSpeed() {
        this.ballVelocity += this.ballAcceleration;
        if ((this.ballPosition[1] - this.ballSize) <= 0) {
            this.dy = 1;
        } else if (this.ballPosition[1] >= (HEIGHT - this.ballSize * 2)) {
            this.dy = -1;
        }

        this.ballCollision();

        this.ballPosition[0] += this.ballVelocity * this.dx;
        this.ballPosition[1] += this.ballVelocity * this.dy;
        this.ballAnimationID = requestAnimationFrame(this.setBallSpeed.bind(this));
    }

    checkWin(){
        if(this.playersScore[0] === 10){
            alert('Player has won!');
            this.resetGame();            
        }else if(this.playersScore[1] === 10){
            alert('Bot has won!');
            this.resetGame();
        }
        this.resetBallSpeed();
    }

    resetGame(){
        // tmp solution that need to solve
        window.location.reload(true);
        this.playersScore = [0, 0];
        cancelAnimationFrame(this.ballAnimationID);
        cancelAnimationFrame(this.botAnimationID);
    }

    resetBallSpeed(){
        this.ballVelocity = this.startedVelocity;
        this.ballPosition = [CENTERX, CENTERY];
    }

    ballCollision() {
        let [left, right] = this.playersPosition;
        if (
            (this.ballPosition[0] - this.ballSize <= this.platformWidth) &&
            (parseInt(this.ballPosition[1] - this.ballSize) <= parseInt(left[1] + this.platformHeight) &&
                parseInt(this.ballPosition[1] - this.ballSize) >= parseInt(left[1]))
        ) {
            this.dx = 1;
        } else if (
            (this.ballPosition[0] + this.ballSize >= WIDTH - this.platformWidth) && 
            (parseInt(this.ballPosition[1] + this.ballSize) <= parseInt(right[1] + this.platformHeight) &&
                parseInt(this.ballPosition[1] + this.ballSize) >= parseInt(right[1]))
        ) {
            this.dx = -1;
        }else if(this.ballPosition[0] - this.ballSize < left[0]){
            this.playersScore[1]++;
            this.checkWin();
            this.resetBallSpeed();
        }else if(this.ballPosition[0] + this.ballSize >= WIDTH){
            this.playersScore[0]++;
            this.checkWin();
            this.resetBallSpeed();
        }
    }

    setBotSpeed() {
        if (this.playersPosition[1][1] <= 0) {
            this.botDirection = 1;
        } else if (this.playersPosition[1][1] >= HEIGHT - this.platformHeight) {
            this.botDirection = -1;
        }
        this.playersPosition[1][1] += this.botSpeed * this.botDirection;
        this.botAnimationID = requestAnimationFrame(this.setBotSpeed.bind(this))
    }

    addKeyEvent(key) {
        switch (key) {
            case 'w':
            case 'ArrowUp':
                this.playersPosition[0][1] -= this.platformSpeed;
                break;
            case 's':
            case 'ArrowDown':
                this.playersPosition[0][1] += this.platformSpeed;
                break;
        }
    }

    drawBall() {
        ctx.fillStyle = this.ballColor;
        ctx.beginPath();
        ctx.arc(this.ballPosition[0], this.ballPosition[1], this.ballSize, 0, 2 * Math.PI)
        ctx.fill();
        ctx.closePath();
    }

    drawScore() {
        ctx.fillStyle = 'white';
        ctx.font = '30px monospace'
        ctx.fillText(`${this.playersScore[0]}   ${this.playersScore[1]}`, CENTERX - 40, 50)
    }

    drawBackground() {
        ctx.beginPath();
        ctx.moveTo(CENTERX, 0);
        ctx.lineTo(CENTERX, HEIGHT);
        ctx.lineWidth = 10;
        ctx.strokeStyle = this.backgroundColor;
        ctx.stroke();
        ctx.closePath();
    }

    drawPlatform(x, y) {
        ctx.fillStyle = this.platformsColor;
        ctx.fillRect(x, y, this.platformWidth, this.platformHeight);
    }

}

const ActivaGame = new Game();
let isFirst = true;
ActivaGame.init();

window.onkeydown = e => {
    let key = e.key;
    if (isFirst) {
        ActivaGame.setBotSpeed();
        ActivaGame.setBallSpeed();
        isFirst = false;
    }
    ActivaGame.addKeyEvent(key);
}