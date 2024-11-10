import { takeScreenshot } from "@/lib/screenshot";
import { AiEndpoint } from "../endpoint";
import { getChatHistory } from "../message/opeMess";

export const sendAPI = async (chatId: number, needScreenshot: boolean) => {
	const requestBody = await makeRequestBody(chatId, needScreenshot);
	console.log(requestBody);
	const params = {
		headers: {
			"Content-Type": "application/json",
		},
		method: "POST",
		body: requestBody,
	};

	try {
		const response = await fetch(AiEndpoint, params);
		if (!response.ok) {
			console.log(`Failed to send message to AI: ${response.statusText}`);
			return response.text();
		}
		return response.text();
	} catch (e) {
		console.log(e);
		return String(e);
	}
};

const makeRequestBody = async (
	chatId: number,
	needScreenshot: boolean,
): Promise<string> => {
	const chatHistory = await getChatHistory(chatId);
	if (!chatHistory) {
		return "No chatHistory found";
	}

	if (needScreenshot) {
		const imageUrl = await takeScreenshot(); // Add screenshot to chatHistory
		return JSON.stringify({
			data: chatHistory,
			imageUrl: imageUrl,
		});
	}
	return JSON.stringify({ data: chatHistory });
};
