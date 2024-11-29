import { talkMateEndpoint } from "@/endpoint";
import type { DefaultEventsMap } from "node_modules/socket.io/dist/typed-events";
import { type Socket, io } from "socket.io-client";
import type { Chat } from ".prisma/client";

export interface SocketControlerType {
	watchChat(callback: (newChats: Chat[]) => void): void;
	sendEvent(eventName: string, content: string): void;
}

export class SocketControler implements SocketControlerType {
	private _chats: Chat[] = [];
	private _socket: Socket<DefaultEventsMap, DefaultEventsMap>;

	constructor() {
		const wsEndpoint = getWsEndpoint();
		if (!wsEndpoint) {
			throw new Error("WS_URL is not set");
		}
		this._socket = io(wsEndpoint, { path: "/socket" });
	}

	get chats(): Chat[] {
		return this._chats;
	}

	watchChat(callback: (newChats: Chat[]) => void): void {
		this._socket.on("message", (event: string) => {
			const chat = JSON.parse(event) as Chat[];
			this.pushChats(chat);
			console.log(chat);
			callback(this.chats);
		});
	}

	sendEvent(eventName: string, content: string): void {
		this._socket.emit(eventName, content);
	}

	pushChats(chats: Chat[]) {
		this._chats = [...this._chats, ...chats];

		return this._chats;
	}
}

const getWsEndpoint = (): string => {
	return `http://${talkMateEndpoint.ip}:${talkMateEndpoint.port}`;
};
