import React, { useState, useEffect, useRef } from 'react';
import './Game2048.css';
import autoAnimate from '@formkit/auto-animate';

const GRID_WIDTH = 100;
interface TileProps {
  value: number;
  isNew?: boolean;
  isMerged?: boolean;
  moveDir?: string;
  moveNum?: number;
}

const Tile: React.FC<TileProps> = ({ value, isNew, isMerged, moveDir, moveNum = 0 }) => {
  return (
    <div
      className={`tile ${moveDir ? (moveDir === 'left' || moveDir === 'right' ? 'move-hor' : 'move-vert') : ''} tile-${value} ${isNew ? 'tile-new' : ''} ${isMerged ? 'tile-merged' : ''}`}
      style={{ '--move-dir': moveDir, '--move-num': `${moveNum}px` } as React.CSSProperties}
    >
      {value !== 0 && value}
    </div>
  );
};

type Board = { value: number, moveDir?: string, moveNum?: number }[][];
type Direction = 'up' | 'down' | 'left' | 'right';

const GRID_SIZE = 4;

function getInitialBoard(): Board {
  const board = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => ({ value: 0 }))
  );
  return addRandomTile(addRandomTile(board));
}

function addRandomTile(board: Board): Board {
  const availableCells = [];
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if (board[i][j].value === 0) {
        availableCells.push({ i, j });
      }
    }
  }

  if (availableCells.length > 0) {
    const { i, j } = availableCells[Math.floor(Math.random() * availableCells.length)];
    const random = Math.random();
    board[i][j].value = random < 0.75 ? 2 : random < 0.9 ? 4 : random < 0.98 ? 8 : 16;
  }

  return board;
}

const BoardComp: React.FC<{ board: Board }> = ({ board }) => {
  return (
    <div className="board">
      {board.map((row, rowIndex) => row.map((cell, colIndex) => (
        <Tile key={`${rowIndex}-${colIndex}`} value={cell.value} moveDir={cell.moveDir} moveNum={cell.moveNum} />
      )))}
    </div>
  );
};

const Game: React.FC = () => {
  const [board, setBoard] = useState<Board>(getInitialBoard());
  const [score, setScore] = useState<number>(0);
  const [maxNumber, setMaxNumber] = useState<number>(0);
  const parent = useRef(null);

  useEffect(() => {
    parent.current && autoAnimate(parent.current);
  }, [parent]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.startsWith('Arrow')) {
        const direction = event.key.replace('Arrow', '').toLowerCase() as Direction;
        move(direction);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [board]);

  const filterFunc = (val: { value: number }) => val.value !== 0;

  const moveLeftRight = (board: Board, dir: string): Board => {
    let newScore = score;
    let newBoard = board.map(row => {
      let newRow = row.filter(filterFunc);
      if (dir === 'r') {
        for (let i = newRow.length - 1; i > 0; i--) {
          if (newRow[i].value === newRow[i - 1].value) {
            newScore += newRow[i].value;
            newRow[i] = { value: newRow[i].value * 2, moveDir: 'left', moveNum: (i - (i - 1)) * GRID_WIDTH };
            newRow[i - 1] = { value: 0, moveDir: 'left', moveNum: ((i - 1) - i) * GRID_WIDTH };
            if (newRow[i].value > maxNumber) setMaxNumber(newRow[i].value);
          }
        }
      } else {
        for (let i = 0; i < newRow.length - 1; i++) {
          if (newRow[i].value === newRow[i + 1].value) {
            newScore += newRow[i].value;
            newRow[i] = { value: newRow[i].value * 2, moveDir: 'right', moveNum: ((i + 1) - i) * GRID_WIDTH };
            newRow[i + 1] = { value: 0, moveDir: 'right', moveNum: ((i + 1) - (i + 1)) * GRID_WIDTH };
            if (newRow[i].value > maxNumber) setMaxNumber(newRow[i].value);
          }
        }
      }
      newRow = newRow.filter(val => val.value !== 0);
      while (newRow.length < GRID_SIZE) {
        if (dir === 'r') newRow.unshift({ value: 0 });
        else newRow.push({ value: 0 });
      }
      setScore(newScore);
      return newRow;
    });

    return newBoard;
  };

  const moveUpDown = (board: Board, dir: string): Board => {
    let newScore = score;
    let newBoard: Board = [];
    for (let col = 0; col < GRID_SIZE; col++) {
      let newCol = board.map(row => row[col]).filter(filterFunc);
      if (dir === 'd') {
        for (let i = newCol.length - 1; i > 0; i--) {
          if (newCol[i].value === newCol[i - 1].value) {
            newScore += newCol[i].value;
            newCol[i] = { value: newCol[i].value * 2, moveDir: 'up', moveNum: (i - (i - 1)) * GRID_WIDTH };
            newCol[i - 1] = { value: 0, moveDir: 'up', moveNum: ((i - 1) - i) * GRID_WIDTH };
            if (newCol[i].value > maxNumber) setMaxNumber(newCol[i].value);
          }
        }
      } else {
        for (let i = 0; i < newCol.length - 1; i++) {
          if (newCol[i].value === newCol[i + 1].value) {
            newScore += newCol[i].value;
            newCol[i] = { value: newCol[i].value * 2, moveDir: 'down', moveNum: ((i + 1) - i) * GRID_WIDTH };
            newCol[i + 1] = { value: 0, moveDir: 'down', moveNum: ((i + 1) - (i + 1)) * GRID_WIDTH };
            if (newCol[i].value > maxNumber) setMaxNumber(newCol[i].value);
          }
        }
      }
      newCol = newCol.filter(val => val.value !== 0);
      while (newCol.length < GRID_SIZE) {
        if (dir === 'd') newCol.unshift({ value: 0 });
        else newCol.push({ value: 0 });
      }
      for (let row = 0; row < GRID_SIZE; row++) {
        if (!newBoard[row]) {
          newBoard[row] = [];
        }
        newBoard[row][col] = newCol[row];
      }
    }
    return newBoard;
  };

  const move = (direction: Direction) => {
    let newBoard: Board = [...board];
    let moved = false;
    switch (direction) {
      case 'right':
        newBoard = moveLeftRight(board, 'r');
        break;
      case 'left':
        newBoard = moveLeftRight(board, 'l');
        break;
      case 'up':
        newBoard = moveUpDown(board, 'u');
        break;
      case 'down':
        newBoard = moveUpDown(board, 'd');
        break;
      default:
        break;
    }
    moved = !board.every((row, rowIndex) => row.every((cell, colIndex) => cell.value === newBoard[rowIndex][colIndex].value));
    if (moved) {
      newBoard = addRandomTile(newBoard);
    }
    setBoard(newBoard);
  };

  return (
    <div className="game2048" ref={parent}>
      <div>ToDo：增加动画</div>
      <div className="score">Score: {score}</div>
      {maxNumber === 2048 && <div className="win">You win!</div>}
      <BoardComp board={board} />
    </div>
  );
};

export default Game;