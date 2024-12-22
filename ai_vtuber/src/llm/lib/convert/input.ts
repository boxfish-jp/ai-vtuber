import { HumanMessage } from "@langchain/core/messages";
import type { Chat } from "@prisma/client";

export const convertToInputPrompt = (
	chats: Chat[],
	imageUrl: string,
): HumanMessage => {
	if (chats.length === 0) {
		throw new Error("chats is empty");
	}
	const inputText = chats[chats.length - 1].message;
	const inputPrompt = imageUrl
		? new HumanMessage({
				content: [
					{ type: "text", text: inputText },
					{
						type: "image_url",
						image_url: {
							url: imageUrl,
						},
					},
				],
			})
		: new HumanMessage({
				content: [{ type: "text", text: inputText }],
			});
	return inputPrompt;
};
