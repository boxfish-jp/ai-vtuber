import { createServer } from "./server/server.js";
import { type controllerType, Controller } from "./controller/controller.js";
import { LLM, type llmType } from "./llm/llm.js";
import { type makeAudioType, MakeAudio } from "./make_audio/make_audio.js";

const makeAudio: makeAudioType = new MakeAudio();
const llm: llmType = new LLM(makeAudio.addQueue);
const controller: controllerType = new Controller(llm.talk);
createServer(
	controller.addChat,
	controller.speakStateChange,
	controller.talkToAi,
);
