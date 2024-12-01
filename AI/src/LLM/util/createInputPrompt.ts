import type { chatHistoryType } from "../../type/chatHistoryType";
import { HumanMessage } from "@langchain/core/messages";

export const createInputPrompt = (
	chatHistory: chatHistoryType,
	imageUrl: string | undefined,
) => {
	if (chatHistory.length === 0) {
		throw new Error("chatHistory is empty");
	}
	const input = chatHistory[chatHistory.length - 1].human;
	const inputPrompt = imageUrl
		? new HumanMessage({
				content: [
					{ type: "text", text: input },
					{
						type: "image_url",
						image_url: {
							url: imageUrl,
						},
					},
				],
			})
		: new HumanMessage({
				content: [{ type: "text", text: input }],
			});
	return inputPrompt;
};
