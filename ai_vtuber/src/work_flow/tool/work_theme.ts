import { tool } from "@langchain/core/tools";
import { hc } from "hono/client";
import { z } from "zod";
import endpointJson from "../../../../endpoint.json";
import type { restPostWorkThemeType } from "../../index.js";

export const workThemeConfirm = {
	tool: tool(
		({ input }: { input: string }): string => {
			workTheme.main = input;
			hc<restPostWorkThemeType>(
				`http:${endpointJson.ai_vtuber.address}:${endpointJson.ai_vtuber.port}`,
			).work_theme.$post({
				json: workTheme,
			});
			return `作業内容を「${input}」に更新したよ。`;
		},
		{
			name: "workThemeConfirm",
			description:
				"inputに今日作っている物についての要約を入力すると、今日作っている物を配信UI上の表示の変更ができます。",
			schema: z.object({
				input: z.string(),
			}),
		},
	),
	message: "設定したよ",
	action: "配信UIに表示する作業内容を反映させた。",
};

export const addTaskConfirm = {
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
			name: "addTaskConfirm",
			description:
				"inputに現在の作業内容の要約を入力すると、作業内容を配信UI上の表示の変更ができます。",
			schema: z.object({
				input: z.string(),
			}),
		},
	),
	message: "設定したよ",
	action: "配信UIに表示する作業内容を反映させた。",
};

export const workTheme = {
	main: "配信開始直後",
	sub: ["配信開始"],
};
