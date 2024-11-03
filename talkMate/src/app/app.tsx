import { type FC, useEffect, useState } from "react";
import { fetchTalkMate } from "./lib/fetchTalkMate";
import { type WatchChat, watchChatFromSocket } from "./lib/watchChat";
import { ChatTable } from "./table";
import type { Chat } from ".prisma/client";

export const App: FC = () => {
	const [chats, setChat] = useState<Chat[]>([]);
	useEffect(() => {
		const watchChat: WatchChat = new watchChatFromSocket((newChats) => {
			setChat(newChats);
		});
	}, []);

	return (
		<div>
			<ChatTable chats={chats} submitCallback={fetchTalkMate} />
		</div>
	);
};
