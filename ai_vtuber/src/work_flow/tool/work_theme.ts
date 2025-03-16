import { tool } from "@langchain/core/tools";
import { z } from "zod";

const workThemeConfirm = tool(
	({ input }: { input: string }): string => {
		return `作業内容を「${input}」に更新したよ。`;
	},
	{
		name: "confirm",
		description:
			"inputに作業内容の要約を入力すると、作業内容の登録ができます。",
		schema: z.object({
			input: z.string(),
		}),
	},
);

export const workThemeTool = {
	tool: workThemeConfirm,
	message: "設定したよ",
	action: "配信UIに表示する作業内容を反映させた。",
};
