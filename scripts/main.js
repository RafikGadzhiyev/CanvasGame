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
        this.platformWidth = 10;
        this.platformHeight = 100;
        this.players = [{
                score: 0,
                x: 0,
                y: (CENTERY - this.platformHeight / 2),
                speed: 10,
                color: 'gray'
            },
            {
                score: 0,
                x: (WIDTH - this.platformWidth),
                y: (CENTERY - this.platformHeight / 2),
                speed: 1,
                acceleration: 0.0008,
                startedVelocity: 1,
                color: 'gray'
            }
        ]
        this.ball = {
            x: CENTERX,
            y: CENTERY,
            color: 'white',
            size: 10,
            startedVelocity: 1,
            velocity: 1,
            acceleration: 0.001
        }
        this.botDirection = -1;
        this.startPlayer = Math.random() < 0.6 ? 0 : 1;
        this.gameStartedTime;
        this.dx = Math.random() < 0.5 ? 1 : -1;
        this.dy = Math.random() < 0.5 ? 1 : -1;
        this.ballAnimationID;
        this.botAnimationID;
    }

    init() {
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        this.drawBackground();
        this.players.forEach(item => {
            this.drawPlatform(item.x, item.y)
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
        this.ball.velocity += this.ball.acceleration;
        if ((this.ball.y - this.ball.size) <= 0) {
            this.dy = 1;
        } else if (this.ball.y >= (HEIGHT - this.ball.size * 2)) {
            this.dy = -1;
        }

        this.ballCollision();

        this.ball.x += this.ball.velocity * this.dx;
        this.ball.y += this.ball.velocity * this.dy;
        this.ballAnimationID = requestAnimationFrame(this.setBallSpeed.bind(this));
    }

    checkWin() {
        if (this.players[0].score === 10) {
            alert('Player has won!');
            this.resetGame();
        } else if (this.players[1].score === 10) {
            alert('Bot has won!');
            this.resetGame();
        }
        this.resetBallSpeed();
    }

    resetGame() {
        // tmp solution that need to solve
        window.location.reload(true);
        this.players[0].score = 0;
        this.players[1].score = 0;
        cancelAnimationFrame(this.ballAnimationID);
        cancelAnimationFrame(this.botAnimationID);
    }

    resetBallSpeed() {
        this.ball.velocity = this.ball.startedVelocity;
        this.ball.x = CENTERX;
        this.ball.y = CENTERY;
    }

    resetBotSpeed(){
        this.players[1].speed = this.players[1].startedVelocity
    }

    ballCollision() {
        let [left, right] = this.players;
        if (
            (this.ball.x - this.ball.size <= this.platformWidth) &&
            (parseInt(this.ball.y - this.ball.size) <= parseInt(left.y + this.platformHeight) &&
                parseInt(this.ball.y - this.ball.size) >= parseInt(left.y))
        ) {
            this.dx = 1;
        } else if (
            (this.ball.x + this.ball.size >= WIDTH - this.platformWidth) &&
            (parseInt(this.ball.y + this.ball.size) <= parseInt(right.y + this.platformHeight) &&
                parseInt(this.ball.y + this.ball.size) >= parseInt(right.y))
        ) {
            this.dx = -1;
        } else if (this.ball.x - this.ball.size < left.x) {
            this.players[1].score++;
            this.checkWin();
            this.resetBallSpeed();
            this.getRandomSide();
            this.resetBotSpeed();
        } else if (this.ball.x + this.ball.size >= WIDTH) {
            this.players[0].score++;
            this.checkWin();
            this.resetBotSpeed();
            this.getRandomSide();
            this.resetBallSpeed();
        }
    }

    getRandomSide(){
        this.dx = Math.random() < 0.5 ? 1 : -1;
        this.dy = Math.random() < 0.5 ? 1 : -1;
    }

    setBotSpeed() {
        if(this.players[1].y + this.platformHeight / 2 < this.ball.y){
            this.botDirection = 1;
        }
        else if(this.players[1].y + this.platformHeight / 2 > this.ball.y){
            this.botDirection = -1;
        }
        this.players[1].speed += this.players[1].acceleration;
        if(this.players[1].speed >= 11){
            this.players[1].speed = 11;
        }
        this.players[1].y += this.players[1].speed * this.botDirection ;
        this.botAnimationID = requestAnimationFrame(this.setBotSpeed.bind(this))
    }

    addKeyEvent(key) {
        switch (key) {
            case 'w':
            case 'ArrowUp':
                this.players[0].y -= this.players[0].speed;
                break;
            case 's':
            case 'ArrowDown':
                this.players[0].y += this.players[0].speed;
                break;
        }
        if(this.players[0].y < 0){
            this.players[0].y = 0;
        }
        else if(this.players[0].y + this.platformHeight > HEIGHT){
            this.players[0].y = HEIGHT - this.platformHeight
        }
    }

    drawBall() {
        ctx.fillStyle = this.ball.color;
        ctx.beginPath();
        ctx.arc(this.ball.x, this.ball.y, this.ball.size, 0, 2 * Math.PI)
        ctx.fill();
        ctx.closePath();
    }

    drawScore() {
        ctx.fillStyle = 'white';
        ctx.font = '30px monospace'
        ctx.fillText(`${this.players[0].score}   ${this.players[1].score}`, CENTERX - 40, 50)
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
        ctx.fillStyle = this.players[0].color;
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