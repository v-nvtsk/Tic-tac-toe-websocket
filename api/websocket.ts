import { stderr, stdout } from "process";
import WebSocket from "ws";
import {
  Client,
  availableRoles,
  clients,
  getId,
  handlers,
  keepAlive,
  send,
  sendFieldState,
  sendToAll,
} from "./message-handler";
import { generateId } from "./utils/generateId";

function messageHandler(client: Client, data: Buffer) {
  const { ws } = client;
  const decodedString = data.toString("utf8");
  try {
    const event = JSON.parse(decodedString);
    switch (event.type) {
      case "getId":
        getId(client);
        break;
      case "move":
        handlers.move(client, event.payload);
        break;
      case "change status":
        handlers.changeStatus(client, event.payload);
        break;
      case "message":
        handlers.message(client, event.payload);
        break;
      case "restart game":
        handlers.restart();
        break;
      default:
    }
  } catch (e) {
    stdout.write(`Something wrong is going on: ${data.toString("utf8")}\n`);
  }

  if (data.toString() === "Hello, server!") {
    stdout.write("send handshake\n");
    ws.send("Hello client!");
  }
}

export function handleWS(ws: WebSocket) {
  ws.on("error", stderr.write);
  stdout.write(`WebSocket server started: ${ws.url}\n`);

  const id = generateId();
  const client: Client = {
    clientStatus: "S" as "S",
    id,
    name: "",
    ws,
  };
  clients.set(id, client);
  ws.on("message", messageHandler.bind(null, client));
  keepAlive(id, client);
  getId(client);
  sendFieldState(ws);
  send(ws, "players updated", { available: availableRoles() });
  sendToAll("message", { text: `User ${client.id} connected to the server`, authorId: "system" }, client.id);
}
