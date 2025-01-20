import type { Activity } from "../../activity/activity.js";
import type { Agent, AgentResponse } from "../agent.js";

export class Remineder implements Agent {
	async service(activity: Activity): Promise<AgentResponse> {
		return { text: "リマインダーを設定します", completed: true };
	}
}

let remineder: Remineder | undefined = undefined;
export const getRemineder = (): Remineder => {
	if (!remineder) {
		remineder = new Remineder();
	}
	return remineder;
};
