import { type Socket, io } from "socket.io-client";
import endpointJson from "../../../endpoint.json";

export interface socketServerChatType {
	who: "ai" | "fuguo" | "viewer" | "announce";
	chatText: string;
	unixTime: number;
	point: boolean;
}

export const watchChat = (
	callback: (newChats: socketServerChatType[]) => void,
) => {
	const socket = getSocketControler();
	socket.watchChat(callback);
};

export const sendEvent = (eventName: string, content: string) => {
	const socket = getSocketControler();
	socket.sendEvent(eventName, content);
};

export interface SocketControlerType {
	watchChat(callback: (newChats: socketServerChatType[]) => void): void;
	sendEvent(eventName: string, content: string): void;
}

class SocketControler implements SocketControlerType {
	private _chats: socketServerChatType[] = [];
	private _socket: Socket;

	constructor() {
		const wsEndpoint = getWsEndpoint();
		if (!wsEndpoint) {
			throw new Error("WS_URL is not set");
		}
		this._socket = io(wsEndpoint, { path: "/socket" });
	}

	get chats(): socketServerChatType[] {
		return this._chats;
	}

	watchChat(callback: (newChats: socketServerChatType[]) => void): void {
		this._socket.on("message", (event: string) => {
			const chat = JSON.parse(event) as socketServerChatType[];
			this.pushChats(chat);
			console.log(chat);
			callback(this.chats);
		});
	}

	sendEvent(eventName: string, content: string): void {
		this._socket.emit(eventName, content);
	}

	pushChats(chats: socketServerChatType[]) {
		this._chats = [...this._chats, ...chats];

		return this._chats;
	}
}

let socketControler: SocketControlerType | null = null;

const getSocketControler = () => {
	if (!socketControler) {
		socketControler = new SocketControler();
	}

	return socketControler;
};

const getWsEndpoint = (): string => {
	return `http://${endpointJson.AI.ip}:${endpointJson.AI.port}`;
};
