import { tool } from "@langchain/core/tools";
import { hc } from "hono/client";
import { z } from "zod";
import endpointJson from "../../../../endpoint.json";
import type { restPostWorkThemeType } from "../../index.js";

export const workThemeConfirm = {
	tool: tool(
		({ input }: { input: string }): string => {
			workTheme.sub.push(input);
			hc<restPostWorkThemeType>(
				`http:${endpointJson.ai_vtuber.address}:${endpointJson.ai_vtuber.port}`,
			).work_theme.$post({
				json: workTheme,
			});
			return `作業内容を「${input}」に更新したよ。`;
		},
		{
			name: "workThemeConfirm",
			description: `
inputに作業内容を入力すると、作業内容を配信UI上の表示の変更ができます。
ただし、inputには要約した作業内容を入力してください。
例:「ずんだもん作業内容をリファクタリングに変えて」=> input=リファクタリング
`,
			schema: z.object({
				input: z.string(),
			}),
		},
	),
	message: "設定したのだ",
	action: "配信UIに表示する作業内容を反映させた。",
};

class WorkTheme {
	public main = "配信開始直後";
	public sub = ["配信開始"];
}

export const workTheme = new WorkTheme();
