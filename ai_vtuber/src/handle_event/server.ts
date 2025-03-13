import type EventEmitter from "node:events";
import type { Server as HttpServer } from "node:http";
import { serve } from "@hono/node-server";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { Server } from "socket.io";
import { z } from "zod";
import endpointJson from "../../../endpoint.json";
import type { ChatEvent, InstructionEvent } from "./event.js";
import type { EventHandler } from "./event_handler.js";

const chatEventSchema = z.object({
	who: z.enum(["ai", "fuguo", "viewer", "info"]),
	content: z.string(),
	unixTime: z.number(),
	point: z.boolean(),
});

const instructionEventSchema = z.object({
	type: z.enum([
		"talk",
		"work_theme",
		"afk",
		"back",
		"grade",
		"reminder",
		"reset",
	]),
	unixTime: z.string(),
	needScreenshot: z.boolean(),
});

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

export const createServer = (eventHandler: EventEmitter<EventHandler>) => {
	const appChatPost = app.post(
		"/chat",
		zValidator("json", chatEventSchema),
		(c) => {
			const data: ChatEvent = c.req.valid("json");
			ioServer.emit(JSON.stringify(data));
			eventHandler.emit("onChat", data);
			return c.text("ok");
		},
	);

	ioServer.on("connection", (socket) => {
		socket.on("chat", (msg: string) => {
			const receivedMessage: ChatEvent = chatEventSchema.parse(JSON.parse(msg));
			ioServer.emit("chat", msg);
			console.log(msg);
			eventHandler.emit("onChat", receivedMessage);
		});

		socket.on("speak", (msg: string): void => {
			eventHandler.emit("onFuguoSound", msg === "true");
		});

		socket.on("instruction", (msg: string): void => {
			const receivedMessage = instructionEventSchema.parse(JSON.parse(msg));
			const unixTime =
				receivedMessage.unixTime === ""
					? undefined
					: Number(receivedMessage.unixTime);
			const instructionEvent: InstructionEvent = {
				type: receivedMessage.type,
				unixTime: unixTime,
				needScreenshot: receivedMessage.needScreenshot,
			};
			eventHandler.emit("onInstruction", instructionEvent);
		});
	});

	return appChatPost;
};
