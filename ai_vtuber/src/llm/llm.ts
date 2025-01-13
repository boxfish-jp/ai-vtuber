import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import type { Chat } from "@prisma/client";
import { getAiState } from "../controller/state/ai.js";
import type { makeAudioType } from "../make_audio/make_audio.js";
import { cleanLlmResponse } from "./lib/cleanLlmResponse.js";
import { convertToChatPrompt } from "./lib/convert/chats.js";
import { convertToExamplePrompt } from "./lib/convert/example.js";
import { convertToInputPrompt } from "./lib/convert/input.js";
import { gemini } from "./lib/model.js";
import {
	getTalkExamplePromptData,
	getTalkSystemPrompt,
} from "./prompt/talk.js";

export interface llmType {
	talk(chats: Chat[], screenshotUrl: string): Promise<string>;
}

export class LLM implements llmType {
	private readonly addQueue: makeAudioType["addQueue"];
	constructor(addQueue: makeAudioType["addQueue"]) {
		this.addQueue = addQueue;
	}

	async talk(chats: Chat[], screenshotUrl: string): Promise<string> {
		const aiState = getAiState();
		if (aiState.talking) {
			return "思考中です。";
		}
		aiState.talking = true;
		const chatsPrompt = convertToChatPrompt(chats);
		const inputPrompt = convertToInputPrompt(chats, screenshotUrl);
		const systemPrompt = getTalkSystemPrompt(chatsPrompt);
		const examplePrompt = await convertToExamplePrompt(
			getTalkExamplePromptData(),
		);
		const prompt = ChatPromptTemplate.fromMessages([
			["system", "{system}"],
			examplePrompt,
			inputPrompt,
		]);

		const parser = new StringOutputParser();
		const chain = prompt.pipe(gemini).pipe(parser);
		try {
			const response = await chain.invoke({
				system: systemPrompt,
			});
			const cleanedResponse = cleanLlmResponse(response);
			if (cleanedResponse.length > 10) {
				this.addQueue(cleanedResponse);
			}
			return response;
		} catch (e) {
			console.log("error:", e);
			const response = "思考が停止しました。";
			this.addQueue(response);
			return response;
		}
	}
}
