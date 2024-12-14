import { beginTalk } from "./LLM/speakTo";
import { sleep } from "./lib/sleep";
import { AIAction, type Action } from "./action";
import { sendMsg } from "./index";
import { getChatHistory } from "./lib/getChatHistory";
import { getShouldAnswer } from "./LLM/shouldAnswer";
import { chat } from "./LLM/chat";
import { aiState } from "./LLM/state/ai";
import { talkState } from "./LLM/state/talk";
import { createChatHistory } from "./lib/createChatHistory";

export async function trigger() {
	while (true) {
		if (talkState.waiting) {
			const chatHistory = await getChatHistory();
			console.log("chatHistory", chatHistory);
			const shouldAnswer = getShouldAnswer(chatHistory);
			console.log("shouldAnswer", shouldAnswer);
			if (shouldAnswer) {
				aiState.talking = true;
				const llmResponse = await chat(chatHistory, "");
				console.log("llmResponse", llmResponse);
				await createChatHistory("ai", llmResponse);
				const action: Action = new AIAction(llmResponse);
				await action.speak(sendMsg);
				sendMsg(" ");
				aiState.talking = false;
			}
		}

		if (talkState.silence) {
			aiState.talking = true;
			console.log("beginTalk");
			const llmResponse = await beginTalk();
			await createChatHistory("ai", llmResponse);
			const action: Action = new AIAction(llmResponse);
			await action.speak(sendMsg);
			sendMsg(" ");
			aiState.talking = false;
		}

		await sleep(1000);
	}
}
