import {
	ChatPromptTemplate,
	FewShotChatMessagePromptTemplate,
} from "@langchain/core/prompts";
import AIConfig from "../../../AIConfig.json";

export const createExamplePrompt = async (whichExample: string) => {
	const examplePromptTemplate = ChatPromptTemplate.fromMessages([
		["human", "{input}"],
		["ai", "{output}"],
	]);
	const examples =
		whichExample === "shouldAnswer"
			? AIConfig.prompt.shouldAnswer.example
			: AIConfig.prompt.prompt.example;
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
