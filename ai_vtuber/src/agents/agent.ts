import type { Activity } from "../activity/activity.js";

export interface AgentResponse {
  text: string;
  completed: boolean;
}

export interface Agent {
  service(activity: Activity): Promise<AgentResponse>;
}
