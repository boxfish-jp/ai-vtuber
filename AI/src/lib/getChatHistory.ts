import type { chatHistoryType } from "../type/chatHistoryType";
import endpoint from "../../../endpoint.json";

export const getChatHistory = async (): Promise<chatHistoryType> => {
	const url = new URL(
		`http://${endpoint.talkMate.ip}:${endpoint.talkMate.port}/message/`,
	);
	url.searchParams.append("len", "10");
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const chatHistory = (await response.json()) as chatHistoryType;
		return chatHistory;
	} catch (e) {
		throw new Error(`Fetch error: ${e}`);
	}
};
