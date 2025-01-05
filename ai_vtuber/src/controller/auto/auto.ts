import { sleep } from "../../lib/sleep.js";
import type { LLM } from "../../llm/llm.js";
import { getLatestChatSection, makeLatestAsPointed } from "../db/chat_db.js";
import { getAiState } from "../state/ai.js";
import { getTalkState } from "../state/talk.js";
import { getShouldAnswer } from "./shouldAnswer.js";

export async function auto(talk: LLM["talk"]) {
	const talkState = getTalkState();
	const aiState = getAiState();
	while (true) {
		if (talkState.waiting && !aiState.talking) {
			const chatHistory = await getLatestChatSection();
			console.log("chatHistory", chatHistory);
			const shouldAnswer = getShouldAnswer(chatHistory);
			console.log("shouldAnswer", shouldAnswer);
			if (shouldAnswer) {
				const llmResponse = await talk(chatHistory, "");
			}
		}

		if (talkState.silence && !aiState.talking) {
			await makeLatestAsPointed();
			/*
			aiState.talking = true;
			console.log("beginTalk");
			const llmResponse = await beginTalk();
			await createChatHistory("ai", llmResponse, true);
			const action: Action = new AIAction(llmResponse);
			await action.speak(sendMsg);
			sendMsg(" ");
			aiState.talking = false;
      */
		}

		await sleep(1000);
	}
}
