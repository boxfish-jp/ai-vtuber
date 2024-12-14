import endpoint from "../../../endpoint.json";

export const createChatHistory = async (
	who: string,
	message: string,
	point: boolean,
): Promise<void> => {
	const url = new URL(
		`http://${endpoint.talkMate.ip}:${endpoint.talkMate.port}/message/`,
	);
	const requestBody = JSON.stringify({
		who,
		message,
		point,
	});

	const params = {
		headers: {
			"Content-Type": "application/json",
		},
		method: "POST",
		body: requestBody,
	};
	try {
		const response = await fetch(url, params);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
	} catch (e) {
		throw new Error(`Fetch error: ${e}`);
	}
};
