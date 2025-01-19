import type { Agent } from "../agent.js";

export class Afk implements Agent {
	async service(): Promise<string> {
		return "AFKモードになりました。";
	}
}

let afk: Afk | undefined = undefined;
export const getAfk = (): Afk => {
	if (!afk) {
		afk = new Afk();
	}
	return afk;
};
