import type { Server as HttpServer } from "node:http";
import { serve } from "@hono/node-server";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { Server } from "socket.io";
import { z } from "zod";
import endpointJson from "../../../endpoint.json";
import { LiveEvent } from "./event.js";

const chatEventSchema = z.object({
	who: z.enum(["ai", "fuguo", "viewer", "info"]),
	content: z.string(),
	unixTime: z.number(),
	point: z.boolean(),
});

const instructionEventSchema = z.object({
	type: z.enum(["talk", "work_theme", "afk", "back", "grade"]),
	unixTime: z.string(),
	needScreenshot: z.boolean(),
});

let eventListener = (event: LiveEvent) => {
	console.log(event);
};

const app = new Hono();
const appChatPost = app.post(
	"/chat",
	zValidator("json", chatEventSchema),
	(c) => {
		const data = c.req.valid("json");
		const newEvent = new LiveEvent(data, undefined, undefined);
		eventListener(newEvent);
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

export const eventServer = (
	onNewEvent: (event: LiveEvent) => Promise<void>,
) => {
	eventListener = onNewEvent;
	ioServer.on("connection", (socket) => {
		socket.on("chat", (msg: string) => {
			const receivedMessage = chatEventSchema.parse(JSON.parse(msg));
			const newEvent = new LiveEvent(receivedMessage, undefined, undefined);
			ioServer.emit("chat", JSON.stringify(receivedMessage));
			eventListener(newEvent);
		});

		socket.on("speak", (msg: string): void => {
			const newEvent = new LiveEvent(undefined, undefined, msg === "true");
			eventListener(newEvent);
		});

		socket.on("instruction", (msg: string): void => {
			console.log(msg);
			const receivedMessage = instructionEventSchema.parse(JSON.parse(msg));
			const instructionEvent = {
				type: receivedMessage.type,
				unixTime: Number(receivedMessage.unixTime),
				needScreenshot: receivedMessage.needScreenshot,
			};
			const newEvent = new LiveEvent(undefined, instructionEvent, undefined);
			eventListener(newEvent);
		});
	});
};
