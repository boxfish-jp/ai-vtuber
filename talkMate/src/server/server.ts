import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { talkMateEndpoint } from "../endpoint";
import { createChat, getRecentChatHistory } from "../message/opeMess";
import { sendAPI } from "./sendAPI";
import { initSocketServer } from "./socketServer";

export const startServer = () => {
	const app = new Hono();

	app.get("/", async (c) => {
		const chatId = Number(c.req.query("id"));
		const needScreenshot = c.req.query("screenshot") === "true";
		if (!chatId) {
			return c.text("chatId is required", 400);
		}
		const response = await sendAPI(chatId, needScreenshot);
		await createChat("ai", response);
		return c.text(response);
	});

	app.get("/message/", async (c) => {
		console.log("request to /message/");
		const len = c.req.query("len");
		const length = Number(len);
		if (!len || Number.isNaN(length)) {
			return c.text("len is required", 400);
		}
		const messages = await getRecentChatHistory(length);
		return c.json(messages);
	});

	app.post("/message/", async (c) => {
		const body = (await c.req.json()) as { who: string; message: string };
		if (
			!body.who ||
			!body.message ||
			(body.who !== "ai" && body.who !== "fuguo" && body.who !== "viewer")
		) {
			return c.text("bad param", 400);
		}
		await createChat(body.who, body.message);
		return c.text("ok");
	});

	app.use(
		"*",
		serveStatic({
			root: "public",
			onNotFound: (path, c) => {
				console.log(`${path} not found`);
			},
		}),
	);

	console.log(
		`webPage is running on  http://${talkMateEndpoint.ip}:${Number(
			talkMateEndpoint.port,
		)}/index.html`,
	);
	console.log(
		`webPage is running on  http://localhost:${Number(
			talkMateEndpoint.port,
		)}/index.html`,
	);

	const mainServer = serve({
		fetch: app.fetch,
		hostname: talkMateEndpoint.ip,
		port: Number(talkMateEndpoint.port),
	});

	serve({
		fetch: app.fetch,
		port: Number(talkMateEndpoint.port),
	});

	initSocketServer(mainServer);
};
