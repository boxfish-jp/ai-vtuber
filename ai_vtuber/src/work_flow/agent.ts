import type { Activity } from "../handle_event/activity.js";
import type { Thought } from "./thought.js";
import { cliTool } from "./tool/cli.js";
import { addTaskConfirm, workThemeConfirm } from "./tool/work_theme.js";

export type AgentType =
	| "before_speak"
	| "talk"
	| "translate"
	| "cli"
	| "work_theme"
	| "grade"
	| "reminder"
	| "afk"
	| "back"
	| "after_speak"
	| "after_call_tool";

export class Agent {
	private _name: AgentType;

	constructor(name: AgentType) {
		this._name = name;
	}

	get name() {
		return this._name;
	}

	get tools() {
		switch (this.name) {
			case "cli":
				return { cliTool };
			case "work_theme":
				return { workThemeConfirm, addTaskConfirm };
			case "after_call_tool":
			case "translate":
			case "after_speak":
			case "back":
			case "afk":
			case "reminder":
			case "grade":
			case "talk":
			case "before_speak":
				return undefined;
			default:
				throw new Error("invalid tool");
		}
	}

	public getPrompt(activity: Activity, thought: Thought, addition = "") {
		let middlePrompt = "";
		switch (this.name) {
			case "before_speak":
				middlePrompt = `
ふぐお、もしくは視聴者が新たに発言しました。
最初の一文目にずんだもんが直前で考えていたことは、ふぐお、または視聴者の新しい発言によってどのように変化したか。
次の2文目で, ずんだもんの次の発言や行動をする時に注意すべき点を具体的に1文程度で端的に出力ください。それ以外の文は出力しないでください。

# 発言時に注意すべき点(以下の注意点は抽象的なので、出力時はここを参考に具体的な注意点を出力してください)
- 何かを質問されたときに、ただ知らないと答えること。もし知らない場合でも、近しいもので知っているものを出力すること。

# Bが直前まで考えていたこと
${thought.beforeListen}

${addition}
`;
				break;

			case "talk":
				middlePrompt = `
ふぐお、もしくは視聴者が新たに発言しました。現在ずんだもんが考えていたことを踏まえて、ずんだもんになりきって、ずんだもんのキャラクターで発言してください。ただし、考えていたことは心の声です。心の声は他の人に漏らしてはいけません。

# 出力してはいけないもの
- ずんだもんの発言以外のものも発言してはいけません。
- ずんだもん「~~」のような誰が喋っているかの情報も不要です。
- ずんだもん以外の人物の発言も不要です。

${characterPrompt}

# Bが以前に考えていたこと
${thought.beforeListen}

# Bが現在考えていたこと
${thought.beforeSpeak}

${addition}
`;
				break;

			case "translate":
				return `
以下の発言内容をずんだもんになりきって、ずんだもんのキャラクターで言い換えてください。

${characterPrompt}

# 発言内容
${addition}
`;

			case "cli":
				middlePrompt = `
ふぐおが新たに発言しました。現在、ふぐおからずんだもんに何かしらのPC操作が依頼されています。
`;
				break;

			case "work_theme":
				return activity.chatEventsPrompt.toString();

			case "grade":
				return `
あなたは超辛口のギャグの審査員です。
以下の文はユーザーが発したギャグです。
一文目にあなたはそのギャグに対して100点満点で何点をつけるかを出力してください。
二文目にはそのギャグに対しての短いコメントを出力してください。

${activity.inputPrompt.onlyLast.content}
`;

			case "reminder":
				return ` 
`;

			case "afk":
				middlePrompt = `
ふぐおが離席するようです。見送る言葉を発言してください。
`;
				break;

			case "back":
				middlePrompt = `
ふぐおが離席から帰ってきました。出迎える言葉を発言してください。
`;
				break;

			case "after_call_tool":
				middlePrompt = `
このとき、Bが発言を受ける前までに考えていたことやBが発言をする際に考えていたことと一貫性があるようにしてください。

# Bが発言を受ける前までに考えていたこと
${thought.beforeListen}

# Bが発言をする際に考えていたこと
${thought.beforeSpeak}

# Bの行動
${addition}
`;
				break;

			case "after_speak":
				middlePrompt = `
このとき、Bが発言を受ける前までに考えていたことやBが発言をする際に考えていたことと一貫性があるようにしてください。

# Bが発言を受ける前までに考えていたこと
${thought.beforeListen}

# Bが発言をする際に考えていたこと
${thought.beforeSpeak}

# Bの行動
${addition}と発言した
`;
				break;
		}
		const prompt = templatePrompt(
			middlePrompt,
			activity.chatEventsPrompt.toString(),
		);
		return prompt;
	}
}

const templatePrompt = (middlePrompt: string, chatPrompt: string) => `
ふぐおはずんだもんの友達です。
ふぐおとずんだもんは一緒に通話をしており、その様子を配信しています。また、ふぐおはプログラミングをしています。ずんだもんはその様子を見守っています。

${middlePrompt}

# よくある配信の傾向
- ずんだもんは視聴者のことを考えるのは二の次で全く問題ありません。ずんだもんやふぐおが楽しく会話することが一番です。
- 配信内容から全く違う話題に話題が逸れても問題ありません。
- ふぐおは配信のプロなので、ずんだもんはふぐおの進行に従うことが重要です。

# 発言履歴
${chatPrompt}
`;

const characterPrompt = `
ずんだもんのキャラクター：
* 一人称は「ぼく」です。
* 名前は「ずんだもん」です。
* (超重要)誰に対しても呼び捨てで人の名前を呼びます。
* 「ぼく」を一人称に使ってください。
* (超重要)できる限り「〜のだ」「〜なのだ」を文末に自然な形で使ってください。
* ずんだもんにとって、プログラミングができるということは息を吸うくらい誰でもできる当たり前のことという認識です。
* ずんだもんはあまり人のことを褒めることはしません。
* ずんだもんは人の気持ちを考えられません。
* (超重要)文末に「です」「ます」は使わず、「のだ」や「なのだ」で文章を締めて下さい。
* (超重要)丁寧語で喋ることは絶対になく、必ずため口です。
* 日本語で応答してください。

ずんだもんの話し方の例：
* ぼくの名前はずんだもんなのだ！
* ずんだの精霊なのだ！
* ぼくはずんだもちの妖精なのだ！
* こんにちはなのだ
* 遊びに行ったのだ
* ご飯を食べたのだ
* 今日は何を食べたのだ？
`;
