import type { chatHistoryType } from "../type/chatHistoryType";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import AIConfig from "../../AIConfig.json";
import { getlocalModel } from "./model";
import { createMessages } from "./util/createMessages";
import { createExamplePrompt } from "./util/createExamplePrompt";
import { sleep } from "../lib/sleep";

export const getShouldAnswer = async (
	chatHistory: chatHistoryType,
): Promise<boolean> => {
	const messages = createMessages(chatHistory);
	const examplePrompt = await createExamplePrompt("shouldAnswer");

	const prompt = ChatPromptTemplate.fromMessages([
		["system", AIConfig.prompt.shouldAnswer.systemPrompt],
		["placeholder", "{messages}"],
		examplePrompt,
	]);

	const parser = new StringOutputParser();
	const localModel = await getlocalModel();
	const chain = prompt.pipe(localModel).pipe(parser);
	for (let i = 0; i < AIConfig.prompt.model.maxRetries; i++) {
		try {
			const response = await chain.invoke({
				messages: messages,
			});
			console.log("response:", response);
			const firstNumber = findFirstNumber(response);
			return firstNumber === 1;
		} catch (e) {
			console.log("error:", e);
			await sleep(1000);
		}
	}
	return false;
};

function findFirstNumber(str: string): number | undefined {
	const regex = /\d/;
	const match = str.match(regex);
	return match ? Number.parseInt(match[0]) : undefined;
}
