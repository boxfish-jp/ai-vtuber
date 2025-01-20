import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import type { Activity } from "../../activity/activity.js";
import { gemini } from "../../lib/model.js";
import type { Agent, AgentResponse } from "../agent.js";
import { cleanLlmResponse } from "../llm_response_cleaner.js";
import { convertToExamplePrompt } from "./lib/convert/example.js";
import {
	getTalkExamplePromptData,
	getTalkSystemPrompt,
} from "./prompt/talk.js";

export class Talk implements Agent {
	async service(activity: Activity): Promise<AgentResponse> {
		const chatHistoryPrompt = activity.chatHistoryPrompt;
		console.log("chatHistoryPrompt", chatHistoryPrompt);
		const inputPrompt = activity.inputPrompt;
		console.log("input", inputPrompt);
		const systemPrompt = getTalkSystemPrompt(chatHistoryPrompt);
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
			return {
				text: cleanLlmResponse(response),
				completed: true,
			};
		} catch (e) {
			console.log("error:", e);
			return {
				text: "思考が停止しました。",
				completed: true,
			};
		}
	}
}

let talk: Talk | undefined = undefined;

export const getTalk = (): Talk => {
	if (!talk) {
		talk = new Talk();
	}
	return talk;
};
