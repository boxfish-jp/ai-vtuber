import { broadcast } from "@/server/socketServer";
import { getChatStore } from "./chatStore";
import type { Chat } from ".prisma/client";
import { c } from "node_modules/vite/dist/node/types.d-aGj9QkWt";

type chatHistoryType = { human: string; AI: string }[];

const formatChatHistory = (sessionChats: Chat[]): chatHistoryType => {
	const chatHistory: chatHistoryType = [];
	let tmpHuman = "";
	for (const [i, chat] of sessionChats.entries()) {
		switch (chat.who) {
			case "fuguo":
				tmpHuman += `ふぐお「${chat.message}」`;
				break;
			case "viewer":
				tmpHuman += `視聴者「${chat.message}」`;
				break;
			case "ai":
				chatHistory.push({ human: tmpHuman, AI: chat.message });
				tmpHuman = "";
				break;
			default:
				throw new Error(`Invalid who:${chat.who}`);
		}
		if (i === sessionChats.length - 1) {
			chatHistory.push({ human: tmpHuman, AI: "" });
		}
	}
	return chatHistory;
};

export const getChatHistory = async (
	chatId: number,
): Promise<chatHistoryType> => {
	const chatStore = getChatStore();
	const sessionChats = await chatStore.getSessionChat(chatId);
	const chatHistory = formatChatHistory(sessionChats);
	return chatHistory;
};

export const createChat = async (
	who: string,
	message: string,
): Promise<void> => {
	const chatStore = getChatStore();
	const result = await chatStore.createChat(who, message);
	broadcast(JSON.stringify([result]));
};

export const getRecentChatHistory = async (
	length: number,
): Promise<chatHistoryType> => {
	const chatStore = getChatStore();
	const chats = await chatStore.getRecentChat(length);
	const chatHistory = formatChatHistory(chats);
	return chatHistory;
};
