import type { Activity } from "../../activity/activity.js";
import type { Agent, AgentResponse } from "../agent.js";

export class Reminder implements Agent {
	async service(activity: Activity): Promise<AgentResponse> {
		return { text: "リマインダーを設定します", completed: true };
	}
}

let reminder: Reminder | undefined = undefined;
export const getReminder = (): Reminder => {
	if (!reminder) {
		reminder = new Reminder();
	}
	return reminder;
};
