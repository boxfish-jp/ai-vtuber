import { type Socket, io } from "socket.io-client";
import endpointJson from "../../../endpoint.json";

export interface socketServerChatType {
	who: "ai" | "fuguo" | "viewer" | "announce";
	chatText: string;
	unixTime: number;
	point: boolean;
}

export interface SocketControlerType {
	watchChat(callback: (newChat: socketServerChatType) => void): void;
	sendEvent(eventName: string, content: string): void;
}

export class SocketControler implements SocketControlerType {
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

	watchChat(callback: (newChat: socketServerChatType) => void): void {
		this._socket.on("chat", (event: string) => {
			const chat = JSON.parse(event) as socketServerChatType;
			console.log(chat);
			callback(chat);
		});
	}

	sendEvent(eventName: string, content: string): void {
		this._socket.emit(eventName, content);
	}
}

const getWsEndpoint = (): string => {
	return `http://${endpointJson.ai_vtuber.address}:${endpointJson.ai_vtuber.port}`;
};
