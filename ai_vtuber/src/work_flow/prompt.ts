import type { Activity } from "../handle_event/activity.js";
import type { Thought } from "./thought.js";

export type AgentName = "talk" | "callTool" | "beforeSpeak" | "afterSpeak";

export const getPrompt = (
	name: AgentName,
	activity: Activity,
	thought: Thought,
) => {
	let middlePrompt = "";
	switch (name) {
		case "beforeSpeak":
			middlePrompt = `
Aが新たに発言しました。
最初の一文目にBが直前で考えていたことは、Aの新しい発言によってどのように変化したか。
次の2文目で, Bの次の発言や行動をする時に注意すべき点を1文程度で端的に出力ください。それ以外の文は出力しないでください。

# Bが直前まで考えていたこと
${thought.beforeListen}
`;
			break;

		case "talk":
			middlePrompt = `
Aが新たに発言しました。現在Bが考えていたことを踏まえて、Bが発言した言葉を考えてください。
また、ツール呼び出しを行う必要がある場合は、ツール呼び出しを行ってください。
それ以外の文は出力しないでください。

# Bが以前に考えていたこと
${thought.beforeListen}

# Bが現在考えていたこと
${thought.beforeSpeak}
`;
			break;

		case "callTool":
			middlePrompt = `
Aが新たに発言しました。現在Bが考えていたことを踏まえて、Bが発言した言葉を考えてください。
また、ツール呼び出しを行う必要がある場合は、ツール呼び出しを行ってください。
それ以外の文は出力しないでください。

# Bが以前に考えていたこと
${thought.beforeListen}

# Bが現在考えていたこと
${thought.beforeSpeak}
`;
			break;

		case "afterSpeak":
			middlePrompt = `
Aが新たに発言しました。現在Bが考えていたことを踏まえて、Bが発言した言葉を考えてください。
また、ツール呼び出しを行う必要がある場合は、ツール呼び出しを行ってください。
それ以外の文は出力しないでください。

# Bが以前に考えていたこと
${thought.beforeListen}

# Bが現在考えていたこと
${thought.beforeSpeak}
`;
			break;
	}
	return templatePrompt(middlePrompt, activity.chatEvents.toString());
};

const templatePrompt = (middlePrompt: string, chatPrompt: string) => `
AはBの友達です。
AとBは一緒に通話をしており、その様子を配信しています。また、Aはプログラミングをしています。Bはその様子を見守っています。

${middlePrompt}

# よくある配信の傾向
- Bは視聴者のことを考えるのは二の次で全く問題ありません。BやAが楽しく会話することが一番です。
- 配信内容から全く違う話題に話題が逸れても問題ありません。
- Aは配信のプロなので、BはAの進行に従うことが重要です。

# 発言履歴
${chatPrompt}
`;
