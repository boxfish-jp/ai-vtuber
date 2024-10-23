import type { Server as HTTPServer } from "node:http";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { Server } from "socket.io"; // Import the 'Socket' type
import endpoint from "../../endpoint.json";
import { type chatHistoryType, think } from "./LLM/llm";
import { AIAction, type Action } from "./action";

const app = new Hono();

app.post("/", async (c) => {
	const { data } = await c.req.json<{ data: chatHistoryType }>();
	console.log(data);
	const llmResponse = await think(data);
	console.log(llmResponse);
	const action: Action = new AIAction(llmResponse);
	await action.speak(sendMsg);
	sendMsg(" ");
	return c.text(llmResponse);
});

const sendMsg = (msg: string) => {
	ioServer.emit("message", msg);
};

const port = Number(endpoint.AI.port);
const hostname = endpoint.AI.ip;
console.log(`Server is running on http://${hostname}:${port}`);

const server = serve({
	fetch: app.fetch,
	port,
	hostname,
});

const ioServer = new Server(server as HTTPServer, {
	path: "/ws",
	serveClient: false,
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});

ioServer.on("error", (err) => {
	console.log(err);
});

ioServer.on("connect", (socket) => {
	console.log("Connection opened");
});
