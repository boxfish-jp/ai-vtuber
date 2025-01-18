import {
	ChatPromptTemplate,
	FewShotChatMessagePromptTemplate,
} from "@langchain/core/prompts";
import type { examplePromptDataType } from "../../prompt/types.js";

export const convertToExamplePrompt = async (
	examplePromptData: examplePromptDataType[],
) => {
	const examplePromptTemplate = ChatPromptTemplate.fromMessages([
		["human", "{input}"],
		["ai", "{output}"],
	]);
	const fewShotPrompt = new FewShotChatMessagePromptTemplate({
		examplePrompt: examplePromptTemplate,
		examples: examplePromptData,
		inputVariables: [],
	});
	const fewShotPromptInvoke = await fewShotPrompt.invoke({});

	const examplePrompt = ChatPromptTemplate.fromMessages(
		fewShotPromptInvoke.toChatMessages(),
	);
	return examplePrompt;
};
