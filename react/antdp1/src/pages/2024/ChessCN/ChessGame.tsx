import React, { useState, useEffect } from 'react';
import { ChessBoard } from './ChessBoard';
import { Timer } from './ChessTimer';
import { GameState, Position } from './chessType';
import { initializeBoard, isValidMove, makeMove, isCheck, isCheckmate } from './rules';
import "./chess.css"
const getNameByColor = (color: string) => {
  return color === 'red' ? '红方' : '黑方';
}
const ChessGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    board: initializeBoard(),
    currentPlayer: 'red',
    selectedPiece: null,
    check: false,
    gameOver: false,
    winner: null,
  });

  const [totalTime, setTotalTime] = useState<number>(20 * 60);
  const [moveTime, setMoveTime] = useState<number>(120);

  useEffect(() => {
    const timer = setInterval(() => {
      setTotalTime((prevTime) => {
        if (prevTime <= 0 || gameState.gameOver) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });

      setMoveTime((prevTime) => {
        if (prevTime <= 0) {
          handleTimeOut();
          return 120;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.gameOver]);

  const handleTimeOut = () => {
    setGameState((prevState) => ({
      ...prevState,
      gameOver: true,
      winner: prevState.currentPlayer === 'red' ? 'black' : 'red',
    }));
  };

  const handlePieceClick = (p: Position) => {
    if (gameState.gameOver) return;

    const piece = gameState.board[p[0]][p[1]];

    if (piece && piece.color === gameState.currentPlayer) {
      setGameState({ ...gameState, selectedPiece: p });
    } else if (gameState.selectedPiece) {
      if (isValidMove(gameState.board, gameState.selectedPiece, p)) {
        const newBoard = makeMove(gameState.board, gameState.selectedPiece, p);
        const nextPlayer = gameState.currentPlayer === 'red' ? 'black' : 'red';
        const check = isCheck(newBoard, nextPlayer);
        const checkmate = isCheckmate(newBoard, nextPlayer);

        setGameState({
          board: newBoard,
          currentPlayer: nextPlayer,
          selectedPiece: null,
          check: check,
          gameOver: checkmate,
          winner: checkmate ? gameState.currentPlayer : null,
        });

        setMoveTime(120);
      }
    }
  };
  
  return (
    <div className="chess-game">
      <ChessBoard board={gameState.board} onPieceClick={handlePieceClick} />
      <div className="game-info">
        <Timer label="Total Time" time={totalTime} />
        <Timer label="Move Time" time={moveTime} />
        <div>请 {getNameByColor(gameState.currentPlayer)} 走棋</div>
        {gameState.check && <div className='check'>将军!</div>}
        {gameState.gameOver && <div>Game Over! Winner: {getNameByColor(gameState.winner!)}</div>}
      </div>
    </div>
  );
};

export default ChessGame;