export type Move = {
  userId: number;
  userType: "player" | "spectator";
  playerCmd: "x" | "o";
  position: [number, number];
};

export type Event = {
  userId: number;
  type: "message" | "move";
  payload: string | Move;
};
