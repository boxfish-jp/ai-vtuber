import type { Chat } from "@prisma/client";

export const getShouldAnswer = (chatHistorys: Chat[]): boolean => {
	if (chatHistorys[chatHistorys.length - 1].who === "ai") {
		return false;
	}
	const reversedChatHistory = chatHistorys.reverse();
	let viewerCount = 0;
	let fuguoCount = 0;
	for (const chatHistory of reversedChatHistory) {
		switch (chatHistory.who) {
			case "viewer":
				viewerCount++;
				break;
			case "fuguo":
				fuguoCount++;
				break;
			case "ai":
				return viewerCount >= 2 || fuguoCount >= 2;
		}
	}
	return true;
};
