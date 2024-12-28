import { Controller, type controllerType } from "./controller/controller.js";
import { LLM, type llmType } from "./llm/llm.js";
import { MakeAudio, type makeAudioType } from "./make_audio/make_audio.js";
import { createServer } from "./server/server.js";

const makeAudio: makeAudioType = new MakeAudio();
const llm: llmType = new LLM(makeAudio.addQueue);
const controller: controllerType = new Controller(llm.talk);
createServer(
	controller.addChat,
	controller.speakStateChange,
	controller.talkToAi,
);
