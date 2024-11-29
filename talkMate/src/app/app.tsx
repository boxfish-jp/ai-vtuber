import { type FC, useEffect, useState } from "react";
import { fetchTalkMate } from "./lib/fetchTalkMate";
import { SocketControler, type SocketControlerType } from "./lib/watchChat";
import { ChatTable } from "./table";
import type { Chat } from ".prisma/client";
import { speechRecognition } from "./lib/speachrecognition";

export const App: FC = () => {
	const [chats, setChat] = useState<Chat[]>([]);
	useEffect(() => {
		const socket: SocketControlerType = new SocketControler();
		socket.watchChat((newChats) => {
			setChat(newChats);
		});
		socket.sendEvent("RESULT", "test");
		speechRecognition((eventName, content) => {
			socket.sendEvent(eventName, content);
		});
	}, []);

	return (
		<div>
			<ChatTable chats={chats} submitCallback={fetchTalkMate} />
		</div>
	);
};
