import { AIMessage, HumanMessage } from "@langchain/core/messages";
import type { chatHistoryType } from "../../type/chatHistoryType";

export const createMessages = (
	chatHistory: chatHistoryType,
): (HumanMessage | AIMessage)[] => {
	if (chatHistory.length <= 1) {
		return [];
	}
	const onlyHistory = chatHistory.slice(0, -1);
	const messages: (HumanMessage | AIMessage)[] = [];
	for (const chat of onlyHistory) {
		if (chat.human) {
			messages.push(new HumanMessage(chat.human));
		}
		if (chat.ai) {
			messages.push(new AIMessage(chat.ai));
		}
	}
	return messages;
};
