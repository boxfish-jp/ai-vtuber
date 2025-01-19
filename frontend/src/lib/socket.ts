import { type Socket, io } from "socket.io-client";
import endpointJson from "../../../endpoint.json";

export interface socketServerChatType {
	who: "ai" | "fuguo" | "viewer" | "announce";
	content: string;
	unixTime: number;
	point: boolean;
}

export const watchChat = (
	callback: (newChat: socketServerChatType) => void,
): void => {
	const socket = getSocketControler();
	socket.watchChat(callback);
};

export const sendEvent = (eventName: string, content: string): void => {
	const socket = getSocketControler();
	socket.sendEvent(eventName, content);
};

interface SocketControlerType {
	watchChat(callback: (newChat: socketServerChatType) => void): void;
	sendEvent(eventName: string, content: string): void;
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

	watchChat(callback: (newChat: socketServerChatType) => void): void {
		this._socket.on("chat", (event: string) => {
			console.log(event);
			const chat = JSON.parse(event) as socketServerChatType;
			console.log(chat);
			callback(chat);
		});
	}

	sendEvent(eventName: string, content: string): void {
		this._socket.emit(eventName, content);
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
