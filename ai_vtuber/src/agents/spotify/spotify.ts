import type { Activity } from "../../activity/activity.js";
import type { Agent } from "../agent.js";

export class Spotify implements Agent {
	async getListteningSongName(): Promise<string> {
		return "I'm listening to the song";
	}

	async service(activity: Activity): Promise<string> {
		return "Spotifyで音楽を再生するよ";
	}
}

let spotify: Spotify | undefined = undefined;

export const getSpotify = (): Spotify => {
	if (spotify === undefined) {
		spotify = new Spotify();
	}
	return spotify;
};
