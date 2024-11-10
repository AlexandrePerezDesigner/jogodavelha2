let currentPlayer = "O";
let boardStates = Array(9).fill(null).map(() => Array(9).fill(null));
let scores = { "O": 0, "X": 0 };
let gameIsActive = true;
const mode = localStorage.getItem("modoDeJogo"); // "2-jogadores", "ia-facil", ou "ia-dificil"

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

// Carrega o som de clique
const buttonClickSound = new Audio('assets/button-pressed.mp3');

// Função para reproduzir o som
function playButtonClickSound() {
    buttonClickSound.currentTime = 0; // Reinicia o som a cada clique
    buttonClickSound.play();
}

// Função para iniciar o jogo com atraso para tocar o som
// Função para iniciar o jogo com transição
function startGame(mode) {
    localStorage.setItem("modoDeJogo", mode);
    localStorage.setItem("iniciarMusica", "true"); // Marca para iniciar a música
    playButtonClickSound();
    document.body.classList.add("fade-out");
    setTimeout(() => {
        window.location.href = "game.html";
    }, 500);
}


function goBackToHome() {
    playButtonClickSound();
    document.body.classList.add("fade-out"); // Aplica fade-out
    setTimeout(() => {
        window.location.href = "index.html";  // Redireciona após a transição
    }, 500); // Tempo ligeiramente reduzido para suavidade
}



// Adiciona os eventos aos botões após o carregamento da página
// Adiciona os eventos aos botões após o carregamento da página
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btn-2-jogadores")?.addEventListener("click", () => startGame("2-jogadores"));
    document.getElementById("btn-ia-facil")?.addEventListener("click", () => startGame("ia-facil"));
    document.getElementById("btn-ia-dificil")?.addEventListener("click", () => startGame("ia-dificil"));

    // Adiciona o evento para o botão "Reiniciar"
    document.getElementById("restart-button")?.addEventListener("click", () => {
        playButtonClickSound();
        setTimeout(resetGame, 300); // Reinicia o jogo após o som
    });
});


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

// Alterna o jogador
function togglePlayer() {
  currentPlayer = currentPlayer === "O" ? "X" : "O";
  updateCursor();
  updateCurrentPlayerText();
}

// Atualiza o cursor do mouse com base no jogador atual
function updateCursor() {
  const cursorUrl = currentPlayer === "O" 
    ? "assets/bola2.png" 
    : "assets/xis2.png";
  const cursorSize = 22;
  document.body.style.cursor = `url(${cursorUrl}) ${cursorSize} ${cursorSize}, auto`;
  document.querySelectorAll(".cell").forEach(cell => {
    cell.style.cursor = `url(${cursorUrl}) ${cursorSize} ${cursorSize}, auto`;
  });
}

