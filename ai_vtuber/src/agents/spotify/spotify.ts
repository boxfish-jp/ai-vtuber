import type { Activity } from "../../activity/activity.js";
import type { Agent, AgentResponse } from "../agent.js";

export class Spotify implements Agent {
	async getListteningSongName(): Promise<string> {
		return "I'm listening to the song";
	}

	async service(activity: Activity): Promise<AgentResponse> {
		return { text: "Spotifyで音楽を再生するよ", completed: true };
	}
}

let spotify: Spotify | undefined = undefined;

export const getSpotify = (): Spotify => {
	if (spotify === undefined) {
		spotify = new Spotify();
	}
	return spotify;
};
