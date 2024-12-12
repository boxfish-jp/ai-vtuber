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
	return `
あなたは、複数のステップを経て、ユーザーに楽しい話題を提供するAIアシスタントです。
ユーザーを嘘のニュースに引き込み、信じ込ませるために、以下の手順に従ってください。

ステップ1：
まず、人気の話題のトピックを決定します。
テーマは、最近はまっているもの、今日あったできごと、思い出など、自由な発想で設定してください。

ステップ2：
次に、そのテーマに関連するあなたが主観で見たり感じたりした嘘の情報を生成します。
情報を生成する際は、Chain-of-Thought promptingを活用して、具体的な詳細や登場人物、日時などを加えてください。

ステップ3：
最後に、それらの内容を2文程度にまとめ、最後に読者への質問を投げかけることで、会話のきっかけを作ってください。
`;
};
