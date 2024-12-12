import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { ChatVertexAI } from "@langchain/google-vertexai-web";

export const getlocalModel = async () => {
	if (!_localModel) {
		_localModel = new ChatOllama({
			model: "gemma_9b",
		});
	}
	return _localModel;
};

let _localModel: ChatOllama;

const getGemini = () => {
	const gemini = new ChatVertexAI({
		model: "gemini-1.5-flash",
		maxOutputTokens: 50,
		safetySettings: [
			{
				category: "HARM_CATEGORY_UNSPECIFIED",
				threshold: "HARM_BLOCK_THRESHOLD_UNSPECIFIED",
			},
		],
	});
	return gemini;
};

export const gemini = getGemini();
