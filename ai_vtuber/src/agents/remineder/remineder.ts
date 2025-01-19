import type { Activity } from "../../activity/activity.js";
import type { Agent } from "../agent.js";

export class Remineder implements Agent {
	async service(activity: Activity): Promise<string> {
		throw new Error("Method not implemented.");
	}
}

let remineder: Remineder | undefined = undefined;
export const getRemineder = (): Remineder => {
	if (!remineder) {
		remineder = new Remineder();
	}
	return remineder;
};
