import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { readFileContent } from "../../prompt/readFileContent";
import { getlocalModel } from "./model";

export const beginTalk = async () => {
	const talkTheme = getTalkTheme();
	const systemPrompt = await readFileContent("prompt/chat/system.md");
	const beginTalkPrompt = ChatPromptTemplate.fromTemplate(
		`${systemPrompt}${talkTheme}`,
	);
	const parser = new StringOutputParser();
	const localModel = await getlocalModel();
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
	const rand = Math.floor(Math.random() * 10) + 1;
	if (rand <= 2) {
		return "ふぐおに今何をしているかを聞いてください。";
	}
	return "ふぐおに何か話題を振ってください。";
};
