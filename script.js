const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 500;
canvas.height = 500;

const cols = 15;
const rows = 15;
const cellSize = canvas.width / cols;

// Estrutura do labirinto
let grid = [];
let stack = [];
let current;
let goal = { x: cols - 1, y: rows - 1 }; // Objetivo no centro
let ball = { x: 0, y: 0, radius: cellSize / 4 };

// Direções possíveis
const directions = [
    { x: 0, y: -1 }, // cima
    { x: 1, y: 0 },  // direita
    { x: 0, y: 1 },  // baixo
    { x: -1, y: 0 }  // esquerda
];

// Criar células do labirinto
class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.visited = false;
        this.walls = [true, true, true, true]; // topo, direita, baixo, esquerda
    }
    draw() {
        let x = this.x * cellSize;
        let y = this.y * cellSize;
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;

        if (this.walls[0]) drawLine(x, y, x + cellSize, y); // Topo
        if (this.walls[1]) drawLine(x + cellSize, y, x + cellSize, y + cellSize); // Direita
        if (this.walls[2]) drawLine(x, y + cellSize, x + cellSize, y + cellSize); // Baixo
        if (this.walls[3]) drawLine(x, y, x, y + cellSize); // Esquerda
    }
}

// Função para desenhar linha
function drawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

// Inicializar o labirinto
function setupMaze() {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            grid.push(new Cell(x, y));
        }
    }
    current = grid[0];
    current.visited = true;
    stack.push(current);
}

// Obter vizinhos não visitados
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

// Algoritmo para gerar o labirinto (DFS)
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

// Desenhar o labirinto e a bolinha
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    grid.forEach(cell => cell.draw());

    // Desenhar objetivo
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(goal.x * cellSize + cellSize / 2, goal.y * cellSize + cellSize / 2, cellSize / 4, 0, Math.PI * 2);
    ctx.fill();

    // Desenhar a bolinha
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(ball.x * cellSize + cellSize / 2, ball.y * cellSize + cellSize / 2, ball.radius, 0, Math.PI * 2);
    ctx.fill();
}

// Movimento da bolinha pelo teclado (Desktop)
document.addEventListener("keydown", (event) => {
    moveBall(event.key);
});

// Movimento por sensor (Mobile)
if (window.DeviceMotionEvent) {
    window.addEventListener("devicemotion", handleMotion);
}

// Lógica de movimento
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

    if (ball.x === goal.x && ball.y === goal.y) {
        alert("Você venceu!");
        location.reload();
    }
}

// Controle por sensor de movimento (Mobile)
function handleMotion(event) {
    let accelerationX = event.accelerationIncludingGravity.x;
    let accelerationY = event.accelerationIncludingGravity.y;

    if (Math.abs(accelerationX) > 2 || Math.abs(accelerationY) > 2) {
        if (accelerationY < -2) moveBall("up");
        if (accelerationY > 2) moveBall("down");
        if (accelerationX < -2) moveBall("left");
        if (accelerationX > 2) moveBall("right");
    }
}

// Loop principal
function gameLoop() {
    generateMaze();
    draw();
    requestAnimationFrame(gameLoop);
}

// Iniciar o jogo
setupMaze();
gameLoop();
