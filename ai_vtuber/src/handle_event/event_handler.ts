import EventEmitter from "node:events";
import { MakeAudio } from "../work_flow/tool/make_audio/make_audio.js";
import type { WorkFlowHandler } from "../work_flow/work_flow_handler.js";
import { characterState } from "./character_state.js";
import { insertChatDb, makeAsPointed } from "./chat_db.js";
import type { ChatEvent, InstructionEvent } from "./event.js";

export interface EventHandler {
	onFuguoSound: [soundIsOn: boolean];
	onInstruction: [instruction: InstructionEvent];
	onChat: [chat: ChatEvent];
	onInterrupt: [];
}

export const getEventHandler = (workFlow: EventEmitter<WorkFlowHandler>) => {
	const eventHandler = new EventEmitter<EventHandler>();
	let wasSilence = true;

	eventHandler.on("onFuguoSound", (soundIsOn: boolean) => {
		if (characterState.silence) {
			wasSilence = true;
		}
		characterState.fuguo.setTalking(soundIsOn);
	});

	eventHandler.on("onInstruction", async (instruction) => {
		let sechtionChanged = false;
		if (characterState.talking) {
			sechtionChanged = true;
			await makeAsPointed(instruction.unixTime);
		}
		workFlow.emit("onInstruction", instruction, sechtionChanged);
	});

	eventHandler.on("onChat", async (chat) => {
		if (chat.who === "viewer") {
			characterState.viewer.setTalking();
		}
		if (chat.who === "ai") {
			characterState.ai.setTalking();
		}

		if (wasSilence) {
			chat.point = true;
			wasSilence = false;
		}

		await insertChatDb(chat);

		if (chat.who === "fuguo") {
			workFlow.emit("onFuguoChat");
		}
	});

	eventHandler.on("onInterrupt", () => {
		const makeAudio = MakeAudio.getInstance();
		makeAudio.interrupt(true);
	});

	return eventHandler;
};
