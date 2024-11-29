import { talkMateEndpoint } from "@/endpoint";
import type { DefaultEventsMap } from "node_modules/socket.io/dist/typed-events";
import { type Socket, io } from "socket.io-client";
import type { Chat } from ".prisma/client";

export class watchChatFromSocket {
	private _chats: Chat[] = [];
	private _socket: Socket<DefaultEventsMap, DefaultEventsMap>;

	constructor(Callback: (newChats: Chat[]) => void) {
		const wsEndpoint = getWsEndpoint();
		if (!wsEndpoint) {
			throw new Error("WS_URL is not set");
		}
		this._socket = io(wsEndpoint, { path: "/socket" });

		this._socket.on("message", (event: string) => {
			const chat = JSON.parse(event) as Chat[];
			this.pushChats(chat);
			console.log(chat);
			Callback(this.chats);
		});
	}

	get chats(): Chat[] {
		return this._chats;
	}

	pushChats(chats: Chat[]) {
		this._chats = [...this._chats, ...chats];

		return this._chats;
	}
}

const getWsEndpoint = (): string => {
	return `http://${talkMateEndpoint.ip}:${talkMateEndpoint.port}`;
};