// Destaca as células vencedoras
function highlightWinningCells(boardIndex, combination, color, winner) {
  combination.forEach((index) => {
    const cell = document.getElementById(`board-${boardIndex + 1}`).children[index];
    cell.style.backgroundColor = color;
  });

  const board = document.getElementById(`board-${boardIndex + 1}`);
  const winnerOverlay = document.createElement("div");
  winnerOverlay.style.position = "absolute";
  winnerOverlay.style.top = 0;
  winnerOverlay.style.left = 0;
  winnerOverlay.style.width = "100%";
  winnerOverlay.style.height = "100%";
  winnerOverlay.style.backgroundImage = `url(${
    winner === "O" 
      ? "assets/bola-big.png" 
      : "assets/xis-big.png"
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

  // Esconde o overlay após o tempo definido
  setTimeout(() => {
    overlay.style.display = "none";
    if (isFinal) document.getElementById("restart-button").style.display = "block";
  }, isFinal ? 3000 : 1000);
}

// Verifica o vencedor do mini tabuleiro
function checkMiniBoardWinner(boardIndex) {
  const board = boardStates[boardIndex];
  
  // Verifica se o tabuleiro já foi vencido para evitar popups duplicados
  if (board.every(cell => cell !== null && cell !== "O" && cell !== "X")) return null;

  for (const combination of winningCombinations) {
    const [a, b, c] = combination;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      const color = board[a] === "O" ? "#9adbe1" : "#e19a9a";
      highlightWinningCells(boardIndex, combination, color, board[a]);

      const message = board[a] === "O" ? "PONTO PARA BOLA" : "PONTO PARA XIS";
      const overlayColor = board[a] === "O" ? "#08939c" : "#853131";
      showOverlay(message, overlayColor);

      // Marca o tabuleiro como vencido para evitar pontuação repetida
      boardStates[boardIndex] = Array(9).fill(board[a]);
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
    drawOverlay.style.backgroundImage = "url('assets/empate-big.png')";
    drawOverlay.style.backgroundSize = "cover";
    drawOverlay.style.backgroundPosition = "center";
    drawOverlay.style.zIndex = "10";
    boardElement.appendChild(drawOverlay);
    return "draw";
  }

  return null;
}

// Verifica o vencedor global ou declara vencedor por pontos ao final
function checkGlobalWin() {
  const mainBoard = boardStates.map((_, index) => checkMiniBoardWinner(index));

  // Verifica se há uma combinação vencedora no tabuleiro global
  for (const combination of winningCombinations) {
    const [a, b, c] = combination;
    if (mainBoard[a] && mainBoard[a] === mainBoard[b] && mainBoard[a] === mainBoard[c]) {
      const winnerMessage = mainBoard[a] === "O" ? "BOLA VENCEDOR!" : "XIS VENCEDOR!";
      const winnerColor = mainBoard[a] === "O" ? "#08939c" : "#853131";
      showOverlay(winnerMessage, winnerColor, true);
      gameIsActive = false;
      return;
    }
  }

  // Verifica se o jogo acabou sem um vencedor global
  const gameFinished = mainBoard.every(board => board !== null);
  if (gameFinished) {
    // Declara o vencedor por pontos ou empate
    if (scores["O"] > scores["X"]) {
      showOverlay("BOLA VENCEDOR POR PONTOS!", "#08939c", true);
    } else if (scores["X"] > scores["O"]) {
      showOverlay("XIS VENCEDOR POR PONTOS!", "#853131", true);
    } else {
      showOverlay("EMPATE!", "#666", true);
    }
    gameIsActive = false;
  }
}

// Jogada do jogador humano
function handleCellClick(event, boardIndex, cellIndex) {
  if (!gameIsActive || boardStates[boardIndex][cellIndex] || checkMiniBoardWinner(boardIndex)) return;

  boardStates[boardIndex][cellIndex] = currentPlayer;
  const cell = event.target;
  const imageUrl = currentPlayer === "O" ? "assets/bola2.png" : "assets/xis2.png";
  cell.style.backgroundImage = `url('${imageUrl}')`;
  cell.style.backgroundSize = "cover";

  const winner = checkMiniBoardWinner(boardIndex);
  if (winner && winner !== "draw") { 
    scores[winner]++;
    updateScoreboard();
    checkGlobalWin();
  }

  togglePlayer();

  // Verifica se é a vez da IA e chama `playAI`
  if (gameIsActive && (mode === "ia-facil" || mode === "ia-dificil") && currentPlayer === "X") {
    setTimeout(playAI, 500);
  }
}

// Função de reinício do jogo
function resetGame() {
  boardStates = Array(9).fill(null).map(() => Array(9).fill(null));
  scores = { "O": 0, "X": 0 };
  updateScoreboard();
  currentPlayer = "O"; // Redefine o jogador inicial como "O"
  gameIsActive = true;

  document.querySelectorAll(".board").forEach((board) => {
    board.style.backgroundColor = "transparent";
    board.innerHTML = "";
  });

  document.getElementById("overlay").style.display = "none";
  document.getElementById("restart-button").style.display = "none";
  
  initializeGame();
}

// Inicialização do jogo
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
  updateCurrentPlayerText();
}

initializeGame();

// Função para a jogada da IA
function playAI() {
  if (!gameIsActive) return;

  let availableMoves = [];
  boardStates.forEach((board, boardIndex) => {
    board.forEach((cell, cellIndex) => {
      if (cell === null) availableMoves.push({ boardIndex, cellIndex });
    });
  });

  function findWinningMove(player) {
    for (let boardIndex = 0; boardIndex < 9; boardIndex++) {
      const board = boardStates[boardIndex];
      for (const [a, b, c] of winningCombinations) {
        if (board[a] === player && board[b] === player && board[c] === null) return { boardIndex, cellIndex: c };
        if (board[a] === player && board[b] === null && board[c] === player) return { boardIndex, cellIndex: b };
        if (board[a] === null && board[b] === player && board[c] === player) return { boardIndex, cellIndex: a };
      }
    }
    return null;
  }

  let move = null;
  if (mode === "ia-dificil") {
    move = findWinningMove("X") || findWinningMove("O");
  }
  
  if (!move && availableMoves.length > 0) {
    move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }

  if (move) {
    const board = document.getElementById(`board-${move.boardIndex + 1}`);
    const cell = board.children[move.cellIndex];
    handleCellClick({ target: cell }, move.boardIndex, move.cellIndex);
  }
}

// Carrega a música de fundo
const backgroundMusic = new Audio('assets/song-velha.mp3');
backgroundMusic.volume = 0.4; // Define o volume para 40%
backgroundMusic.loop = true;  // Configura para tocar em loop

// Função para iniciar a música, se marcada para iniciar
function startBackgroundMusicIfNeeded() {
    const iniciarMusica = localStorage.getItem("iniciarMusica");
    if (iniciarMusica === "true") {
        backgroundMusic.play().catch(() => {
            document.body.addEventListener('click', resumeBackgroundMusic, { once: true });
        });
        localStorage.setItem("iniciarMusica", "false"); // Reset para evitar repetição
    }
}

// Função para iniciar a música após uma interação do usuário
function resumeBackgroundMusic() {
    backgroundMusic.play();
    document.body.removeEventListener('click', resumeBackgroundMusic);
}

// Configura o botão de controle da música para alternar entre tocar e pausar
function setupMusicControl() {
    const musicToggleButton = document.getElementById("toggle-music");
    if (musicToggleButton) {
        musicToggleButton.addEventListener("click", () => {
            if (backgroundMusic.paused) {
                backgroundMusic.play();
                musicToggleButton.textContent = "Desligar Música";
            } else {
                backgroundMusic.pause();
                musicToggleButton.textContent = "Ligar Música";
            }
        });
    }
}

// Chama a função ao carregar a página para verificar e iniciar a música, se necessário
document.addEventListener("DOMContentLoaded", () => {
    startBackgroundMusicIfNeeded(); // Inicia a música somente se marcada
    setupMusicControl(); // Configura o botão de controle de música
});


