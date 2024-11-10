import { talkMateEndpoint } from "@/endpoint";

export const fetchTalkMate = async (
	chatId: string,
	needScreenshot: boolean,
) => {
	const endpoint = `http://${talkMateEndpoint.ip}:${talkMateEndpoint.port}`;
	const endPointUrl = new URL(endpoint);
	endPointUrl.searchParams.append("id", chatId);
	endPointUrl.searchParams.append("screenshot", String(needScreenshot));
	const response = await fetch(endPointUrl.toString());
	if (!response.ok) {
		throw new Error(`Failed to fetch: ${response.statusText}`);
	}
};
