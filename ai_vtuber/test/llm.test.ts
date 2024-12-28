import { describe } from "node:test";
import { expect, test } from "vitest";
import { sleep } from "../src/lib/sleep.js";
import { LLM, type llmType } from "../src/llm/llm.js";

const testChatData = [
	{
		id: 1,
		unixTime: 1n,
		who: "viewer",
		message: "こんにちは",
		point: true,
	},
	{
		id: 2,
		unixTime: 2n,
		who: "fuguo",
		message: "こんにちは",
		point: false,
	},
];
describe("llmのてすと", async () => {
	test("llmのてすと", async () => {
		const addQueueTest = async (text: string): Promise<void> => {
			await sleep(1);
			console.log(text);
		};
		const llm: llmType = new LLM(addQueueTest);
		const response = await llm.talk(testChatData, "");
		expect(response).not.toBe("思考が停止しました。");
	});
});
