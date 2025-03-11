import EventEmitter from "node:events";
import type { WorkFlow } from "../work_flow/work_flow.js";
import { characterState } from "./character_state.js";
import { insertChatDb, makeAsPointed } from "./chat_db.js";
import type { chatEvent, instructionEvent } from "./event.js";

export interface EventHandler {
	onFuguoSound: [soundIsOn: boolean];
	onInstruction: [instruction: instructionEvent];
	onChat: [chat: chatEvent];
}

export const getEventHandler = (workFlow: EventEmitter<WorkFlow>) => {
	const eventHandler = new EventEmitter<EventHandler>();

	eventHandler.on("onFuguoSound", (soundIsOn: boolean) => {
		characterState.fuguo.setTalking(soundIsOn);
	});

	eventHandler.on("onInstruction", async (instruction) => {
		if (characterState.talking) {
			await makeAsPointed(instruction.unixTime || Date.now());
		}
		workFlow.emit("onInstruction", instruction);
	});

	eventHandler.on("onChat", async (chat) => {
		if (chat.who === "viewer") {
			characterState.viewer.setTalking();
		}
		if (chat.who === "ai") {
			characterState.ai.setTalking();
		}
		await insertChatDb(chat);

		if (chat.who === "fuguo") {
			workFlow.emit("onFuguoChat");
		}
	});
};
