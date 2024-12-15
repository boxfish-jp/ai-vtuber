import type { Server as HTTPServer } from "node:http";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { Server } from "socket.io";
import endpoint from "../../endpoint.json";
import { chat } from "./LLM/chat";
import type { chatHistoryType } from "./type/chatHistoryType";
import { AIAction, type Action } from "./action";
import { fuguoState } from "./LLM/state/fuguo";
import { trigger } from "./trigger";
import { aiState } from "./LLM/state/ai";
import { viewerState } from "./LLM/state/viewer";

const app = new Hono();
trigger();

app.post("/", async (c) => {
	if (aiState.talking) {
		return c.text("すでに発言中です。", 401);
	}
	aiState.talking = true;
	const { data } = await c.req.json<{ data: chatHistoryType }>();
	const { imageUrl } = await c.req.json<{ imageUrl: string | undefined }>();
	console.log(data);
	const llmResponse = await chat(data, imageUrl);
	console.log(llmResponse);
	const action: Action = new AIAction(llmResponse);
	await action.speak(sendMsg);
	sendMsg(" ");
	aiState.talking = false;
	return c.text(llmResponse);
});

app.post("/fuguo/", async (c) => {
	const talking = c.req.query("talking") === "true";
	fuguoState.talking = talking;
	return c.text("ok");
});

app.post("/viewer/", async (c) => {
	viewerState.setTalking();
	return c.text("ok");
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
