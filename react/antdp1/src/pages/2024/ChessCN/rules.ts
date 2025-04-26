import { Piece, Position, PieceColor } from './chessType';

export function initializeBoard(): (Piece | null)[][] {
  const board: (Piece | null)[][] = Array(10).fill(null).map(() => Array(9).fill(null));

  // 初始化红方棋子
  board[0][0] = board[0][8] = { type: 'chariot', color: 'red' };
  board[0][1] = board[0][7] = { type: 'horse', color: 'red' };
  board[0][2] = board[0][6] = { type: 'elephant', color: 'red' };
  board[0][3] = board[0][5] = { type: 'advisor', color: 'red' };
  board[0][4] = { type: 'general', color: 'red' };
  board[2][1] = board[2][7] = { type: 'cannon', color: 'red' };
  board[3][0] = board[3][2] = board[3][4] = board[3][6] = board[3][8] = { type: 'soldier', color: 'red' };

  // 初始化黑方棋子
  board[9][0] = board[9][8] = { type: 'chariot', color: 'black' };
  board[9][1] = board[9][7] = { type: 'horse', color: 'black' };
  board[9][2] = board[9][6] = { type: 'elephant', color: 'black' };
  board[9][3] = board[9][5] = { type: 'advisor', color: 'black' };
  board[9][4] = { type: 'general', color: 'black' };
  board[7][1] = board[7][7] = { type: 'cannon', color: 'black' };
  board[6][0] = board[6][2] = board[6][4] = board[6][6] = board[6][8] = { type: 'soldier', color: 'black' };

  return board;
}

export function isValidMove(board: (Piece | null)[][], from: Position, to: Position): boolean {
  const piece = board[from[0]][from[1]];
  if (!piece) return false;

  // 检查目标位置是否为同色棋子
  const targetPiece = board[to[0]][to[1]];
  if (targetPiece && targetPiece.color === piece.color) return false;

  switch (piece.type) {
    case 'general':
      return isValidGeneralMove(board, from, to);
    case 'advisor':
      return isValidAdvisorMove(board, from, to);
    case 'elephant':
      return isValidElephantMove(board, from, to);
    case 'horse':
      return isValidHorseMove(board, from, to);
    case 'chariot':
      return isValidChariotMove(board, from, to);
    case 'cannon':
      return isValidCannonMove(board, from, to);
    case 'soldier':
      return isValidSoldierMove(board, from, to);
    default:
      return false;
  }
}

// 执行移动
export function makeMove(board: (Piece | null)[][], from: Position, to: Position): (Piece | null)[][] {
  const newBoard = board.map(row => [...row]);
  newBoard[to[0]][to[1]] = newBoard[from[0]][from[1]];
  newBoard[from[0]][from[1]] = null;
  return newBoard;
}

// 检查是否将军
export function isCheck(board: (Piece | null)[][], player: PieceColor): boolean {
  const generalPosition = findGeneral(board, player);
  if (!generalPosition) return false;

  const oppositeColor = player === 'red' ? 'black' : 'red';
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 9; j++) {
      const piece = board[i][j];
      if (piece && piece.color === oppositeColor) {
        if (isValidMove(board, [i, j], generalPosition)) {
          return true;
        }
      }
    }
  }
  return false;
}

// 检查是否将死
export function isCheckmate(board: (Piece | null)[][], player: PieceColor): boolean {
  if (!isCheck(board, player)) return false;

  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 9; j++) {
      const piece = board[i][j];
      if (piece && piece.color === player) {
        for (let x = 0; x < 10; x++) {
          for (let y = 0; y < 9; y++) {
            if (isValidMove(board, [i, j], [x, y])) {
              const newBoard = makeMove(board, [i, j], [x, y]);
              if (!isCheck(newBoard, player)) {
                return false;
              }
            }
          }
        }
      }
    }
  }
  return true;
}

// 辅助函数：查找将/帅的位置
function findGeneral(board: (Piece | null)[][], color: PieceColor): Position | null {
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 9; j++) {
      const piece = board[i][j];
      if (piece && piece.type === 'general' && piece.color === color) {
        return [i, j];
      }
    }
  }
  return null;
}

