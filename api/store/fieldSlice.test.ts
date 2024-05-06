import { configureStore } from "@reduxjs/toolkit";
import { GameAction, O, X, fieldSlice } from "./fieldSlice.ts";

describe("field slice", () => {
  const steps = [
    {
      input: { userId: "1", playerStatus: "X", row: 0, col: 0 },
      result: [
        [X, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ],
    },
    {
      input: { userId: "2", playerStatus: "O", row: 1, col: 1 },
      result: [
        [X, 0, 0],
        [0, O, 0],
        [0, 0, 0],
      ],
    },
    {
      input: { userId: "1", playerStatus: "X", row: 2, col: 2 },
      result: [
        [X, 0, 0],
        [0, O, 0],
        [0, 0, X],
      ],
    },
    {
      input: { userId: "1", playerStatus: "X", row: 2, col: 0 },
      result: [
        [X, 0, 0],
        [0, O, 0],
        [0, 0, X],
      ],
    },
    {
      input: { userId: "2", playerStatus: "O", row: 2, col: 2 },
      result: [
        [X, 0, 0],
        [0, O, 0],
        [0, 0, X],
      ],
    },
    {
      input: { userId: "2", playerStatus: "O", row: 2, col: 1 },
      result: [
        [X, 0, 0],
        [0, O, 0],
        [0, O, X],
      ],
    },
    {
      input: { userId: "1", playerStatus: "X", row: 2, col: 0 },
      result: [
        [X, 0, 0],
        [0, O, 0],
        [X, O, X],
      ],
    },
    {
      input: { userId: "2", playerStatus: "O", row: 0, col: 1 },
      result: [
        [X, O, 0],
        [0, O, 0],
        [X, O, X],
      ],
    },
  ];

  describe("make steps", () => {
    const store = configureStore({
      reducer: {
        field: fieldSlice.reducer,
      },
    });
    steps.forEach((step) => {
      it(`set ${step.input.playerStatus} to [${step.input.row}, ${step.input.col}]`, () => {
        const input = step.input as GameAction;
        store.dispatch(fieldSlice.actions.setCell(input));
        expect(store.getState().field.gameField).toEqual(step.result);
      });
    });
  });

  describe("should stop game ...", () => {
    let store: any;

    beforeEach(() => {
      store = configureStore({
        reducer: {
          field: fieldSlice.reducer,
        },
      });
    });

    it("... if won", () => {
      const input = [
        [X, 0, 0],
        [0, O, 0],
        [X, O, 0],
      ];
      const action1: GameAction = { userId: "1", playerStatus: "X", row: 2, col: 2 };

      store.dispatch(fieldSlice.actions.setField(input));
      expect(store.getState().field.gameField).toEqual(input);
      store.dispatch(fieldSlice.actions.setCell(action1));

      const action2: GameAction = { userId: "2", playerStatus: "O", row: 0, col: 1 };
      const result = [
        [X, O, 0],
        [0, O, 0],
        [X, O, X],
      ];
      store.dispatch(fieldSlice.actions.setCell(action2));
      expect(store.getState().field.gameField).toEqual(result);

      expect(store.getState().field.isGameOver).toEqual(true);
      expect(store.getState().field.winnerId).toEqual("2");
    });

    it("... if no moves", () => {
      store.dispatch(fieldSlice.actions.reset());

      const input = [
        [X, X, O],
        [O, O, 0],
        [X, O, X],
      ];
      const action: GameAction = { userId: "1", playerStatus: "X", row: 1, col: 2 };
      const result = [
        [X, X, O],
        [O, O, X],
        [X, O, X],
      ];

      store.dispatch(fieldSlice.actions.setField(input));
      expect(store.getState().field.gameField).toEqual(input);

      store.dispatch(fieldSlice.actions.setCell(action));
      expect(store.getState().field.gameField).toEqual(result);

      expect(store.getState().field.isGameOver).toEqual(true);
      expect(store.getState().field.winnerId).toBe("0");
    });
  });
});
