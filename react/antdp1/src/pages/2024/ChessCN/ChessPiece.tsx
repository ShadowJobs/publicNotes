import React from 'react';
import { Piece } from './chessType';

interface ChessPieceProps {
  piece: Piece;
}
const pieceNames: { [key: string]: { [key: string]: string } } = {
  red: {
    general: '帥',
    advisor: '仕',
    elephant: '相',
    horse: '馬',
    chariot: '車',
    cannon: '炮',
    soldier: '兵',
  },
  black: {
    general: '將',
    advisor: '士',
    elephant: '象',
    horse: '馬',
    chariot: '車',
    cannon: '炮',
    soldier: '卒',
  },
};
const getPieceName = (piece: Piece) => {
  return pieceNames[piece.color][piece.type];
};
export const ChessPiece: React.FC<ChessPieceProps> = ({ piece }) => {
  return (
    <div className={`chess-piece ${piece.color}`}>
      {getPieceName(piece)}
    </div>
  );
};