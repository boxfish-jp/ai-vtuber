import type { Chat } from "@prisma/client";

export const convertToChatPrompt = (chats: Chat[]): string => {
	if (chats.length <= 1) {
		return "直前の会話履歴はありません";
	}
	const onlyHistory = chats.slice(0, -1);
	const messages: string[] = [];
	for (const chat of onlyHistory) {
		switch (chat.who) {
			case "fuguo":
				messages.push(`ふぐお「${chat.message}」`);
				break;
			case "viewer":
				messages.push(`視聴者「${chat.message}」`);
				break;
			case "announce":
				messages.push(`アナウンス「${chat.message}」`);
				break;
			case "ai":
				messages.push(`αちゃん「${chat.message}」`);
				break;
		}
	}
	return messages.join("\n");
};
