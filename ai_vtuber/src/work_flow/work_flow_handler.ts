import EventEmitter from "node:events";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { Activity } from "../handle_event/activity.js";
import { characterState } from "../handle_event/character_state.js";
import { getLatestChatSection } from "../handle_event/chat_db.js";
import type { InstructionEvent } from "../handle_event/event.js";
import { Agent, type AgentType } from "./agent.js";
import { gemini } from "./model.js";
import { Thought } from "./thought.js";
import { MakeAudio } from "./tool/make_audio/make_audio.js";
import { takeScreenshot } from "./tool/take_screenshot.js";

export interface WorkFlowHandler {
	onInstruction: [instruction: InstructionEvent];
	onFuguoChat: [];
}

export const getWorkFlowHandler = () => {
	const workFlowHandler = new EventEmitter<WorkFlowHandler>();
	const thought = new Thought("配信が始まりました。");
	const makeAudio = MakeAudio.getInstance();
	const thinkQueue = new ThinkQueue();
	let lastSpeak = Date.now();
	const resetThoughtTime = 15000;
	let lastProgressTime = Date.now();
	const progressInterval = 5 * 60 * 1000;

	workFlowHandler.on("onInstruction", async (instruction) => {
		const imageUrl = instruction.needScreenshot ? await takeScreenshot() : "";
		const chatSession = await getLatestChatSection();
		const activity = new Activity(chatSession, imageUrl, instruction.type);
		if (Date.now() - lastSpeak > resetThoughtTime) {
			thought.beforeListen = "";
		}
		lastSpeak = Date.now();
		if (instruction.type === "talk") {
			thought.beforeSpeak = await think("before_speak", activity, thought);
		}
		if (instruction.type === "progress") {
			lastProgressTime = Date.now();
			makeAudio.addQueue("進捗はどうなのだ。");
			thought.afterSpeak = await think("after_speak", activity, thought);
			return;
		}
		const action = await makeAction(instruction.type, activity, thought);
		makeAudio.addQueue(action.message);
		if (action.action) {
			thought.afterSpeak = await think("after_speak", activity, thought);
			return;
		}
		thought.afterSpeak = await think(
			"after_call_tool",
			activity,
			thought,
			action.action,
		);
		return;
	});

	workFlowHandler.on("onFuguoChat", async () => {
		thinkQueue.add(async () => {
			if (Date.now() >= lastProgressTime + progressInterval) {
				const chatSession = await getLatestChatSection();
				const activity = new Activity(chatSession);

				const situation = (await think("situation", activity, thought))
					.split(/\r?\n/)
					.filter((sentence) => sentence !== "");
				console.log(situation);
				if (situation[1] === "プログラミング") {
					lastProgressTime = Date.now();
					makeAudio.addQueue("進捗はどうなのだ。");
					thought.afterSpeak = await think("after_speak", activity, thought);
				}
			}
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

const think = async (
	name: AgentType,
	activity: Activity,
	thought: Thought,
	response = "",
): Promise<string> => {
	const agent = new Agent(name);
	const prompt = agent.getPrompt(activity, thought, response);
	const parser = new StringOutputParser();
	return await gemini.pipe(parser).invoke(prompt);
};

const makeAction = async (
	name: AgentType,
	activity: Activity,
	thought: Thought,
	response = "",
): Promise<{ message: string; action: string }> => {
	const agent = new Agent(name);
	const prompt = agent.getPrompt(activity, thought, response);
	if (!agent.tools) {
		const parser = new StringOutputParser();
		const response = await gemini.pipe(parser).invoke(prompt);
		if (activity.instruction !== "talk") {
			return await translate(response, activity, thought);
		}
		return { message: response, action: "" };
	}
	const result = await gemini
		.bindTools(Object.values(agent.tools).map((item) => item.tool))
		.invoke(prompt);
	if (result.tool_calls?.length) {
		const toolName = result.tool_calls[0].name as keyof typeof agent.tools;
		const thistool = agent.tools[toolName];
		if (thistool) {
			thistool.tool.invoke(result.tool_calls[0]);
			return { message: thistool.message, action: thistool.action };
		}
	}
	return await translate(result.content as string, activity, thought);
};

const translate = async (
	original: string,
	activity: Activity,
	thought: Thought,
) => {
	if (!original) {
		return {
			message: "エラーが発生したのだ。",
			action: "ずんだもんの内部でエラーが発生している。",
		};
	}
	const translatePrompt = new Agent("translate").getPrompt(
		activity,
		thought,
		original,
	);
	const translate = await gemini
		.pipe(new StringOutputParser())
		.invoke(translatePrompt);
	return { message: translate, action: "" };
};
