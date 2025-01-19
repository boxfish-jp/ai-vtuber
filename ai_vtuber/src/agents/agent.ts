import type { Activity } from "../activity/activity.js";

export interface Agent {
	service: (activity: Activity) => Promise<string>;
}
