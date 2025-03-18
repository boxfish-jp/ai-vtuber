import { type Socket, io } from "socket.io-client";
import endpointJson from "../../../endpoint.json";

export interface socketServerChatType {
	who: "ai" | "fuguo" | "viewer" | "announce";
	content: string;
	unixTime: number;
	point: boolean;
}

export class SocketControler {
	private _socket: Socket;
	private static _instance: SocketControler;

	private constructor() {
		const wsEndpoint = getWsEndpoint();
		if (!wsEndpoint) {
			throw new Error("WS_URL is not set");
		}
		this._socket = io(wsEndpoint, { path: "/ws" });
		this._socket.on("connect", () => {
			console.log("connect");
		});
	}

	static instance() {
		if (!SocketControler._instance) {
			SocketControler._instance = new SocketControler();
		}
		return SocketControler._instance;
	}

	watchChat(callback: (newChat: socketServerChatType) => void) {
		const func = (event: string) => {
			console.log(event);
			const chat = JSON.parse(event) as socketServerChatType;
			console.log(chat);
			callback(chat);
		};
		this._socket.on("chat", func);
		return () => {
			this._socket.off("chat", func);
		};
	}

	sendEvent(eventName: string, content: string): void {
		this._socket.emit(eventName, content);
	}
}

const getWsEndpoint = (): string => {
	return `http://${endpointJson.ai_vtuber.address}:${endpointJson.ai_vtuber.port}`;
};
