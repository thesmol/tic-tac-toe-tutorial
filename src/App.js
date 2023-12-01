import './App.css';
import { useState, useEffect } from 'react';

function Difficulty({ difficulty, setDifficulty, setHistory, setCurrentMove }) {

  const handleDifficultyChange = (event) => {
    setDifficulty(event.target.value);
    setHistory([{ squares: Array(9).fill(null), selectedSquare: null }]);
    setCurrentMove(0);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: '20px'
    }}>
      <label>
        <input
          type="radio"
          value="easy"
          checked={difficulty === 'easy'}
          onChange={handleDifficultyChange}
        />
        Easy
      </label>
      <label>
        <input
          type="radio"
          value="hard"
          checked={difficulty === 'hard'}
          onChange={handleDifficultyChange}
        />
        Hard
      </label>
    </div>
  )
}


function makeBotMove(squares, difficulty) {
  // Если сложность "легкая", бот выбирает случайную свободную ячейку
  if (difficulty === 'easy') {
    let emptySquares = squares.map((square, index) => square === null ? index : null).filter(index => index !== null);
    let randomIndex = Math.floor(Math.random() * emptySquares.length);
    return emptySquares[randomIndex];
  }

  // Если сложность "сложная", бот использует алгоритм минимакса для выбора хода
  if (difficulty === 'hard') {
    let bestScore = -Infinity;
    let move;
    for (let i = 0; i < 9; i++) {
      // Если ячейка свободна
      if (squares[i] === null) {
        squares[i] = 'O';
        let score = minimax(squares, 0, false);
        squares[i] = null;
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  }

  // Если сложность не указана, бот не делает ход
  return null;
}

// по входной комбинации ходов вычисляется знак победителя, если он определен
function calculateWinnerXO(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function minimax(squares, depth, isMaximizing) {
  // Проверяем, есть ли победитель в текущем состоянии игры
  let winner = calculateWinnerXO(squares);
  if (winner === 'O') return 10 - depth; // Если победил 'O', возвращаем 10 минус глубина
  if (winner === 'X') return depth - 10; // Если победил 'X', возвращаем глубина минус 10

  // Проверяем, заполнено ли поле
  if (isBoardFull(squares)) return 0; // Если поле заполнено, возвращаем 0 (ничья)

  // Если игра еще не окончена, начинаем исследовать все возможные ходы
  if (isMaximizing) { // Если текущий игрок - это 'O' (максимизирующий игрок)
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (squares[i] === null) { // Если ячейка свободна
        squares[i] = 'O'; // Делаем ход
        let score = minimax(squares, depth + 1, false); // Рекурсивно исследуем следующий ход
        squares[i] = null; // Отменяем ход
        bestScore = Math.max(score, bestScore); // Обновляем лучший счет, если текущий счет больше
      }
    }
    return bestScore; // Возвращаем лучший счет для этого хода
  } else { // Если текущий игрок - это 'X' (минимизирующий игрок)
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (squares[i] === null) { // Если ячейка свободна
        squares[i] = 'X'; // Делаем ход
        let score = minimax(squares, depth + 1, true); // Рекурсивно исследуем следующий ход
        squares[i] = null; // Отменяем ход
        bestScore = Math.min(score, bestScore); // Обновляем лучший счет, если текущий счет меньше
      }
    }
    return bestScore; // Возвращаем лучший счет для этого хода
  }
}

function isBoardFull(squares) {
  for (let i = 0; i < squares.length; i++) {
    if (squares[i] === null) return false;
  }
  return true;
}


function Square({ value, onSquareClick, isWinningSquare, coords }) {
  return (
    <button
      className={isWinningSquare ? "square square__win" : "square"}
      onClick={onSquareClick}
    >
      <div className="square-content">
        <div className="square-value">{value}</div>
        <div className="square-coords">
          <p style={{fontSize: '8px'}}>{coords[0]} {coords[1]}</p>
        </div>
      </div>
    </button>
  );
}
const getCoords = index => {
  const row = Math.floor(index / 3) + 1;
  const col = index % 3 + 1;

  return [row, col]
}

function Board({ xIsNext, squares, onPlay }) {
  function handleClick(i) {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? 'X' : 'O';
    onPlay(nextSquares, i);
  }


  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = 'Winner: ' + squares[winner[0]];
  } else if (squares.every(square => square !== null)) {
    status = 'Draw ;(((';
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  function calculateWinner(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return lines[i];
      }
    }
    return null;
  }

  const renderSquare = (i) => {
    const coords = getCoords(i);
    return (
      <Square
        coords = {coords}
        key={i}
        value={squares[i]}
        onSquareClick={() => handleClick(i)}
        isWinningSquare={winner && winner.includes(i)}
      />)
  }

  const createBoard = () => {
    let board = [];
    for (let i = 0; i < 3; i++) {
      let row = [];
      for (let j = 0; j < 3; j++) {
        row.push(renderSquare(i * 3 + j));
      }
      board.push(<div key={i} className='board-row'>{row}</div>)
    }
    return board;
  }

  return (
    <>
      <div className='status'>{status}</div>
      {createBoard()}
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([{ squares: Array(9).fill(null), selectedSquare: null }]);
  const [currentMove, setCurrentMove] = useState(0);
  const [isAscending, setIsAscending] = useState(true);
  const currentStep = history[currentMove];
  const currentSquares = currentStep.squares;
  const xIsNext = currentMove % 2 === 0;
  const [difficulty, setDifficulty] = useState('easy');
  const [isJumping, setIsJumping] = useState(false);

  useEffect(() => {
    if (!xIsNext && currentMove < 9 && !isJumping) {
      const botMove = makeBotMove(currentSquares, difficulty);
      if (botMove !== null) {
        const nextSquares = [...currentSquares];
        nextSquares[botMove] = 'O';
        const nextHistory = [...history, { squares: nextSquares, selectedSquare: botMove }];
        setHistory(nextHistory);
        setCurrentMove(nextHistory.length - 1);
      }
    }
    setIsJumping(false);
  }, [currentMove, xIsNext]);

  function handlePlay(nextSquares, selectedSquare, xIsNext) {
    const nextHistory = [...history.slice(0, currentMove + 1), { squares: nextSquares, selectedSquare }];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    if (nextMove % 2 === 0) {
      setIsJumping(true);
      setCurrentMove(nextMove);
    }
  }

  const moves = history.map((squares, move) => {
    let description;
    let numberSquare = squares.selectedSquare;
    const row = Math.floor(numberSquare / 3) + 1;
    const col = numberSquare % 3 + 1;
    if (move > 0) {
      description = move % 2 === 0 ? "Go to move #" + move + ' (' + row + ', ' + col + ')' : "Move #" + move + ' (' + row + ', ' + col + ')';
    } else if (move === 0) {
      description = "Go to game start";
    }

    if (move === currentMove) {
      if (move > 0) {
        description = "Current move #" + move + ' (' + row + ', ' + col + ')';
      } else if (move === 0) {
        description = "Tap square to start!";
      }
    }

    return (
      <li key={move}>
        {currentMove === move ? (
          <p className="current__turn">{description}</p>
        ) : (
          <button className={(description !== "Go to game start" && move % 2 !== 0) ? "turn" : "turn bot-turn"} onClick={() => jumpTo(move)}>{description}</button>)}
      </li>
    );
  });

  if (!isAscending) {
    moves.reverse();
  }

  return (
    <div className='game'>
      <div className='game-board'>
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className='game-info'>
        <Difficulty
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          setHistory={setHistory}
          setCurrentMove={setCurrentMove}
        />
        <button className="turn" onClick={() => setIsAscending(!isAscending)}>
          {isAscending ? 'Sort Descending' : 'Sort Ascending'}
        </button>
        <ol>{moves}</ol>
      </div>
    </div>
  )
}