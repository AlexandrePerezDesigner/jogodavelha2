let currentPlayer = "O";
let boardStates = Array(9).fill(null).map(() => Array(9).fill(null));
let scores = { "O": 0, "X": 0 };
let gameIsActive = true; // Variável para rastrear se o jogo está ativo

const winningCombinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

// Atualiza o placar visual
function updateScoreboard() {
  document.getElementById("score-o-count").textContent = scores["O"];
  document.getElementById("score-x-count").textContent = scores["X"];
}

// Atualiza o indicador de jogador atual
function updateCurrentPlayerText() {
  const currentPlayerText = currentPlayer === "O" ? "BOLA JOGA" : "XIS JOGA";
  document.getElementById("current-player").textContent = currentPlayerText;
}

// Alterna o jogador e o cursor
function togglePlayer() {
  currentPlayer = currentPlayer === "O" ? "X" : "O";
  updateCursor();
  updateCurrentPlayerText();
}

// Atualiza o cursor do mouse com base no jogador atual
function updateCursor() {
  const cursorUrl = currentPlayer === "O" 
    ? "C:/Users/User/OneDrive/Design/jogo-da-velha-2/assets/bola2.png" 
    : "C:/Users/User/OneDrive/Design/jogo-da-velha-2/assets/xis2.png";
  const cursorSize = 22;
  document.body.style.cursor = `url(${cursorUrl}) ${cursorSize} ${cursorSize}, auto`;
  document.querySelectorAll(".cell").forEach(cell => {
    cell.style.cursor = `url(${cursorUrl}) ${cursorSize} ${cursorSize}, auto`;
  });
}

// Destaca as células vencedoras com base no jogador e exibe a imagem grande sobre o mini tabuleiro
function highlightWinningCells(boardIndex, combination, color, winner) {
  // Define a cor de fundo das células vencedoras
  combination.forEach((index) => {
    const cell = document.getElementById(`board-${boardIndex + 1}`).children[index];
    cell.style.backgroundColor = color;
  });

  // Exibe a imagem do vencedor sobre o mini tabuleiro
  const board = document.getElementById(`board-${boardIndex + 1}`);
  const winnerOverlay = document.createElement("div");
  winnerOverlay.style.position = "absolute";
  winnerOverlay.style.top = 0;
  winnerOverlay.style.left = 0;
  winnerOverlay.style.width = "100%";
  winnerOverlay.style.height = "100%";
  winnerOverlay.style.backgroundImage = `url(${
    winner === "O" 
      ? "C:/Users/User/OneDrive/Design/jogo-da-velha-2/assets/bola-big.png" 
      : "C:/Users/User/OneDrive/Design/jogo-da-velha-2/assets/xis-big.png"
  })`;
  winnerOverlay.style.backgroundSize = "cover";
  winnerOverlay.style.backgroundPosition = "center";
  winnerOverlay.style.zIndex = "10"; // Garantir que fique na frente
  board.appendChild(winnerOverlay);
}

// Função para mostrar o popup de feedback visual
function showOverlay(message, color, isFinal = false) {
  const overlay = document.getElementById("overlay");
  const overlayMessage = document.getElementById("overlay-message");
  overlay.style.backgroundColor = color;
  overlayMessage.textContent = message;
  overlay.style.display = "flex";

  // Se for o final do jogo, exibe o feedback por 3 segundos
  if (isFinal) {
    setTimeout(() => {
      overlay.style.display = "none";
    }, 3000);
    document.getElementById("restart-button").style.display = "block"; // Exibe o botão de reinício
  } else {
    setTimeout(() => {
      overlay.style.display = "none";
    }, 1000);
  }
}


