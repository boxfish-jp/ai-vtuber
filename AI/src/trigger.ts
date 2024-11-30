import { beginTalk } from "./LLM/speakTo";
import { fuguoState } from "./LLM/talk/fuguo";
import { sleep } from "./sleep";
import { AIAction, type Action } from "./action";
import { sendMsg } from "./index";

export async function trigger() {
	while (true) {
		if (fuguoState.silence) {
			console.log("beginTalk");
			const llmResponse = await beginTalk();
			const action: Action = new AIAction(llmResponse);
			await action.speak(sendMsg);
			sendMsg(" ");
			await sleep(10000);
		}
		await sleep(1000);
		console.log(fuguoState.talking);
	}
}
