/* eslint-disable no-param-reassign */
import WebSocket from "ws";
import { fieldSlice } from "./store/fieldSlice";
import { store } from "./store/index";

export type ClientStatus = "X" | "O" | "S";

export type Client = {
  id: string;
  name: string;
  clientStatus: ClientStatus;
  ws: WebSocket;
};

export type Players = {
  X: string;
  O: string;
};

export const clients: Map<string, Client> = new Map();
export const players: Players = {
  X: "",
  O: "",
};

export function send(ws: WebSocket, type: MessageType, payload: any) {
  ws.send(JSON.stringify({ type, payload }));
}

function fieldStatePayload() {
  return {
    state: store.getState().field.isGameOver,
    winnerId: store.getState().field.winnerId,
    field: store.getState().field.gameField,
  };
}

export function sendFieldState(ws: WebSocket) {
  send(ws, "update field", fieldStatePayload());
}

export type MessageType = "update field" | "players updated" | "status changed" | "game over" | "message";

export function sendToAll(type: MessageType, payload: any, authorId?: string) {
  const payLoadStringified = JSON.stringify({ type, payload });
  clients.forEach((client: Client, id: string) => {
    if (!authorId || id !== authorId) client.ws.send(payLoadStringified);
  });
}
export const availableRoles = () => ["S", ...Object.keys(players).filter((el) => players[el as "X" | "O"] === "")];

function startNewGame() {
  store.dispatch(fieldSlice.actions.reset());
  sendToAll("update field", fieldStatePayload());
}

export function keepAlive(id: string, client: Client) {
  const interval = setInterval(() => {
    client.ws.ping();
    if (client.ws.readyState !== WebSocket.OPEN) {
      clearInterval(interval);
      clients.delete(id);
      if (players.X === id) players.X = "";
      if (players.O === id) players.O = "";
      sendToAll("players updated", { available: availableRoles() });
      sendToAll("message", { text: `User ${client.id} disconnected from the server`, authorId: "system" }, client.id);
    }
  }, 5000);
}

export function getId(client: Client) {
  client.ws.send(JSON.stringify({ type: "id", id: client.id }));
}

export const handlers = {
  move: (client: Client, payload: { userId: any; playerStatus: any; row: any; col: any }) => {
    if (client.clientStatus === "S" || store.getState().field.isGameOver) return;
    store.dispatch(
      fieldSlice.actions.setCell({
        userId: client.id,
        playerStatus: client.clientStatus,
        row: payload.row,
        col: payload.col,
      }),
    );
    sendToAll("update field", fieldStatePayload());
    const state = store.getState();
    if (state.field.isGameOver) {
      const resPayload =
        state.field.winnerId !== "0" ? { text: `Player ${state.field.winnerId} won!` } : { text: "Draw!" };
      sendToAll("game over", resPayload);
    }
  },
  changeStatus: (client: Client, payload: { newStatus: string }) => {
    if (Object.values(players).includes(client.id)) {
      players[client.clientStatus as "X" | "O"] = "";
    }

    const isNewStatusAvailable = players[payload.newStatus as "X" | "O"] === "";

    if (payload.newStatus !== "S" && isNewStatusAvailable) {
      players[payload.newStatus as "X" | "O"] = client.id;
      client.clientStatus = payload.newStatus as "X" | "O";
    } else {
      client.clientStatus = "S";
    }
    if (client.clientStatus === payload.newStatus) {
      sendToAll("players updated", {
        available: availableRoles(),
      });
      send(client.ws, "status changed", { status: client.clientStatus });
    }
  },
  restart: () => {
    startNewGame();
  },
  message: (client: Client, payload: any) => {
    sendToAll("message", { text: payload.text, authorId: client.id });
  },
};
