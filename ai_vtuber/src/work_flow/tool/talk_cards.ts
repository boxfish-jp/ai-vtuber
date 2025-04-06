import { StringOutputParser } from "@langchain/core/output_parsers";
import { Agent } from "../agent.js";
import { gemini } from "../model.js";

export class TalkCards {
	private _cards = [
		async () => "今日の天気はどうだったのだ？",
		async () => "お腹がすいたのだ",
		async () => "お腹いっぱいなのだ",
		async () => "今日は何時に寝るのだ？",
		async () => "今日は研究室に行ったのだ？",
		async () => "今日は何を食べたのだ？",
		async () => "今日の体調は良いのだ？",
		async () => "今日この後は何をするのだ？",
		async () => "今日は出かけたのだ？",
		async () => "今ハマっているアニメは何なのだ？",
		async () => "この壁紙は何なのだ？",
		async () => {
			const think = await this._think(Agent.getTalkCardsPrompt("requestThink"));
			return await this._think(Agent.getTalkCardsPrompt("request", think));
		},
		async () => {
			return await this._think(Agent.getTalkCardsPrompt("daily"));
		},
		async () => {
			return await this._think(Agent.getTalkCardsPrompt("hobby"));
		},
		async () => {
			return await this._think(Agent.getTalkCardsPrompt("futureThink"));
		},
	];

	public async getCard() {
		if (!this._cards.length) {
			return false;
		}
		const randomIndex = Math.floor(Math.random() * this._cards.length);
		const card = this._cards.splice(randomIndex, 1)[0];
		return await card();
	}

	private async _think(prompt: string) {
		const parser = new StringOutputParser();
		return await gemini.pipe(parser).invoke(prompt);
	}
}
