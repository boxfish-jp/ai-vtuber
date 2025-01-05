import type { Server as HttpServer } from "node:http";
import { serve } from "@hono/node-server";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { Server } from "socket.io";
import type { a } from "vitest/dist/chunks/suite.B2jumIFP.js";
import { z } from "zod";
import endpointJson from "../../../endpoint.json";
import type { controllerType } from "../controller/controller.js";

const socketServerChatSchema = z.object({
	who: z.enum(["ai", "fuguo", "viewer", "announce"]),
	chatText: z.string(),
	unixTime: z.number(),
	point: z.boolean(),
});

const socketServerTalkToAiSchema = z.object({
	unixTime: z.string(),
	needScreenshot: z.boolean(),
});

let addNewChat: addNewChat = (receivedMessage: {
	unixTime: number;
	who: "ai" | "fuguo" | "viewer" | "announce";
	chatText: string;
	point: boolean;
}) => {
	console.log(receivedMessage);
};

const app = new Hono();
const appChatPost = app.post(
	"/chat",
	zValidator("json", socketServerChatSchema),
	(c) => {
		const data = c.req.valid("json");
		addNewChat(data);
		return c.text("ok");
	},
);

export type appChatPostType = typeof appChatPost;

const server = serve(
	{
		fetch: app.fetch,
		hostname: endpointJson.ai_vtuber.address,
		port: Number(endpointJson.ai_vtuber.port),
	},
	(info) => {
		console.log(`server is running on  http://${info.address}:${info.port}`);
	},
);

const ioServer = new Server(server as HttpServer, {
	path: "/ws",
	serveClient: false,
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});

export const createServer = (
	addChat: controllerType["addChat"],
	speakStateChange: controllerType["speakStateChange"],
	talkToAi: controllerType["talkToAi"],
) => {
	addNewChat = (receivedMessage: {
		unixTime: number;
		who: "ai" | "fuguo" | "viewer" | "announce";
		chatText: string;
		point: boolean;
	}) => {
		addChat(
			receivedMessage.unixTime,
			receivedMessage.who,
			receivedMessage.chatText,
			receivedMessage.point,
		);
		ioServer.emit("chat", JSON.stringify(receivedMessage));
	};
	ioServer.on("connection", (socket) => {
		socket.on("chat", (msg: string) => {
			const receivedMessage = socketServerChatSchema.parse(JSON.parse(msg));
			addNewChat(receivedMessage);
		});

		socket.on("speak", (msg: string): void => {
			speakStateChange(msg === "true");
		});

		socket.on("start", (msg: string): void => {
			const talkToContent = socketServerTalkToAiSchema.parse(JSON.parse(msg));
			console.log("receivedMessage");
			talkToAi(Number(talkToContent.unixTime), talkToContent.needScreenshot);
		});
	});
};
