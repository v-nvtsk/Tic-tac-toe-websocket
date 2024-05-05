import { useEffect, useState } from "react";

// Create a WebSocket connection
const { hostname } = window.location;

declare let SOCKET_PROTOCOL: string;
if (!SOCKET_PROTOCOL) SOCKET_PROTOCOL = "ws";
declare let SOCKET_PORT: string;
if (!SOCKET_PORT) SOCKET_PORT = "8080";

const url = `${SOCKET_PROTOCOL}://${hostname}:${SOCKET_PORT}`;
console.log("url: ", url);
const socket = new WebSocket(url);

const keyGen = (): string => new Date().getTime() + String(Math.floor(Math.random() * 100));

function createMessageEl(message: string, className: string | undefined) {
  return (
    <p key={keyGen()} className={className || "received"}>
      {message}
    </p>
  );
}

export function App() {
  const [player, setPlayer] = useState({
    id: "",
    status: "S",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<React.JSX.Element[]>([]);
  const [fieldData, setFieldData] = useState<number[][]>([
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]);

  const [availableRoles, setAvailableRoles] = useState<string[]>(["S", "X", "O"]);
  const [isGameOver, setIsGameOver] = useState(false);

  // Listen for the 'open' event to ensure the connection is established
  useEffect(() => {
    // Listen for the 'open' event
    socket.addEventListener("open", () => {
      setIsLoading(false);
    });
  }, []);
  // Listen for errors
  socket.addEventListener("error", (error) => {
    // eslint-disable-next-line no-console
    console.error("WebSocket error:", error);
  });

  // Listen for messages from the server
  socket.onmessage = (event: any) => {
    try {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "id":
          setPlayer({ ...player, id: data.id });
          setMessages([...messages, createMessageEl(`Your Id is ${data.id}`, "info")]);
          break;
        case "message":
          setMessages([
            ...messages,
            createMessageEl(
              `${data.payload.authorId}: ${data.payload.text}`,
              data.payload.authorId !== player.id ? "received" : "my",
            ),
          ]);

          break;
        case "update field":
          setIsGameOver(false);
          setFieldData(data.payload.field);
          break;
        case "status changed":
          setPlayer({ ...player, status: data.payload.status });
          break;
        case "players updated":
          setAvailableRoles(data.payload.available);
          break;
        case "game over":
          setIsGameOver(true);

          setMessages([...messages, createMessageEl(`Game over! ${data.payload.text}`, "info")]);
          break;
        default:
          break;
      }
    } catch (e) {
      createMessageEl(event.data, "error");
    }
  };

  const restartGame = () => {
    socket.send(JSON.stringify({ type: "restart game" }));
  };

  const onSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    socket.send(JSON.stringify({ type: "change status", payload: { newStatus: event.target.value } }));
  };

  const onCellClick = async (event: React.MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLDivElement;
    const { row } = target.dataset;
    const { col } = target.dataset;
    await socket.send(
      JSON.stringify({
        type: "move",
        payload: {
          userId: player.id,
          status: player.status,
          row,
          col,
        },
      }),
    );
  };

  const onSendClick = async () => {
    const inputEl = document.querySelector("#message") as HTMLInputElement;
    if (inputEl.value) {
      const message = inputEl.value;
      await socket.send(JSON.stringify({ type: "message", payload: { text: message } }));
      inputEl.value = "";
    }
  };

  const cellContent = (value: number) => {
    switch (value) {
      case 1:
        return "X";
      case 5:
        return "O";
      default:
        return "";
    }
  };

  const renderCell = (row: number, col: number) => (
    <div className="cell" data-row={row} data-col={col} onClick={onCellClick}>
      {cellContent(fieldData[row][col])}
    </div>
  );

  const renderField = () =>
    Array.from({ length: 3 }).map((_, row) => (
      <div className="row">
        {renderCell(row, 0)}
        {renderCell(row, 1)}
        {renderCell(row, 2)}
      </div>
    ));

  return (
    <div className="wrapper">
      <h1>Tic-Tac-Toe</h1>

      <div id="field">{renderField()}</div>

      <form onSubmit={(e) => e.preventDefault()} className={isLoading ? "loading" : ""}>
        <fieldset>
          <select name="status" id="status" onChange={onSelectChange} defaultValue="S">
            <option value="X" disabled={!availableRoles.includes("X")}>
              Play as X
            </option>
            <option value="O" disabled={!availableRoles.includes("O")}>
              Play as O
            </option>
            <option value="S" disabled={!availableRoles.includes("S")}>
              Observe
            </option>
          </select>

          {player.status !== "S" && (
            <button type="button" className="restart" disabled={!isGameOver} onClick={restartGame}>
              New game
            </button>
          )}
        </fieldset>

        <fieldset>
          <input type="text" name="message" id="message" placeholder="message" />
          <button className="send-btn" onClick={onSendClick}>
            Send
          </button>
        </fieldset>
      </form>
      <div id="messages">{messages}</div>
    </div>
  );
}
