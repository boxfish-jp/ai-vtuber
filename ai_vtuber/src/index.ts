import { applyEvent, makeActivity } from "./activity/activity.js";
import { talk } from "./agents/talk/talk.js";
import { eventServer } from "./event/server.js";
import { MakeAudio } from "./make_audio/make_audio.js";
import { getAiState } from "./state/ai.js";

const makeAudio = new MakeAudio();
eventServer(async (event) => {
	if (event.chat || event.fuguoSpeaking || event.instruction?.unixTime) {
		await applyEvent(event);
	}
	if (event.fuguoSpeaking || event.chat?.who === "ai") {
		return;
	}
	const activity = await makeActivity(event);
	const response = await talk(activity);
	if (!response) return;
	const aiState = getAiState();
	aiState.setTalking();
	makeAudio.addQueue(response);
});
