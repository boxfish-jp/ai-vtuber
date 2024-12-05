import type { chatHistoryType } from "../type/chatHistoryType";

export const getShouldAnswer = (chatHistory: chatHistoryType): boolean => {
	if (chatHistory[chatHistory.length - 1].ai) {
		return false;
	}
	return countSentense(chatHistory[chatHistory.length - 1].human);
};

function countSentense(text: string): boolean {
	const periodCount = (text.match(/」/g) || []).length;

	// 合計が2つ以上であればtrueを返す
	return periodCount >= 2;
}
