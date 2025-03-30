import { type Socket, io } from "socket.io-client";
import endpointJson from "../../../endpoint.json";

export interface socketServerChatType {
	who: "ai" | "fuguo" | "viewer" | "announce";
	content: string;
	unixTime: number;
	point: boolean;
}

export interface WorkTheme {
	main: string;
	sub: string[];
}

export const watchChat = (
	callback: (newChat: socketServerChatType) => void,
): void => {
	const socket = getSocketControler();
	socket.watchChat(callback);
};

interface SocketControlerType {
	watchChat(callback: (newChat: socketServerChatType) => void): void;
}

class SocketControler implements SocketControlerType {
	private _socket: Socket;

	constructor() {
		const wsEndpoint = getWsEndpoint();
		if (!wsEndpoint) {
			throw new Error("WS_URL is not set");
		}
		this._socket = io(wsEndpoint, { path: "/ws" });
		this._socket.on("connect", () => {
			console.log("connect");
		});
	}

	watchChat(callback: (newChat: socketServerChatType) => void) {
		const onChat = (event: string) => {
			console.log(event);
			const chat = JSON.parse(event) as socketServerChatType;
			console.log(chat);
			callback(chat);
		};

		this._socket.on("chat", onChat);

		return () => {
			this._socket.off("chat", onChat);
		};
	}

	watchWorkTheme(callback: (newWorkTheme: WorkTheme) => void) {
		const onWorkTheme = (event: string) => {
			const workTheme = JSON.parse(event) as WorkTheme;
			console.log(workTheme);
			callback(workTheme);
		};

		this._socket.on("work_theme", onWorkTheme);

		return () => {
			this._socket.off("work_theme", onWorkTheme);
		};
	}
}

let socketControler: SocketControler | undefined;

export const getSocketControler = (): SocketControler => {
	if (!socketControler) {
		socketControler = new SocketControler();
	}
	return socketControler;
};

const getWsEndpoint = (): string => {
	return `http://${endpointJson.ai_vtuber.address}:${endpointJson.ai_vtuber.port}`;
};
