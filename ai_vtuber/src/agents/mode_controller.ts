import { type DynamicStructuredTool, tool } from "@langchain/core/tools";
import { z } from "zod";
import type { Activity } from "../activity/activity.js";
import type { instructionEvent } from "../event/event.js";
import { getlocalModel } from "../lib/model.js";
import { getAfk } from "./afk/afk.js";
import type { Agent } from "./agent.js";
import { getCli } from "./cli/cli.js";
import { getGrade } from "./grade/grade.js";
import type { mode } from "./mode.js";
import { getRemineder } from "./remineder/remineder.js";
import { getTalk } from "./talk/talk.js";
import { getWorkTheme } from "./work_theme/work_theme.js";

export class ModeController {
	private currentMode: mode = "talk";

	async classify(activity: Activity): Promise<Agent> {
		if (activity.instruction) {
			return this.instructionClassify(activity.instruction);
		}
		const agent = await this.autoClassify(activity);
		return agent;
	}

	private instructionClassify = (
		instruction: instructionEvent["type"],
	): Agent => {
		this.currentMode = instruction;
		switch (this.currentMode) {
			case "talk":
				return getTalk();
			case "work_theme":
				return getWorkTheme();
			case "grade":
				return getGrade();
			case "afk":
				return getAfk();
			case "back":
				return getAfk();
		}
	};

	private autoClassify = async (activity: Activity): Promise<Agent> => {
		const model = await getlocalModel();
		const modelWithTools = model.bindTools([this.cliTool, this.remineder]);
		const result = await modelWithTools.invoke(activity.chatHistoryPrompt);
		if (result.tool_calls === undefined || result.tool_calls.length === 0) {
			return getTalk();
		}
		let selectedTool: DynamicStructuredTool;
		switch (result.tool_calls[0].name) {
			case "cliTool":
				return getCli();
			case "remineder":
				return getRemineder();
			default:
				throw new Error("tool not found");
		}
	};

	private cliTool = tool(
		(): Agent => {
			return getCli();
		},
		{
			name: "cliTool",
			description:
				"このツールでできることは、ブラウザで特定のページを開きユーザーにそのページを閲覧させる、特定のディレクトリにてvscodeやNeovim,Lazygitを開く。これはLLMエージェントなので、このツールを呼び出しさえすれば、自動でユーザーに作業内容を確認し、cliコマンドが実行されます。",
			schema: z.object({}),
		},
	);

	private remineder = tool(
		(): Agent => {
			return getRemineder();
		},
		{
			name: "remineder",
			description:
				"このツールでできることは、特定の時間になったら、ユーザーにお知らせするリマインダーを作成することができます。これはLLMエージェントなので、このツールを呼び出しさえすれば、自動でユーザーにリマインダーの内容とその時間を確認し、その確認内容の通りにリマインダーが実行されます。",
			schema: z.object({}),
		},
	);
}
