import type { Server as HttpServer } from "node:http";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { Server } from "socket.io";
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
	unixTime: z.number(),
	needScreenshot: z.boolean(),
});

export const createServer = (
	addChat: controllerType["addChat"],
	speakStateChange: controllerType["speakStateChange"],
	talkToAi: controllerType["talkToAi"],
) => {
	ioServer.on("connection", (socket) => {
		socket.on("chat", (msg: string) => {
			const receivedMessage = socketServerChatSchema.parse(JSON.parse(msg));
			addChat(
				receivedMessage.unixTime,
				receivedMessage.who,
				receivedMessage.chatText,
				receivedMessage.point,
			);
			socket.emit("chat", JSON.stringify(receivedMessage));
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
