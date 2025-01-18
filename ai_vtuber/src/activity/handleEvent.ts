import { Spotify } from "../agents/spotify/spotify.js";
import { WorkTheme } from "../agents/work_theme/work_theme.js";
import type { LiveEvent } from "../event/event.js";
import { getAiState } from "../state/ai.js";
import { getFuguoState } from "../state/fuguo.js";
import { getViewerState } from "../state/viewer.js";
import { takeScreenshot } from "../take_screenShot/take_screenshot.js";
import { Activity } from "./activity.js";
import {
	getLatestChatSection,
	insertChatDb,
	makeAsPointed,
} from "./db/chat_db.js";

export const makeActivity = async (
	event: LiveEvent | undefined,
): Promise<Activity> => {
	const chatHistory = await getLatestChatSection();
	const imageUrl = event?.instruction?.needScreenshot
		? await takeScreenshot()
		: "";
	const workTheme = new WorkTheme();
	const spotify = new Spotify();
	const songName = await spotify.getListteningSongName();
	const instruction = event?.instruction?.type;
	return new Activity(
		songName,
		chatHistory,
		imageUrl,
		workTheme.theme,
		instruction,
	);
};

export const applyEvent = async (event: LiveEvent): Promise<void> => {
	if (event.chat !== undefined) {
		if (event.chat.who === "viewer") {
			const viewerState = getViewerState();
			viewerState.setTalking();
		} else if (event.chat.who === "ai") {
			const aiState = getAiState();
			aiState.setTalking();
		}
		await insertChatDb(event.chat);
	}
	if (event.fuguoSpeaking !== undefined) {
		const fuguoState = getFuguoState();
		fuguoState.talking = event.fuguoSpeaking;
	}
	if (event.instruction?.unixTime !== undefined) {
		await makeAsPointed(event.instruction.unixTime);
	}
};
