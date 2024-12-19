import { AiEndpoint } from "../endpoint";

export const sendAPI = async <T>(
	endpoint: string,
	params: Record<string, T> = {},
): Promise<void> => {
	const url = new URL(`${AiEndpoint}/${endpoint}/`);
	for (const key of Object.keys(params)) {
		url.searchParams.append(key, String(params[key]));
	}
	try {
		await fetch(url.toString(), {
			headers: {
				"Content-Type": "application/json",
			},
			method: "POST",
		});
	} catch (e) {
		console.error(`Error sending API request to ${endpoint}:`, e);
	}
};
