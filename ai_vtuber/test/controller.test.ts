import { describe } from "node:test";
import type { Chat } from "@prisma/client";
import { expect, test } from "vitest";
import {
	Controller,
	type controllerType,
} from "../src/controller/controller.js";
import { deleteChatDb } from "../src/controller/db/chat_db.js";
import { sleep } from "../src/lib/sleep.js";

const now = new Date().getTime();

const testChatData = [
	{
		unixTime: 1n,
		who: "viewer",
		message: "こんにちは",
		point: true,
	},
	{
		unixTime: 2n,
		who: "fuguo",
		message: "こんにちは",
		point: false,
	},
	{
		unixTime: 3n,
		who: "viewer",
		message: "こんにちは",
		point: false,
	},
];
const talkTest = async (chats: Chat[], imageUrl: ""): Promise<string> => {
	console.log(chats);
	console.log(imageUrl);
	await sleep(1);
	return "test";
};

describe("controllerのてすと", async () => {
	test("addChatのてすと", async () => {
		const controller: controllerType = new Controller(talkTest);
		const createdChat = await controller.addChat(
			BigInt(now),
			"viewer",
			testChatData[0].message,
			testChatData[0].point,
		);
		expect(createdChat.unixTime).toBe(BigInt(now));
		expect(createdChat.who).toBe(testChatData[0].who);
		expect(createdChat.message).toBe(testChatData[0].message);
		deleteChatDb(testChatData[0].unixTime);
	});

	test("speakStateChangeのてすと", async () => {
		const controller: controllerType = new Controller(talkTest);
		const result = controller.speakStateChange(true);
		expect(result).toBe(true);
	});

	test("talkToAiの出力スキーマてすと", async () => {
		const controller: controllerType = new Controller(talkTest);
		await controller.addChat(
			BigInt(now),
			"viewer",
			testChatData[0].message,
			testChatData[0].point,
		);
		const resultData = await controller.talkToAi(
			testChatData[0].unixTime,
			false,
		);
		deleteChatDb(testChatData[0].unixTime);
		expect(resultData.chats[0].unixTime).toBe(BigInt(now));
		expect(resultData.chats[0].who).toBe(testChatData[0].who);
		expect(resultData.chats[0].message).toBe(testChatData[0].message);
		expect(resultData.url).toBe("");
	});

	test("talkToAiの出力pointてすと", async () => {
		const controller: controllerType = new Controller(talkTest);
		await controller.addChat(
			BigInt(now),
			"viewer",
			testChatData[0].message,
			testChatData[0].point,
		);
		await controller.addChat(
			BigInt(now + 1),
			"fuguo",
			testChatData[1].message,
			testChatData[1].point,
		);
		await controller.addChat(
			BigInt(now + 2),
			"viewer",
			testChatData[2].message,
			testChatData[2].point,
		);
		const resultData = await controller.talkToAi(
			testChatData[0].unixTime,
			false,
		);
		deleteChatDb(testChatData[0].unixTime);
		deleteChatDb(testChatData[1].unixTime);
		deleteChatDb(testChatData[2].unixTime);
		expect(resultData.chats.length).toBe(3);
		expect(resultData.url).toBe("");
	});

	test("talkToAiのスクショテスト", async () => {
		const controller: controllerType = new Controller(talkTest);
		await controller.addChat(
			testChatData[0].unixTime,
			"viewer",
			testChatData[0].message,
			testChatData[0].point,
		);
		const resultData = await controller.talkToAi(
			testChatData[0].unixTime,
			true,
		);
		deleteChatDb(testChatData[0].unixTime);
		expect(resultData.url).not.toBe("");
	});
});
