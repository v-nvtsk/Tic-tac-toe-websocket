/* eslint-disable no-param-reassign */
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export const X = 1;
export const O = 5;

export type FieldState = typeof initialState;
export type Players = {
  X: string;
  O: string;
};

const initialState = {
  gameField: [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ] as number[][],
  nextmove: "X",
  isGameOver: false,
  winnerId: "0",
  players: {
    X: "",
    O: "",
  } as Players,
};

export type GameAction = {
  userId: string;
  playerStatus: "X" | "O";
  row: number;
  col: number;
};

export const fieldSlice = createSlice({
  name: "field",
  initialState,
  reducers: {
    setField(state, action: PayloadAction<number[][]>) {
      state.gameField = [...action.payload];
    },
    setCell(state, action: PayloadAction<GameAction>) {
      if (state.isGameOver) return;
      const gameAction = action.payload;
      if (state.nextmove !== gameAction.playerStatus) return;
      if (state.gameField[gameAction.row][gameAction.col] !== 0) return;

      state.gameField[gameAction.row][gameAction.col] = gameAction.playerStatus === "X" ? X : O;
      state.nextmove = state.nextmove === "X" ? "O" : "X";

      const rowSums = [0, 0, 0];
      const colSums = [0, 0, 0];
      const diagSums = [0, 0, 0];
      const antiDiagSums = [0, 0, 0];

      for (let r = 0; r < 3; r += 1) {
        for (let c = 0; c < 3; c += 1) {
          rowSums[r] += state.gameField[r][c];
          colSums[r] += state.gameField[c][r];
          if (r === c) diagSums[0] += state.gameField[r][c];
          if (r === 2 - c) antiDiagSums[0] += state.gameField[r][c];
        }
      }
      if (
        rowSums.filter((x) => x === X * 3 || x === O * 3).length > 0 ||
        colSums.filter((x) => x === X * 3 || x === O * 3).length > 0 ||
        diagSums.filter((x) => x === X * 3 || x === O * 3).length > 0 ||
        antiDiagSums.filter((x) => x === X * 3 || x === O * 3).length > 0
      ) {
        state.isGameOver = true;
        state.winnerId = gameAction.userId;
        return;
      }

      if (state.gameField.flat().filter((x) => x === 0).length === 0) {
        state.isGameOver = true;
      }
    },
    reset() {
      return initialState;
    },
  },
});
