import type { Activity } from "../../activity/activity.js";
import type { Agent, AgentResponse } from "../agent.js";

export class Afk implements Agent {
	private _leave = false;

	setLeave(leave: boolean): void {
		this._leave = leave;
	}

	async service(activity: Activity): Promise<AgentResponse> {
		if (this._leave) {
			return { text: "いってらっしゃい。", completed: true };
		}
		return { text: "おかえりなさい。", completed: true };
	}
}

let afk: Afk | undefined = undefined;
export const getAfk = (leave: boolean): Afk => {
	if (!afk) {
		afk = new Afk();
	}
	afk.setLeave(leave);
	return afk;
};
