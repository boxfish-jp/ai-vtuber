import { config } from "dotenv";
config();
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
	ChatPromptTemplate,
	FewShotChatMessagePromptTemplate,
} from "@langchain/core/prompts";
import { ChatVertexAI } from "@langchain/google-vertexai-web";
import { LlamaCpp } from "@langchain/community/llms/llama_cpp";
import AIConfig from "../../AIConfig.json";
import { sleep } from "../sleep";

export type chatHistoryType = { human: string; ai: string }[];
const localModel = await LlamaCpp.initialize({
	modelPath: "./models/gemma-2-2b-jpn-it-Q8_0.gguf",
});

const createMessages = (
	chatHistory: chatHistoryType,
): (HumanMessage | AIMessage)[] => {
	if (chatHistory.length <= 1) {
		return [];
	}
	const onlyHistory = chatHistory.slice(0, -1);
	const messages: (HumanMessage | AIMessage)[] = [];
	for (const chat of onlyHistory) {
		if (chat.human) {
			messages.push(new HumanMessage(chat.human));
		}
		if (chat.ai) {
			messages.push(new AIMessage(chat.ai));
		}
	}
	return messages;
};

const createInput = (chatHistory: chatHistoryType): string => {
	if (chatHistory.length === 0) {
		throw new Error("chatHistory is empty");
	}
	return chatHistory[chatHistory.length - 1].human;
};

export const think = async (
	chatHistory: chatHistoryType,
	imageUrl: string | undefined,
): Promise<string> => {
	const messages = createMessages(chatHistory);
	const input = createInput(chatHistory);
	const examplePrompt = ChatPromptTemplate.fromMessages([
		["human", "{input}"],
		["ai", "{output}"],
	]);
	const examples = AIConfig.prompt.prompt.example;
	const fewShotPrompt = new FewShotChatMessagePromptTemplate({
		examplePrompt: examplePrompt,
		examples: examples,
		inputVariables: [],
	});
	const fewShotPromptInvoke = await fewShotPrompt.invoke({});

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
	const prompt = ChatPromptTemplate.fromMessages([
		["system", AIConfig.prompt.prompt.systemPrompt],
		["placeholder", "{chat_history}"],
		ChatPromptTemplate.fromMessages(fewShotPromptInvoke.toChatMessages()),
		inputPrompt,
	]);
	process.env.GOOGLE_WEB_CREDENTIALS = process.env.GOOGLE_CREDENTIALS;
	const gemini = new ChatVertexAI({
		model: "gemini-1.5-flash",
		maxOutputTokens: 50,
		safetySettings: [
			{
				category: "HARM_CATEGORY_UNSPECIFIED",
				threshold: "HARM_BLOCK_THRESHOLD_UNSPECIFIED",
			},
		],
	});

	const parser = new StringOutputParser();
	const chain = imageUrl
		? prompt.pipe(gemini).pipe(parser)
		: prompt.pipe(localModel).pipe(parser);
	for (let i = 0; i < AIConfig.prompt.model.maxRetries; i++) {
		try {
			const response = await chain.invoke({
				chat_history: messages,
			});
			return response;
		} catch (e) {
			console.log("error:", e);
			await sleep(1000);
		}
	}
	return "思考が停止しました";
};
