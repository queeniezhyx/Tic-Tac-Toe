// Gameboard module
const Gameboard = (() => {
  const board = Array(9).fill(null);
  const getBoard = () => board;
  const reset = () => {
    for (let i = 0; i < board.length; i += 1) {
      board[i] = null;
    }
  };
  const setMark = (index, mark) => {
    if (board[index] !== null) return false;
    board[index] = mark;
    return true;
  };
  return { getBoard, reset, setMark };
})();
// Player factory
const Player = (name, mark) => {
  return { name, mark };
};

// Game controller module
const GameController = (() => {
  const players = [Player("Player X", "X"), Player("Player O", "O")];
  let currentPlayerIndex = 0;
  let gameOver = false;
  const getCurrentPlayer = () => players[currentPlayerIndex];
  const getPlayers = () => players;
  const setPlayerNames = (name1, name2) => {
    players[0].name = name1 || "Player X";
    players[1].name = name2 || "Player O";
  };
  const restart = () => {
    Gameboard.reset();
    currentPlayerIndex = 0;
    gameOver = false;
  };
  const isGameOver = () => gameOver;
  const winningCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  const checkWinner = (mark) => {
    const board = Gameboard.getBoard();
    return winningCombos.some((combo) =>
      combo.every((index) => board[index] === mark)
    );
  };
  const checkDraw = () => {
    return Gameboard.getBoard().every((cell) => cell !== null);
  };
  // Play a round
  const playRound = (cellIndex) => {
    if (gameOver) return { status: "game-over" };
    const currentPlayer = getCurrentPlayer();
    const placed = Gameboard.setMark(cellIndex, currentPlayer.mark);
    if (!placed) {
      // check invalid move
      return { status: "invalid" };
    }
    // check win
    if (checkWinner(currentPlayer.mark)) {
      gameOver = true;
      return { status: "win", player: currentPlayer };
    }
    if (checkDraw()) {
      gameOver = true;
      return { status: "draw" };
    }
    // switch player
    currentPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
    return { status: "continue", player: getCurrentPlayer() };
  };
  return {
    getCurrentPlayer,
    getPlayers,
    setPlayerNames,
    restart,
    isGameOver,
    playRound,
  };
})();
// Display controller module (UI)
const DisplayController = (() => {
  let cells;
  let statusText;
  let resetBtn;
  let startBtn;
  let p1Input;
  let p2Input;
  const cacheDom = () => {
    cells = document.querySelectorAll(".cell");
    statusText = document.getElementById("status-text");
    resetBtn = document.getElementById("reset-btn");
    startBtn = document.getElementById("start-btn");
    p1Input = document.getElementById("player1-name");
    p2Input = document.getElementById("player2-name");
  };
  const renderBoard = () => {
    const board = Gameboard.getBoard();
    cells.forEach((cell) => {
      const index = Number(cell.dataset.index);
      cell.textContent = board[index] || "";
    });
  };
  const setStatus = (message) => {
    statusText.textContent = message;
  };
  const updateTurnStatus = () => {
    const current = GameController.getCurrentPlayer();
    setStatus(`${current.name}'s turn (${current.mark})`);
  };
  const handleCellClick = (e) => {
    const index = Number(e.target.dataset.index);
    const result = GameController.playRound(index);
    renderBoard();
    // process result
    if (!result) return;
    switch (result.status) {
      case "invalid":
        // do nothing
        break;
      case "win":
        setStatus(`🎉 ${result.player.name} wins!`);
        disableBoard();
        break;
      case "draw":
        setStatus("It's a draw!");
        disableBoard();
        break;
      case "continue":
        updateTurnStatus();
        break;
      default:
        break;
    }
  };
  const enableBoard = () => {
    cells.forEach((cell) => {
      cell.disabled = false;
    });
  };
  const disableBoard = () => {
    cells.forEach((cell) => {
      cell.disabled = true;
    });
  };
  const clearBoardUI = () => {
    cells.forEach((cell) => {
      cell.textContent = "";
    });
  };
  const bindEvents = () => {
    cells.forEach((cell) => {
      cell.addEventListener("click", handleCellClick);
    });
    resetBtn.addEventListener("click", () => {
      GameController.restart();
      clearBoardUI();
      enableBoard();
      updateTurnStatus();
    });
    startBtn.addEventListener("click", () => {
      const name1 = p1Input.value.trim();
      const name2 = p2Input.value.trim();
      GameController.setPlayerNames(name1, name2);
      GameController.restart();
      clearBoardUI();
      enableBoard();
      updateTurnStatus();
    });
  };
  const init = () => {
    cacheDom();
    bindEvents();
    // initial state
    disableBoard(); 
    setStatus('Click "Start Game" to begin');
  };
  return { init };
})();
// Initialize the game when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  DisplayController.init();
});
