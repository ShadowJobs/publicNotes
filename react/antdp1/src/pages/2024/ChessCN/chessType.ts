export type PieceType = 'general' | 'advisor' | 'elephant' | 'horse' | 'chariot' | 'cannon' | 'soldier';
export type PieceColor = 'red' | 'black';

export interface Piece {
  type: PieceType;
  color: PieceColor;
}

export type Position = [number, number];

export interface GameState {
  board: (Piece | null)[][];
  currentPlayer: PieceColor;
  selectedPiece: Position | null;
  check: boolean;
  gameOver: boolean;
  winner: PieceColor | null;
}