import { exec } from "node:child_process";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import type { Activity } from "../../activity/activity.js";
import { gemini } from "../../lib/model.js";
import type { AgentResponse } from "../agent.js";
import { cleanLlmResponse } from "../llm_response_cleaner.js";
import { cliSystemPrompt } from "./prompt.js";

export class Cli {
	async service(activity: Activity): Promise<AgentResponse> {
		const chatHistoryPrompt = activity.chatHistoryPrompt;
		const inputPrompt = activity.inputPrompt;
		const systemPrompt = cliSystemPrompt;

		const prompt = ChatPromptTemplate.fromMessages([
			["system", "{system}"],
			["placeholder", "{history}"],
			inputPrompt,
		]);

		const modelWithTools = gemini.bindTools([this.execute]);
		const chain = prompt.pipe(modelWithTools);
		try {
			const response = await chain.invoke({
				system: systemPrompt,
				history: chatHistoryPrompt,
			});
			if (response.tool_calls?.length) {
				const toolName = response.tool_calls[0].name as keyof typeof this.tools;
				const tool = this.tools[toolName];
				tool.invoke(response.tool_calls[0]);
				console.log("opened");
				return {
					text: "開けた？",
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

	private execute = tool(
		({ command }: { command: string }): boolean => {
			console.log("command:", command);
			try {
				exec(command, { encoding: "utf8" });
				return true;
			} catch (error) {
				console.error("Command execution failed:", error);
				return false;
			}
		},
		{
			name: "execute",
			description:
				"command引数にbashコマンドを入れると、そのコマンドを実行されます。",
			schema: z.object({
				command: z.string(),
			}),
		},
	);

	private tools = {
		execute: this.execute,
	};
}

let cli: Cli | undefined = undefined;
export const getCli = (): Cli => {
	if (!cli) {
		cli = new Cli();
	}
	return cli;
};
