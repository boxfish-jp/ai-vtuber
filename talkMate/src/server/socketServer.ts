import type { Server as HttpServer } from "node:http";
import type { ServerType } from "@hono/node-server";
import type { DefaultEventsMap } from "node_modules/socket.io/dist/typed-events";
import { Server } from "socket.io";
import { createChat } from "../message/opeMess";
import { sendFuguoAPI } from "./sendAPI";

interface SocketServerType {
	broadcast: (message: string) => void;
}

class SocketIoServer implements SocketServerType {
	private io: Server<
		DefaultEventsMap,
		DefaultEventsMap,
		DefaultEventsMap,
		unknown
	>;

	constructor(server: ServerType) {
		this.io = new Server(server as HttpServer, {
			path: "/socket",
			serveClient: false,
			cors: {
				origin: "*",
				methods: ["GET", "POST"],
			},
		});

		this.io.on("connection", (socket) => {
			socket.on("result", (msg) => {
				console.log(`fuguo: ${msg}`);
				createChat("fuguo", msg);
			});

			socket.on("SPEECH", (msg) => {
				sendFuguoAPI(msg === "START");
			});
		});
		console.log("init");
	}

	broadcast(message: string): void {
		if (!this.io) {
			console.log("socket server is not initialized");
			return;
		}
		this.io.emit("message", message);
	}
}

let socketServer: SocketServerType | undefined = undefined;

export const initSocketServer = (serve: ServerType): void => {
	socketServer = new SocketIoServer(serve);
};

export const getSocketServer = (): SocketServerType | undefined => {
	return socketServer;
};

export const broadcast = (message: string): void => {
	const socketServer = getSocketServer();
	if (!socketServer) {
		console.log("socket server is not initialized");
		return;
	}
	socketServer.broadcast(message);
};
