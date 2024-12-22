import type { Chat } from "@prisma/client";
import { AIMessage, HumanMessage } from "@langchain/core/messages";

export type chatPromptType = (HumanMessage | AIMessage)[];
export const convertToChatPrompt = (chats: Chat[]): chatPromptType => {
	if (chats.length <= 1) {
		return [];
	}
	const onlyHistory = chats.slice(0, -1);
	const messages: (HumanMessage | AIMessage)[] = [];
	for (const chat of onlyHistory) {
		if (chat.who === "fuguo") {
			messages.push(new HumanMessage(chat.message));
		}
		if (chat.who === "ai") {
			messages.push(new AIMessage(chat.message));
		}
	}
	return messages;
};
