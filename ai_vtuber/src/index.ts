import { ChatController } from "./chat_controller/controller.js";
import { LLM, type llmType } from "./llm/llm.js";
import { MakeAudio, type makeAudioType } from "./make_audio/make_audio.js";
import { createServer } from "./server/server.js";

const makeAudio: makeAudioType = new MakeAudio();
const llm: llmType = new LLM(makeAudio.addQueue.bind(makeAudio));
const controller: ChatController = new ChatController(llm.talk.bind(llm));
createServer(
	controller.addChat.bind(controller),
	controller.speakStateChange.bind(controller),
	controller.talkToAi.bind(controller),
);
