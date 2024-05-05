import express from "express";
import { stdout } from "process";
import { WebSocketServer } from "ws";
import { handleWS } from "./websocket.ts";

const app = express();
app.use("/", express.static("public"));

const port = process.env.PORT || 5000;
app.listen(port);
stdout.write(`server is listening to port: ${port}\n`);
stdout.write(`http://localhost:${port}\n`);

const wss = new WebSocketServer({
  port: Number(process.env.SOCKET_PORT) || 8080,
  perMessageDeflate: {
    zlibDeflateOptions: {
      // See zlib defaults.
      chunkSize: 1024,
      memLevel: 7,
      level: 3,
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024,
    },
    // Other options settable:
    clientNoContextTakeover: true, // Defaults to negotiated value.
    serverNoContextTakeover: true, // Defaults to negotiated value.
    serverMaxWindowBits: 10, // Defaults to negotiated value.
    // Below options specified as default values.
    concurrencyLimit: 10, // Limits zlib concurrency for perf.
    threshold: 1024, // Size (in bytes) below which messages
    // should not be compressed if context takeover is disabled.
  },
});

wss.on("connection", handleWS);
