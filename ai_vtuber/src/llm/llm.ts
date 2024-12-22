import type { Chat } from "@prisma/client";
import { convertToChatPrompt } from "./lib/convert/chats.js";
import { convertToInputPrompt } from "./lib/convert/input.js";
import {
	getTalkExamplePromptData,
	getTalkSystemPrompt,
} from "./prompt/talk.js";
import { convertToExamplePrompt } from "./lib/convert/example.js";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { gemini } from "./lib/model.js";
import { cleanLlmResponse } from "./lib/cleanLlmResponse.js";
import type { makeAudioType } from "../make_audio/make_audio.js";

export interface llmType {
	talk(chats: Chat[], screenshotUrl: string): Promise<void>;
}

export class LLM implements llmType {
	private readonly addQueue: makeAudioType["addQueue"];
	constructor(addQueue: makeAudioType["addQueue"]) {
		this.addQueue = addQueue;
	}

	async talk(chats: Chat[], screenshotUrl: string): Promise<void> {
		const chatsPrompt = convertToChatPrompt(chats);
		const inputPrompt = convertToInputPrompt(chats, screenshotUrl);
		const systemPrompt = getTalkSystemPrompt();
		const examplePrompt = await convertToExamplePrompt(
			getTalkExamplePromptData(),
		);
		const prompt = ChatPromptTemplate.fromMessages([
			["system", systemPrompt],
			["placeholder", "{chats}"],
			examplePrompt,
			inputPrompt,
		]);

		const parser = new StringOutputParser();
		const chain = prompt.pipe(gemini).pipe(parser);
		try {
			const response = await chain.invoke({
				chats: chatsPrompt,
			});
			this.addQueue(cleanLlmResponse(response));
		} catch (e) {
			console.log("error:", e);
			this.addQueue("思考が停止しました。");
		}
	}
}
