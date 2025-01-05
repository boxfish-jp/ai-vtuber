import { AIMessage, HumanMessage } from "@langchain/core/messages";
import type { Chat } from "@prisma/client";

export type chatPromptType = (HumanMessage | AIMessage)[];
export const convertToChatPrompt = (chats: Chat[]): chatPromptType => {
	if (chats.length <= 1) {
		return [];
	}
	const onlyHistory = chats.slice(0, -1);
	const messages: (HumanMessage | AIMessage)[] = [];
	for (const chat of onlyHistory) {
		switch (chat.who) {
			case "fuguo":
				messages.push(new HumanMessage(chat.message, { name: "fuguo" }));
				break;
			case "viewer":
				messages.push(new HumanMessage(chat.message, { name: "viewer" }));
				break;
			case "announce":
				messages.push(new AIMessage(chat.message, { name: "announce" }));
				break;
			case "ai":
				messages.push(new AIMessage(chat.message));
				break;
		}
	}
	return messages;
};
