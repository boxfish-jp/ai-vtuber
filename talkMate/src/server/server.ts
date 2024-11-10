import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { talkMateEndpoint } from "../endpoint";
import { createChat } from "../message/opeMess";
import { sendAPI } from "./sendAPI";
import { initSocketServer } from "./socketServer";

export const startServer = () => {
	const app = new Hono();

	app.get("/", async (c) => {
		const chatId = Number(c.req.query("id"));
		const needScreenshot = Boolean(c.req.query("screenshot"));
		if (!chatId) {
			return c.text("chatId is required", 400);
		}
		const response = await sendAPI(chatId, needScreenshot);
		await createChat("ai", response);
		return c.text(response);
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

	const server = serve({
		fetch: app.fetch,
		hostname: talkMateEndpoint.ip,
		port: Number(talkMateEndpoint.port),
	});

	initSocketServer(server);
};
