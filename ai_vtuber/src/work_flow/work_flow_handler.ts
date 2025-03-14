import EventEmitter from "node:events";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { Activity } from "../handle_event/activity.js";
import { characterState } from "../handle_event/character_state.js";
import { getLatestChatSection } from "../handle_event/chat_db.js";
import type { InstructionEvent } from "../handle_event/event.js";
import { gemini } from "./model.js";
import { type AgentName, getPrompt } from "./prompt.js";
import { Thought } from "./thought.js";
import { MakeAudio } from "./tool/make_audio/make_audio.js";
import { takeScreenshot } from "./tool/take_screenshot.js";
import { tools } from "./tool/tools.js";

export interface WorkFlowHandler {
	onInstruction: [instruction: InstructionEvent];
	onFuguoChat: [];
}

export const getWorkFlowHandler = () => {
	const workFlowHandler = new EventEmitter<WorkFlowHandler>();
	const thought = new Thought("配信が始まりました。");
	const makeAudio = new MakeAudio();
	const thinkQueue = new ThinkQueue();

	workFlowHandler.on("onInstruction", async (instruction) => {
		const imageUrl = instruction.needScreenshot ? await takeScreenshot() : "";
		const chatSession = await getLatestChatSection();
		const activity = new Activity(chatSession, imageUrl, instruction.type);
		thought.beforeSpeak = await llmHandler("beforeSpeak", activity, thought);
		const [response, tool] = await Promise.all([
			llmHandler("talk", activity, thought),
			llmHandler("callTool", activity, thought),
		]);
		if (tool) {
			makeAudio.addQueue(tool);
			thought.afterSpeak = await llmHandler("afterCallTool", activity, thought);
			return;
		}
		makeAudio.addQueue(response);
		thought.afterSpeak = await llmHandler("afterSpeak", activity, thought);
		return;
	});

	workFlowHandler.on("onFuguoChat", async () => {
		const chatSession = await getLatestChatSection();
		const activity = new Activity(chatSession);

		if (activity.aiIsNeedWait) {
			return;
		}

		thinkQueue.add(async () => {
			console.log("startProcess");
			const [concentrate, response] = await Promise.all([
				llmHandler("isConcentrate", activity, thought),
				(async () => {
					thought.beforeSpeak = await llmHandler(
						"beforeSpeak",
						activity,
						thought,
					);
					const response = llmHandler("talk", activity, thought);
					return response;
				})(),
			]);

			if (concentrate.startsWith("集中")) {
				thought.afterSpeak = await llmHandler("afterSpeak", activity, thought);
				return;
			}

			makeAudio.addQueue(response);
			thought.beforeSpeak = await llmHandler(
				"afterSpeak",
				activity,
				thought,
				response,
			);
		});
	});

	return workFlowHandler;
};

class ThinkQueue {
	private _queue: NodeJS.Timeout[] = [];

	add(callback: () => Promise<void>) {
		while (this._queue.length) {
			const unnecessaryQueue = this._queue.shift();
			if (unnecessaryQueue !== undefined) {
				clearTimeout(unnecessaryQueue);
			}
		}
		this._queue.push(
			setTimeout(async () => {
				if (characterState.waiting) {
					await callback();
				}
			}, 5000),
		);
	}
}

const llmHandler = async (
	name: AgentName,
	activity: Activity,
	thought: Thought,
	response = "",
): Promise<string> => {
	const prompt = getPrompt(name, activity, thought, response);
	if (name !== "callTool") {
		const parser = new StringOutputParser();
		return await gemini.pipe(parser).invoke(prompt);
	}
	const result = await gemini
		.bindTools(Object.values(tools).map((item) => item.tool))
		.invoke(prompt);
	if (result.tool_calls?.length) {
		const toolName = result.tool_calls[0].name as keyof typeof tools;
		const thistool = tools[toolName];
		thistool.tool.invoke(result.tool_calls[0]);
		return thistool.message;
	}
	return "";
};
