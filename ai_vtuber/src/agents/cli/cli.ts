import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import type { Activity } from "../../activity/activity.js";
import { gemini } from "../../lib/model.js";
import { cleanLlmResponse } from "../llm_response_cleaner.js";

export class Cli {
	async service(activity: Activity): Promise<string> {
		const ChatHistoryPrompt = activity.chatHistoryPrompt;
		const inputPrompt = activity.inputPrompt;
		const prompt = ChatPromptTemplate.fromMessages([
			["system", "{system}"],
			inputPrompt,
		]);

		const parser = new StringOutputParser();
		const chain = prompt.pipe(gemini).pipe(parser);
		try {
			const response = await chain.invoke({
				system: "",
			});
			return cleanLlmResponse(response);
		} catch (e) {
			console.log("error:", e);
			return "思考が停止しました。";
		}
	}
}

let cli: Cli | undefined = undefined;
export const getCli = (): Cli => {
	if (!cli) {
		cli = new Cli();
	}
	return cli;
};
