import type { chatHistoryType } from "../type/chatHistoryType";

export const getShouldAnswer = (chatHistory: chatHistoryType): boolean => {
	if (chatHistory[chatHistory.length - 1].ai) {
		return false;
	}
	return countSentense(chatHistory[chatHistory.length - 1].human);
};

function countSentense(text: string): boolean {
	const fuguoCount = (text.match(/ふぐお/g) || []).length;
	const viewerCount = (text.match(/視聴者/g) || []).length;

	// 合計が2つ以上であればtrueを返す
	return fuguoCount >= 2 || viewerCount >= 2;
}
