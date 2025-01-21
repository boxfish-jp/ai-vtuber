import { ChatPromptTemplate } from "@langchain/core/prompts";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import type { Activity } from "../../activity/activity.js";
import { gemini } from "../../lib/model.js";
import type { Agent, AgentResponse } from "../agent.js";
import { cleanLlmResponse } from "../llm_response_cleaner.js";
import { workThemeSystemPrompt } from "./prompt.js";

export class WorkTheme implements Agent {
	private _theme = "";

	get theme(): string {
		return this._theme;
	}

	async service(activity: Activity): Promise<AgentResponse> {
		return await this.consult(activity);
	}

	private async consult(activity: Activity) {
		const chatHistoryPrompt = activity.chatHistoryPrompt;
		const inputPrompt = activity.inputPrompt;
		const systemPrompt = workThemeSystemPrompt(chatHistoryPrompt);

		const prompt = ChatPromptTemplate.fromMessages([
			["system", "{system}"],
			inputPrompt,
		]);

		const modelWithTools = gemini.bindTools([this.confirm]);
		const chain = prompt.pipe(modelWithTools);
		try {
			const response = await chain.invoke({
				system: systemPrompt,
			});
			if (response.tool_calls?.length) {
				const toolName = response.tool_calls[0].name as keyof typeof this.tools;
				const tool = this.tools[toolName];
				const toolMessage = await tool.invoke(response.tool_calls[0]);
				return {
					text:
						typeof response.content === "string"
							? cleanLlmResponse(toolMessage.content)
							: "",
					completed: true,
				};
			}
			return {
				text:
					typeof response.content === "string"
						? cleanLlmResponse(response.content)
						: "",
				completed: false,
			};
		} catch (e) {
			console.log("error:", e);
			return {
				text: "思考が停止しました。",
				completed: true,
			};
		}
	}

	private confirm = tool(
		({ input }: { input: string }): string => {
			this._theme = input;
			return `作業内容を「${this._theme}」に更新したよ。`;
		},
		{
			name: "confirm",
			description:
				"inputに作業内容の要約を入力すると、その作業内容が確定されます。",
			schema: z.object({
				input: z.string(),
			}),
		},
	);

	private tools = {
		confirm: this.confirm,
	};
}

let workTheme: WorkTheme | undefined = undefined;
export const getWorkTheme = (): WorkTheme => {
	if (!workTheme) {
		workTheme = new WorkTheme();
	}
	return workTheme;
};
