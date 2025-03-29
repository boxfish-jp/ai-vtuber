import { ChatVertexAI } from "@langchain/google-vertexai-web";
import { ChatOllama } from "@langchain/ollama";

export const getlocalModel = async () => {
	if (!_localModel) {
		_localModel = new ChatOllama({
			model: "qwen2.5:3b",
		});
	}
	return _localModel;
};

let _localModel: ChatOllama;

const getGemini = (modelName: string) => {
	const gemini = new ChatVertexAI({
		model: modelName,
		safetySettings: [
			{
				category: "HARM_CATEGORY_HARASSMENT",
				threshold: "BLOCK_ONLY_HIGH",
			},
			{
				category: "HARM_CATEGORY_HATE_SPEECH",
				threshold: "BLOCK_ONLY_HIGH",
			},
			{
				category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
				threshold: "BLOCK_ONLY_HIGH",
			},
			{
				category: "HARM_CATEGORY_DANGEROUS_CONTENT",
				threshold: "BLOCK_ONLY_HIGH",
			},
			{
				category: "HARM_CATEGORY_CIVIC_INTEGRITY",
				threshold: "BLOCK_ONLY_HIGH",
			},
		],
	});
	return gemini;
};

export const gemini = getGemini("gemini-2.0-flash-lite");
