import EventEmitter from "node:events";
import { Activity } from "../handle_event/activity.js";
import { getLatestChatSection } from "../handle_event/chat_db.js";
import type { InstructionEvent } from "../handle_event/event.js";
import { takeScreenshot } from "./tool/take_screenshot.js";

export interface WorkFlowHandler {
	onInstruction: [instruction: InstructionEvent];
	onFuguoChat: [];
}

export const getWorkFlowHandler = () => {
	const workFlowHandler = new EventEmitter<WorkFlowHandler>();

	workFlowHandler.on("onInstruction", async (instruction) => {
		const imageUrl = instruction.needScreenshot ? await takeScreenshot() : "";
		const chatSession = await getLatestChatSection();
		const activity = new Activity(chatSession, imageUrl, instruction.type);
	});

	workFlowHandler.on("onFuguoChat", async () => {
		const chatSession = await getLatestChatSection();
		const activity = new Activity(chatSession);
	});

	return workFlowHandler;
};