// Atualiza a função de verificação do vencedor do mini tabuleiro para mostrar o feedback
function checkMiniBoardWinner(boardIndex) {
  const board = boardStates[boardIndex];
  for (const combination of winningCombinations) {
    const [a, b, c] = combination;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      const color = board[a] === "O" ? "#9adbe1" : "#e19a9a";
      highlightWinningCells(boardIndex, combination, color, board[a]);

      const message = board[a] === "O" ? "PONTO PARA BOLA" : "PONTO PARA XIS";
      const overlayColor = board[a] === "O" ? "#08939c" : "#853131";
      showOverlay(message, overlayColor);

      return board[a];
    }
  }

  // Verifica empate no mini tabuleiro
  if (board.every(cell => cell !== null)) {
    const boardElement = document.getElementById(`board-${boardIndex + 1}`);
    const drawOverlay = document.createElement("div");
    drawOverlay.style.position = "absolute";
    drawOverlay.style.top = 0;
    drawOverlay.style.left = 0;
    drawOverlay.style.width = "100%";
    drawOverlay.style.height = "100%";
    drawOverlay.style.backgroundImage = "url('C:/Users/User/OneDrive/Design/jogo-da-velha-2/assets/empate-big.png')";
    drawOverlay.style.backgroundSize = "cover";
    drawOverlay.style.backgroundPosition = "center";
    drawOverlay.style.zIndex = "10";
    boardElement.appendChild(drawOverlay);
    return "draw";
  }

  return null;
}

// Atualiza a função de verificação de vitória global para mostrar o feedback de vencedor final
function checkGlobalWin() {
  const mainBoard = boardStates.map((_, index) => checkMiniBoardWinner(index));
  for (const combination of winningCombinations) {
    const [a, b, c] = combination;
    if (mainBoard[a] && mainBoard[a] === mainBoard[b] && mainBoard[a] === mainBoard[c]) {
      const winnerMessage = mainBoard[a] === "O" ? "BOLA VENCEDOR!" : "XIS VENCEDOR!";
      const winnerColor = mainBoard[a] === "O" ? "#08939c" : "#853131";

      showOverlay(winnerMessage, winnerColor, true); // Exibe o popup com vencedor final e botão de reinício
      gameIsActive = false; // Finaliza o jogo
      return;
    }
  }

    // Verifica se o tabuleiro principal está completo e declara vencedor pela pontuação
  if (!mainBoard.includes(null)) {
    if (scores["O"] > scores["X"]) {
      showOverlay("BOLA VENCEDOR POR PONTOS!", "#08939c", true);
    } else if (scores["X"] > scores["O"]) {
      showOverlay("XIS VENCEDOR POR PONTOS!", "#853131", true);
    } else {
      showOverlay("EMPATE!", "#666", true); // Exibe EMPATE se as pontuações forem iguais
    }
    gameIsActive = false; // Finaliza o jogo
  }
}

// Função chamada ao clicar em uma célula
function handleCellClick(event, boardIndex, cellIndex) {
  if (!gameIsActive || boardStates[boardIndex][cellIndex] || checkMiniBoardWinner(boardIndex)) return;

  boardStates[boardIndex][cellIndex] = currentPlayer;
  const cell = event.target;
  const imageUrl = currentPlayer === "O" 
    ? "C:/Users/User/OneDrive/Design/jogo-da-velha-2/assets/bola2.png" 
    : "C:/Users/User/OneDrive/Design/jogo-da-velha-2/assets/xis2.png";
  cell.style.backgroundImage = `url('${imageUrl}')`;
  cell.style.backgroundSize = "cover";

  const winner = checkMiniBoardWinner(boardIndex);
  if (winner && winner !== "draw") { 
    scores[winner]++;
    updateScoreboard();
    checkGlobalWin();
  }

  togglePlayer();
}

// Chame `updateCurrentPlayerText` na inicialização
function initializeGame() {
  document.querySelectorAll(".board").forEach((board, boardIndex) => {
    board.innerHTML = "";
    board.style.position = "relative";
    for (let cellIndex = 0; cellIndex < 9; cellIndex++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.addEventListener("click", (event) => handleCellClick(event, boardIndex, cellIndex));
      board.appendChild(cell);
    }
  });
  updateCursor();
  updateCurrentPlayerText(); // Define o texto inicial do jogador
}

// Função de reinício do jogo
function resetGame() {
  boardStates = Array(9).fill(null).map(() => Array(9).fill(null));
  scores = { "O": 0, "X": 0 };
  updateScoreboard();
  document.querySelectorAll(".board").forEach((board) => {
    board.style.backgroundColor = "transparent";
    board.innerHTML = "";
  });

  document.getElementById("overlay").style.display = "none"; // Esconde o popup
  document.getElementById("restart-button").style.display = "none"; // Esconde o botão de reinício
  gameIsActive = true; // Reativa o jogo
  initializeGame();
}

initializeGame();
