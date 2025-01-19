import { ChatPromptTemplate } from "@langchain/core/prompts";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import type { Activity } from "../../activity/activity.js";
import { gemini } from "../../lib/model.js";
import type { Agent } from "../agent.js";
import { cleanLlmResponse } from "../llm_response_cleaner.js";
import { workThemeSystemPrompt } from "./prompt.js";

export class WorkTheme implements Agent {
	private _theme = "";
	private checking: undefined | string = undefined;

	get theme(): string {
		return this._theme;
	}

	async service(activity: Activity): Promise<string> {
		if (this.checking) {
			return await this.check(activity);
		}
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

		const modelWithTools = gemini.bindTools([this.affect]);
		const chain = prompt.pipe(modelWithTools);
		try {
			const response = await chain.invoke({
				system: systemPrompt,
			});
			if (response.tool_calls?.length) {
				const toolMessage = await this.affect.invoke(response.tool_calls[0]);
				return toolMessage;
			}
			return cleanLlmResponse(response.text);
		} catch (e) {
			console.log("error:", e);
			return "思考が停止しました。";
		}
	}

	private async check(activity: Activity) {
		const chatHistoryPrompt = activity.chatHistoryPrompt;
		const inputPrompt = activity.inputPrompt;
		const systemPrompt = workThemeSystemPrompt(chatHistoryPrompt);

		const prompt = ChatPromptTemplate.fromMessages([
			["system", "{system}"],
			inputPrompt,
		]);

		const modelWithTools = gemini.bindTools([this.confirm, this.affect]);
		const chain = prompt.pipe(modelWithTools);
		try {
			const response = await chain.invoke({
				system: systemPrompt,
			});
			if (response.tool_calls?.length) {
				const toolMessage = await this.affect.invoke(response.tool_calls[0]);
				return toolMessage;
			}
			return cleanLlmResponse(response.text);
		} catch (e) {
			console.log("error:", e);
			return "思考が停止しました。";
		}
	}

	private affect = tool(
		({ input }: { input: string }): string => {
			this.checking = input;
			return `つまり、現在の内容は「${this.checking}」であってる？`;
		},
		{
			name: "affect",
			description:
				"inputに現在の作業内容の概要を入れると、これ以後の会話のシステムプロンプトに今日の作業内容が反映されるようになります。また、視聴者も現在の作業内容の把握が容易になります。",
			schema: z.object({
				input: z.string(),
			}),
		},
	);

	private confirm = tool(
		({ input }: { input: string }): string => {
			if (this.checking !== undefined) {
				this._theme = this.checking;
				this.checking = undefined;
			}
			return `作業内容を「${this._theme}」に更新したよ。`;
		},
		{
			name: "confirm",
			description:
				"ユーザーがあなたの提案した作業内容の要約に賛成している場合は、inputにyesと入れると、その内容が確定されます。",
			schema: z.object({
				input: z.string(),
			}),
		},
	);
}

export const workTheme = new WorkTheme();
