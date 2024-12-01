import type { Server as HTTPServer } from "node:http";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { Server } from "socket.io"; // Import the 'Socket' type
import endpoint from "../../endpoint.json";
import { type chatHistoryType, chat } from "./LLM/chat";
import { AIAction, type Action } from "./action";
import { beginTalk } from "./LLM/speakTo";
import { fuguoState, type fuguoStateDataType } from "./LLM/state/fuguo";
import { trigger } from "./trigger";

const app = new Hono();
trigger();

app.post("/", async (c) => {
	const { data } = await c.req.json<{ data: chatHistoryType }>();
	const { imageUrl } = await c.req.json<{ imageUrl: string | undefined }>();
	console.log(data);
	const llmResponse = await chat(data, imageUrl);
	console.log(llmResponse);
	const action: Action = new AIAction(llmResponse);
	await action.speak(sendMsg);
	sendMsg(" ");
	return c.text(llmResponse);
});

app.post("/fuguo/", async (c) => {
	const { data } = await c.req.json<{ data: fuguoStateDataType }>();
	fuguoState.talking = data.talking;
	return c.text("ok");
});

app.post("/beginTalk/", async (c) => {
	const llmResponse = await beginTalk();
	console.log(llmResponse);
	const action: Action = new AIAction(llmResponse);
	await action.speak(sendMsg);
	sendMsg(" ");
	return c.text(llmResponse);
});

export const sendMsg = (msg: string) => {
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
