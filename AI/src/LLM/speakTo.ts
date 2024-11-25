import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import AIConfig from "../../AIConfig.json";
import { localModel } from "./model";

export const beginTalk = async () => {
	const talkTheme = getTalkTheme();
	const systemPrompt = AIConfig.prompt.prompt.systemPrompt;
	const beginTalkPrompt = ChatPromptTemplate.fromTemplate(
		`${systemPrompt}${talkTheme}`,
	);
	const parser = new StringOutputParser();
	const chain = beginTalkPrompt.pipe(localModel).pipe(parser);
	try {
		const response = await chain.invoke({});
		return response;
	} catch (e) {
		console.log("error:", e);
	}
	return "";
};

const getTalkTheme = (): string => {
	return "ふぐおに今何をしているかを聞いてください。";
};
