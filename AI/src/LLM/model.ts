import { LlamaCpp } from "@langchain/community/llms/llama_cpp";
import { ChatVertexAI } from "@langchain/google-vertexai-web";

export const localModel = await LlamaCpp.initialize({
	modelPath: "./models/gemma-2-2b-jpn-it-Q8_0.gguf",
});

const getGemini = () => {
	process.env.GOOGLE_WEB_CREDENTIALS = process.env.GOOGLE_CREDENTIALS;
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
