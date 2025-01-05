import type { Chat } from "@kikurage/nicolive-api";
import { NicoliveClient } from "@kikurage/nicolive-api/node";
import endpointJson from "../../endpoint.json";
import fetcher from "../lib/fetcher";
import { getLiveId } from "../lib/getLiveId";

const url = `http://${endpointJson.ai_vtuber.address}:${endpointJson.ai_vtuber.port}/chat`;

export const niconico = async (userId: string) => {
	const pageText = await fetcher(
		"https://live.nicovideo.jp/watch/user/" + userId,
	);
	const nowliveId = await getLiveId(pageText);

	new NicoliveClient({ liveId: nowliveId })
		.on("chat", async (chatMessage: Chat) => {
			console.log(chatMessage);
			const response = await fetch(url, {
				body: JSON.stringify({
					who: "viewer",
					chatText: chatMessage.content,
					unixTime: new Date().getTime(),
					point: false,
				}),
				method: "POST",
				headers: new Headers({ "Content-Type": "application/json" }),
			});
			if (response.status !== 200) {
				console.log(response);
			}
		})
		.on("simpleNotification", async (notification) => {
			const response = await fetch(url, {
				body: JSON.stringify({
					who: "announce",
					chatText: notification.message.value,
					unixTime: new Date().getTime(),
					point: false,
				}),
				method: "POST",
				headers: new Headers({ "Content-Type": "application/json" }),
			});
			if (response.status !== 200) {
				console.log(response);
			}
		})
		.on("changeState", async (state) => {
			const nusiCome = state.marque?.display?.operatorComment?.content;
			if (nusiCome) {
				const response = await fetch(url, {
					body: JSON.stringify({
						who: "fuguo",
						chatText: nusiCome,
						unixTime: new Date().getTime(),
						point: false,
					}),
					method: "POST",
					headers: new Headers({ "Content-Type": "application/json" }),
				});
				if (response.status !== 200) {
					console.log(response);
				}
			}
		})
		.connect();
};
