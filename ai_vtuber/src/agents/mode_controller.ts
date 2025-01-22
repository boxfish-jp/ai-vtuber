import { ChatPromptTemplate } from "@langchain/core/prompts";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import type { Activity } from "../activity/activity.js";
import { makeAsPointed } from "../activity/db/chat_db.js";
import { getlocalModel } from "../lib/model.js";
import { getAfk } from "./afk/afk.js";
import type { Agent } from "./agent.js";
import { getCli } from "./cli/cli.js";
import { getGrade } from "./grade/grade.js";
import type { mode } from "./mode.js";
import { getRemineder } from "./remineder/remineder.js";
import { getSpotify } from "./spotify/spotify.js";
import { getTalk } from "./talk/talk.js";
import { getWorkTheme } from "./work_theme/work_theme.js";

export class ModeController {
	private currentMode: mode = "talk";

	resetMode(): void {
		this.currentMode = "talk";
	}

	async classify(activity: Activity): Promise<Agent | undefined> {
		if (activity.instruction) {
			return this.getAgent(activity.instruction);
		}
		if (this.currentMode !== "talk") {
			return this.getAgent(this.currentMode);
		}
		const agent = await this.autoClassify(activity);
		return agent;
	}

	private autoClassify = async (
		activity: Activity,
	): Promise<Agent | undefined> => {
		const systemPrompt =
			"あなたは有能なアシスタントです。ユーザーから「リマインダーを設定する」「エディターを開く」「特定のwebサイトを開く」作業を頼まれた場合は何があっても必ずツールを呼び出してください。あなたはその作業について詳細をユーザーに聞くようなことはしなくて構いません。以下がこれまでの会話履歴です。";
		const prompt = ChatPromptTemplate.fromMessages([
			["system", "{system}"],
			activity.lastChat.content,
		]);
		const model = await getlocalModel();
		const modelWithTools = prompt.pipe(
			model.bindTools([this.cli, this.remineder, this.spotify]),
		);
		const result = await modelWithTools.invoke({ system: systemPrompt });
		console.log(result);
		if (result.tool_calls === undefined || result.tool_calls.length === 0) {
			return undefined;
		}
		await makeAsPointed(activity.lastChat.unixTime);
		return this.getAgent(result.tool_calls[0].name);
	};

	private getAgent = (mode: string): Agent | undefined => {
		switch (mode) {
			case "talk":
				this.currentMode = "talk";
				return getTalk();
			case "work_theme":
				this.currentMode = "work_theme";
				return getWorkTheme();
			case "grade":
				this.currentMode = "grade";
				return getGrade();
			case "afk":
				this.currentMode = "afk";
				return getAfk();
			case "back":
				this.currentMode = "back";
				return getAfk();
			case "cli":
				this.currentMode = "cli";
				return getCli();
			case "remineder":
				this.currentMode = "remineder";
				return getRemineder();
			case "spotify":
				this.currentMode = "spotify";
				return getSpotify();
			default:
				return undefined;
		}
	};

	private cli = tool(
		(): void => {
			return;
		},
		{
			name: "cli",
			description:
				"ブラウザで特定のページを開きユーザーにそのページを閲覧させる、エディターを開く、ターミナルを開く,Lazygitを開くといった処理を専門に担うLLMエージェントです。",
			schema: z.object({}),
		},
	);

	private remineder = tool(
		(): void => {
			return;
		},
		{
			name: "remineder",
			description: "リマインダー作成専門のLLMエージェントです。",
			schema: z.object({}),
		},
	);

	private spotify = tool(
		() => {
			return;
		},
		{
			name: "spotify",
			description: "音楽再生専門のLLMエージェントです。",
			schema: z.object({}),
		},
	);
}
