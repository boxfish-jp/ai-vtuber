import { config } from "dotenv";
config();
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { localModel, gemini } from "./model";
import AIConfig from "../../AIConfig.json";
import { sleep } from "../lib/sleep";
import type { chatHistoryType } from "../type/chatHistoryType";
import { createMessages } from "./util/createMessages";
import { createInputPrompt } from "./util/createInputPrompt";
import { createExamplePrompt } from "./util/createExamplePrompt";

export const chat = async (
	chatHistory: chatHistoryType,
	imageUrl: string | undefined,
): Promise<string> => {
	const messages = createMessages(chatHistory);
	const inputPrompt = createInputPrompt(chatHistory, imageUrl);
	const examplePrompt = await createExamplePrompt("prompt");

	const prompt = ChatPromptTemplate.fromMessages([
		["system", AIConfig.prompt.prompt.systemPrompt],
		["placeholder", "{messages}"],
		examplePrompt,
		inputPrompt,
	]);

	const parser = new StringOutputParser();
	const chain = imageUrl
		? prompt.pipe(gemini).pipe(parser)
		: prompt.pipe(localModel).pipe(parser);
	for (let i = 0; i < AIConfig.prompt.model.maxRetries; i++) {
		try {
			const response = await chain.invoke({
				messages: messages,
			});
			return response;
		} catch (e) {
			console.log("error:", e);
			await sleep(1000);
		}
	}
	return "思考が停止しました";
};