// 辅助函数：检查位置是否在九宫格内
function isInsidePalace(pos: Position, color: PieceColor): boolean {
  if (color === 'red') {
    return pos[0] >= 0 && pos[0] <= 2 && pos[1] >= 3 && pos[1] <= 5;
  } else {
    return pos[0] >= 7 && pos[0] <= 9 && pos[1] >= 3 && pos[1] <= 5;
  }
}

// 将/帅的移动规则
function isValidGeneralMove(board: (Piece | null)[][], from: Position, to: Position): boolean {
  const piece = board[from[0]][from[1]];
  if (!piece) return false;

  if (!isInsidePalace(to, piece.color)) return false;

  const dx = Math.abs(to[0] - from[0]);
  const dy = Math.abs(to[1] - from[1]);

  return (dx + dy === 1);
}

// 士/仕的移动规则
function isValidAdvisorMove(board: (Piece | null)[][], from: Position, to: Position): boolean {
  const piece = board[from[0]][from[1]];
  if (!piece) return false;

  if (!isInsidePalace(to, piece.color)) return false;

  const dx = Math.abs(to[0] - from[0]);
  const dy = Math.abs(to[1] - from[1]);

  return (dx === 1 && dy === 1);
}

// 象/相的移动规则
function isValidElephantMove(board: (Piece | null)[][], from: Position, to: Position): boolean {
  const piece = board[from[0]][from[1]];
  if (!piece) return false;

  if ((piece.color === 'red' && to[0] > 4) || (piece.color === 'black' && to[0] < 5)) return false;

  const dx = Math.abs(to[0] - from[0]);
  const dy = Math.abs(to[1] - from[1]);

  if (dx !== 2 || dy !== 2) return false;

  const middleX = (from[0] + to[0]) / 2;
  const middleY = (from[1] + to[1]) / 2;

  return board[middleX][middleY] === null; // 检查是否蹩象腿
}

// 马的移动规则
function isValidHorseMove(board: (Piece | null)[][], from: Position, to: Position): boolean {
  const dx = Math.abs(to[0] - from[0]);
  const dy = Math.abs(to[1] - from[1]);

  if (!((dx === 2 && dy === 1) || (dx === 1 && dy === 2))) return false;

  // 检查是否蹩马腿
  if (dx === 2) {
    const middleX = (from[0] + to[0]) / 2;
    return board[middleX][from[1]] === null;
  } else {
    const middleY = (from[1] + to[1]) / 2;
    return board[from[0]][middleY] === null;
  }
}

// 车的移动规则
function isValidChariotMove(board: (Piece | null)[][], from: Position, to: Position): boolean {
  if (from[0] !== to[0] && from[1] !== to[1]) return false;

  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const step = Math.max(Math.abs(dx), Math.abs(dy));

  for (let i = 1; i < step; i++) {
    const x = from[0] + Math.sign(dx) * i;
    const y = from[1] + Math.sign(dy) * i;
    if (board[x][y] !== null) return false;
  }

  return true;
}

// 炮的移动规则
function isValidCannonMove(board: (Piece | null)[][], from: Position, to: Position): boolean {
  if (from[0] !== to[0] && from[1] !== to[1]) return false;

  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const step = Math.max(Math.abs(dx), Math.abs(dy));

  let count = 0;
  for (let i = 1; i < step; i++) {
    const x = from[0] + Math.sign(dx) * i;
    const y = from[1] + Math.sign(dy) * i;
    if (board[x][y] !== null) count++;
  }

  if (board[to[0]][to[1]] === null) {
    return count === 0;
  } else {
    return count === 1;
  }
}

// 兵/卒的移动规则
function isValidSoldierMove(board: (Piece | null)[][], from: Position, to: Position): boolean {
  const piece = board[from[0]][from[1]];
  if (!piece) return false;

  const dx = to[0] - from[0];
  const dy = to[1] - from[1];

  if (piece.color === 'red') {
    if (from[0] < 5) { // 未过河
      return dx === 1 && dy === 0;
    } else { // 已过河
      return (dx === 1 && dy === 0) || (dx === 0 && Math.abs(dy) === 1);
    }
  } else { // black
    if (from[0] > 4) { // 未过河
      return dx === -1 && dy === 0;
    } else { // 已过河
      return (dx === -1 && dy === 0) || (dx === 0 && Math.abs(dy) === 1);
    }
  }
}