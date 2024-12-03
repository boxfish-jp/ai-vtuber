import {
	ChatPromptTemplate,
	FewShotChatMessagePromptTemplate,
} from "@langchain/core/prompts";
import shouldAnswerPrompt from "../../../prompt/shouldAnswer/example.json";
import chatPrompt from "../../../prompt/chat/example.json";

export const createExamplePrompt = async (whichExample: string) => {
	const examplePromptTemplate = ChatPromptTemplate.fromMessages([
		["human", "{input}"],
		["ai", "{output}"],
	]);
	const examples =
		whichExample === "shouldAnswer" ? shouldAnswerPrompt : chatPrompt;
	const fewShotPrompt = new FewShotChatMessagePromptTemplate({
		examplePrompt: examplePromptTemplate,
		examples: examples,
		inputVariables: [],
	});
	const fewShotPromptInvoke = await fewShotPrompt.invoke({});

	const examplePrompt = ChatPromptTemplate.fromMessages(
		fewShotPromptInvoke.toChatMessages(),
	);
	return examplePrompt;
};
