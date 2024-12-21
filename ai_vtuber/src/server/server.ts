import type { Server as HttpServer } from "node:http";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { Server } from "socket.io";
import { z } from "zod";
import type { controllerType } from "../controller/controller.js";

const socketServerChatSchema = z.object({
	who: z.enum(["ai", "fuguo", "viewer", "announce"]),
	chatText: z.string(),
	unixTime: z.number(),
	point: z.boolean(),
});

const socketServerTalkToAiSchema = z.object({
	unixTime: z.number(),
	needScreenshot: z.boolean(),
});

export const createServer = (
	addChat: controllerType["addChat"],
	speakStateChange: controllerType["speakStateChange"],
	talkToAi: controllerType["talkToAi"],
) => {
	ioServer.on("message", (socket) => {
		socket.on("chat", (msg: string) => {
			const receivedMessage = socketServerChatSchema.parse(JSON.parse(msg));
			addChat(
				receivedMessage.who,
				receivedMessage.chatText,
				receivedMessage.point,
			);
			socket.emit(JSON.stringify(receivedMessage));
		});

		socket.on("speak", (msg: string): void => {
			speakStateChange(msg === "true");
		});

		socket.on("talkToAi", (msg: string): void => {
			const talkToContent = socketServerTalkToAiSchema.parse(JSON.parse(msg));
			talkToAi(talkToContent.unixTime, talkToContent.needScreenshot);
		});
	});
};

const app = new Hono();

const server = serve(
	{
		fetch: app.fetch,
		hostname: "localhost",
		port: Number("3000"),
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
