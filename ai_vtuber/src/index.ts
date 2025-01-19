import { applyEvent, makeActivity } from "./activity/handleEvent.js";
import { ModeController } from "./agents/mode_controller.js";
import { eventServer } from "./event/server.js";
import { MakeAudio } from "./make_audio/make_audio.js";
import { getAiState } from "./state/ai.js";

const makeAudio = new MakeAudio();
const modeController = new ModeController();
eventServer(async (event) => {
	if (event.isNeedApply) {
		await applyEvent(event);
	}
	if (!event.isNeedMakeActivity) {
		return;
	}
	const activity = await makeActivity(event);
	const agent = await modeController.classify(activity);
	const response = await agent.service(activity);
	const aiState = getAiState();
	aiState.setTalking();
	makeAudio.addQueue(response);
});
