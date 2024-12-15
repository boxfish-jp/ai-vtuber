import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { getlocalModel, gemini } from "./model";
import AIConfig from "../../AIConfig.json";
import { sleep } from "../lib/sleep";
import type { chatHistoryType } from "../type/chatHistoryType";
import { createMessages } from "./util/createMessages";
import { createInputPrompt } from "./util/createInputPrompt";
import { createExamplePrompt } from "./util/createExamplePrompt";
import { readFileContent } from "../../prompt/readFileContent";

export const chat = async (
	chatHistory: chatHistoryType,
	imageUrl: string | undefined,
): Promise<string> => {
	const messages = createMessages(chatHistory);
	const inputPrompt = createInputPrompt(chatHistory, imageUrl);
	const systemPrompt = await readFileContent("prompt/chat/system.md");
	const examplePrompt = await createExamplePrompt("prompt");

	const prompt = ChatPromptTemplate.fromMessages([
		["system", systemPrompt],
		["placeholder", "{messages}"],
		examplePrompt,
		inputPrompt,
	]);

	const parser = new StringOutputParser();
	const localModel = await getlocalModel();
	const chain = imageUrl
		? prompt.pipe(gemini).pipe(parser)
		: prompt.pipe(localModel).pipe(parser);
	console.log("chain ");
	const response = await chain.invoke({
		messages: messages,
	});
	console.log(response);
	return response.replace(/[\r\n]+/g, "");
};
