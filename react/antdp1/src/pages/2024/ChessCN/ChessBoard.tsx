import React from 'react';
import { ChessPiece } from './ChessPiece';
import { Piece, Position } from './chessType';

interface ChessBoardProps {
  board: (Piece | null)[][];
  onPieceClick: (position: Position) => void;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({ board, onPieceClick }) => {
  return (
    <div className="chess-board">
      {board.map((row, rowIndex) => (
        row.map((piece, colIndex) => (
          <div key={`${rowIndex}-${colIndex}`} className='grid-cell'>
            <div className="horizontal-line"></div>
            <div className="vertical-line"></div>
            <div className={`board-cell ${rowIndex === 4 || rowIndex === 5 ? 'river' : ''}`}
              onClick={() => onPieceClick([rowIndex, colIndex])}
            >
              {piece && <ChessPiece piece={piece} />}
            </div>
          </div>
        ))
      ))}
    </div>
  );
};