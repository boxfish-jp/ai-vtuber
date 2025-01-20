import type { Activity } from "../../activity/activity.js";
import type { Agent, AgentResponse } from "../agent.js";

export class Afk implements Agent {
	async service(activity: Activity): Promise<AgentResponse> {
		return { text: "AFKモードになりました。", completed: true };
	}
}

let afk: Afk | undefined = undefined;
export const getAfk = (): Afk => {
	if (!afk) {
		afk = new Afk();
	}
	return afk;
};
