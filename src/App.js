import './App.css';
import { useState } from 'react';

function Square({ value, onSquareClick, isWinningSquare }) {
  return (
    <button
      className={isWinningSquare ? "square square__win" : "square"}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay }) {
  function handleClick(i) {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }
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
    return (
      <Square
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

  function handlePlay(nextSquares, selectedSquare) {
    const nextHistory = [...history.slice(0, currentMove + 1), { squares: nextSquares, selectedSquare }];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  const moves = history.map((squares, move) => {
    let description;
    let numberSquare = squares.selectedSquare;
    const row = Math.floor(numberSquare / 3) + 1;
    const col = numberSquare % 3 + 1;
    if (move > 0) {
      description = "Go to move #" + move + ' (' + row + ', ' + col + ')';
    } else if (move === 0) {
      description = "Go to game start";
    }

    if (move === currentMove) {
      if (move > 0) {
        description = "You're at move #" + move + ' (' + row + ', ' + col + ')';
      } else if (move === 0) {
        description = "Tap square to start!";
      }
    }

    return (
      <li key={move}>
        {currentMove === move ? (
          <p className="current__turn">{description}</p>
        ) : (
          <button className="turn" onClick={() => jumpTo(move)}>{description}</button>
        )}
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
        <button className="turn" onClick={() => setIsAscending(!isAscending)}>
          {isAscending ? 'Sort Descending' : 'Sort Ascending'}
        </button>
        <ol>{moves}</ol>
      </div>
    </div>
  )
}