import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import type { Activity } from "../../activity/activity.js";
import { gemini } from "../../lib/model.js";
import { getAiState } from "../../state/ai.js";
import { cleanLlmResponse } from "../llm_response_cleaner.js";
import { convertToExamplePrompt } from "./lib/convert/example.js";
import {
	getTalkExamplePromptData,
	getTalkSystemPrompt,
} from "./prompt/talk.js";

export const talk = async (activity: Activity): Promise<string | undefined> => {
	const aiState = getAiState();
	if (aiState.talking) {
		return undefined;
	}
	const chatHistoryPrompt = activity.chatHistoryPrompt;
	const inputPrompt = activity.inputPrompt;
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
		const cleanedResponse = cleanLlmResponse(response);
		if (cleanedResponse.length > 10) {
			return undefined;
		}
		return cleanedResponse;
	} catch (e) {
		console.log("error:", e);
		return "思考が停止しました。";
	}
};
