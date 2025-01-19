import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import type { Activity } from "../../activity/activity.js";
import { gemini } from "../../lib/model.js";
import type { Agent } from "../agent.js";
import { cleanLlmResponse } from "../llm_response_cleaner.js";
import { gradeSystemPrompt } from "./prompt.js";

export class Grade implements Agent {
	async service(activity: Activity): Promise<string> {
		const inputPrompt = activity.inputPrompt;
		const prompt = ChatPromptTemplate.fromMessages([
			["system", "{system}"],
			inputPrompt,
		]);

		const parser = new StringOutputParser();
		const chain = prompt.pipe(gemini).pipe(parser);
		try {
			const response = await chain.invoke({
				system: gradeSystemPrompt,
			});
			return cleanLlmResponse(response);
		} catch (e) {
			console.log("error:", e);
			return "思考が停止しました。";
		}
	}
}
