 const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const cols = 10;
    const rows = 10;
    const cellSize = canvas.width / cols;

    let maze = [];
    let ballX = 1, ballY = 1;
    let goalX = cols - 2, goalY = rows - 2;
    let level = 1;

    // Função para gerar o labirinto
    function generateMaze() {
      maze = [];
      for (let r = 0; r < rows; r++) {
        maze[r] = [];
        for (let c = 0; c < cols; c++) {
          maze[r][c] = Math.random() > 0.7 ? 1 : 0;  // Paredes são 1, caminhos são 0
        }
      }
      maze[ballY][ballX] = 0;  // Garantir que a bolinha comece em um caminho
      maze[goalY][goalX] = 2;  // Definir o objetivo no centro
    }

    // Função para desenhar o labirinto
    function drawMaze() {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (maze[r][c] === 1) {
            ctx.fillStyle = "#000";  // Paredes
          } else if (maze[r][c] === 0) {
            ctx.fillStyle = "#fff";  // Caminhos
          } else {
            ctx.fillStyle = "#f00";  // Objetivo
          }
          ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
          ctx.strokeRect(c * cellSize, r * cellSize, cellSize, cellSize);
        }
      }
    }

    // Função para desenhar a bolinha
    function drawBall() {
      ctx.beginPath();
      ctx.arc(ballX * cellSize + cellSize / 2, ballY * cellSize + cellSize / 2, cellSize / 4, 0, Math.PI * 2);
      ctx.fillStyle = "#00f";
      ctx.fill();
      ctx.stroke();
    }

    // Função para mover a bolinha
    function moveBall(dx, dy) {
      if (maze[ballY + dy] && maze[ballY + dy][ballX + dx] !== 1) {
        ballX += dx;
        ballY += dy;
      }
      if (ballX === goalX && ballY === goalY) {
        alert('Você chegou ao objetivo!');
        level++;
        generateMaze();
      }
    }

    // Função para capturar teclas de movimento
    function handleKeyPress(e) {
      switch (e.key) {
        case "ArrowUp":
          moveBall(0, -1);
          break;
        case "ArrowDown":
          moveBall(0, 1);
          break;
        case "ArrowLeft":
          moveBall(-1, 0);
          break;
        case "ArrowRight":
          moveBall(1, 0);
          break;
      }
    }

    // Função para atualizar o jogo
    function updateGame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawMaze();
      drawBall();
    }

    // Inicialização
    window.addEventListener("keydown", handleKeyPress);
    generateMaze();
    setInterval(updateGame, 1000 / 30);  // 30 FPS
