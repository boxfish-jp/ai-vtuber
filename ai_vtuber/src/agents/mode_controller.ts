import { ChatPromptTemplate } from "@langchain/core/prompts";
import { tool } from "@langchain/core/tools";
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

	async classify(activity: Activity): Promise<Agent | undefined> {
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

	private autoClassify = async (
		activity: Activity,
	): Promise<Agent | undefined> => {
		const systemPrompt =
			"あなたは有能なアシスタントです。ユーザーから「リマインダーを設定する」「開発ツールを開く」「特定のwebサイトを開く」作業を頼まれた場合は何があっても必ずツールを呼び出してください。あなたはその作業について詳細をユーザーに聞くようなことはしなくて構いません。以下がこれまでの会話履歴です。";
		const prompt = ChatPromptTemplate.fromMessages([
			["system", "{system}"],
			activity.inputPrompt,
		]);
		const model = await getlocalModel();
		const modelWithTools = prompt.pipe(
			model.bindTools([this.cliTool, this.remineder]),
		);
		const result = await modelWithTools.invoke({ system: systemPrompt });
		if (result.tool_calls === undefined || result.tool_calls.length === 0) {
			return undefined;
		}
		switch (result.tool_calls[0].name) {
			case "cliTool":
				return getCli();
			case "remineder":
				return getRemineder();
			default:
				return undefined;
		}
	};

	private cliTool = tool(
		(): Agent => {
			return getCli();
		},
		{
			name: "cliTool",
			description:
				"ブラウザで特定のページを開きユーザーにそのページを閲覧させる、特定のディレクトリにてvscodeやNeovim,Lazygitを開くといった処理を専門に担うLLMエージェントです。",
			schema: z.object({}),
		},
	);

	private remineder = tool(
		(): Agent => {
			return getRemineder();
		},
		{
			name: "remineder",
			description: "リマインダー作成専門のLLMエージェントです。",
			schema: z.object({}),
		},
	);
}
