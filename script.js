const canvas = document.getElementById("gameCanvas");

document.body.style.margin = "0";
document.body.style.overflow = "hidden";
document.body.style.display = "flex";
document.body.style.justifyContent = "center";
document.body.style.alignItems = "center";
document.body.style.height = "100vh";
document.body.style.background = "radial-gradient(circle,rgb(127, 255, 68),rgb(255, 1, 255),rgb(45, 194, 253))";
document.body.style.animation = "gradientAnimation 10s infinite linear alternate";

document.head.insertAdjacentHTML("beforeend", `
<style>
    @keyframes gradientAnimation {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
    }
    body {
        background-size: 300% 300%;
    }
    canvas {
        border-radius: 10px;
    }
</style>
`);

const ctx = canvas.getContext("2d");

const cols = 15;
const rows = 15;
let cellSize;

// Estrutura do labirinto
let grid = [];
let stack = [];
let current;
let goal = { x: cols - 1, y: rows - 1 };
let ball = { x: 0, y: 0, radius: 0, targetX: 0, targetY: 0, speed: 0.1 };

function resizeCanvas() {
    canvas.width = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.9;
    cellSize = Math.min(canvas.width / cols, canvas.height / rows);
    ball.radius = cellSize / 4;
    if (/Mobi|Android/i.test(navigator.userAgent)) {
        ball.speed = 0.1;
    }
}
window.addEventListener("resize", resizeCanvas);
window.addEventListener("load", resizeCanvas);
resizeCanvas();

const directions = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 }
];

class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.visited = false;
        this.walls = [true, true, true, true];
    }
    draw() {
        let x = this.x * cellSize;
        let y = this.y * cellSize;
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        if (this.walls[0]) drawLine(x, y, x + cellSize, y);
        if (this.walls[1]) drawLine(x + cellSize, y, x + cellSize, y + cellSize);
        if (this.walls[2]) drawLine(x, y + cellSize, x + cellSize, y + cellSize);
        if (this.walls[3]) drawLine(x, y, x, y + cellSize);
    }
}

function drawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function setupMaze() {
    grid = [];
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            grid.push(new Cell(x, y));
        }
    }
    current = grid[0];
    current.visited = true;
    stack.push(current);
}

function getNeighbors(cell) {
    let neighbors = [];
    directions.forEach((dir, index) => {
        let nx = cell.x + dir.x;
        let ny = cell.y + dir.y;
        let neighbor = grid.find(c => c.x === nx && c.y === ny);
        if (neighbor && !neighbor.visited) {
            neighbors.push({ neighbor, index });
        }
    });
    return neighbors;
}

function generateMaze() {
    if (stack.length > 0) {
        let neighbors = getNeighbors(current);
        if (neighbors.length > 0) {
            let { neighbor, index } = neighbors[Math.floor(Math.random() * neighbors.length)];
            current.walls[index] = false;
            neighbor.walls[(index + 2) % 4] = false;
            neighbor.visited = true;
            stack.push(neighbor);
            current = neighbor;
        } else {
            current = stack.pop();
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    grid.forEach(cell => cell.draw());
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(goal.x * cellSize + cellSize / 2, goal.y * cellSize + cellSize / 2, cellSize / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(ball.x * cellSize + cellSize / 2, ball.y * cellSize + cellSize / 2, ball.radius, 0, Math.PI * 2);
    ctx.fill();
}

document.addEventListener("keydown", (event) => {
    moveBall(event.key);
});

if (window.DeviceMotionEvent) {
    window.addEventListener("devicemotion", handleMotion);
}

function moveBall(direction) {
    let newX = ball.x;
    let newY = ball.y;
    if (direction === "ArrowUp" || direction === "up") newY--;
    if (direction === "ArrowDown" || direction === "down") newY++;
    if (direction === "ArrowLeft" || direction === "left") newX--;
    if (direction === "ArrowRight" || direction === "right") newX++;
    let currentCell = grid.find(c => c.x === ball.x && c.y === ball.y);
    let targetCell = grid.find(c => c.x === newX && c.y === newY);
    if (targetCell && !currentCell.walls[directions.findIndex(d => d.x === (newX - ball.x) && d.y === (newY - ball.y))]) {
        ball.x = newX;
        ball.y = newY;
    }
    // Verificar se a bolinha azul colidiu com a bolinha vermelha
    if (ball.x === goal.x && ball.y === goal.y) {
        // Reinicia o labirinto e a posição da bolinha azul
        setupMaze();
        ball.x = 0;
        ball.y = 0; // Volta a bolinha azul para a posição inicial
    }
}

function handleMotion(event) {
    // Aqui você pode acessar as informações de aceleração do dispositivo
    let acceleration = event.accelerationIncludingGravity;
    let x = acceleration.x;
    let y = acceleration.y;
    let z = acceleration.z;

    // Exemplo de como você pode mover a bola com base no movimento
    if (Math.abs(x) > Math.abs(y)) {
        if (x > 0) {
            moveBall("ArrowLeft");
        } else {
            moveBall("ArrowRight");
        }
    } else {
        if (y > 0) {
            moveBall("ArrowDown");
        } else {
            moveBall("ArrowUp");
        }
    }
}


function gameLoop() {
    generateMaze();
    draw();
    requestAnimationFrame(gameLoop);
}

setupMaze();
gameLoop();
