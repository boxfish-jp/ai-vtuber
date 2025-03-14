import EventEmitter from "node:events";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { Activity } from "../handle_event/activity.js";
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
			thought.beforeSpeak = await llmHandler("beforeSpeak", activity, thought);
			const toolMessage = await llmHandler("talk", activity, thought);
			if (toolMessage) {
				makeAudio.addQueue(toolMessage);
				thought.afterSpeak = await llmHandler(
					"afterCallTool",
					activity,
					thought,
				);
			}
			return;
		}

		const [concentrate, { response, toolMessage }] = await Promise.all([
			llmHandler("isConcentrate", activity, thought),
			(async () => {
				thought.beforeSpeak = await llmHandler(
					"beforeSpeak",
					activity,
					thought,
				);
				const [response, toolMessage] = await Promise.all([
					llmHandler("talk", activity, thought),
					llmHandler("callTool", activity, thought),
				]);
				return { response, toolMessage };
			})(),
		]);

		if (toolMessage) {
			makeAudio.addQueue(toolMessage);
			thought.afterSpeak = await llmHandler("afterCallTool", activity, thought);
			return;
		}
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

	return workFlowHandler;
};

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
