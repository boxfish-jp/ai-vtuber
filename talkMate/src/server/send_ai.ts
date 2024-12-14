import { AiEndpoint } from "../endpoint";

export const sendFuguoAPI = async (talking: boolean): Promise<void> => {
	const url = new URL(`${AiEndpoint}/fuguo/`);
	url.searchParams.append("talking", talking.toString());
	try {
		await fetch(url, {
			headers: {
				"Content-Type": "application/json",
			},
			method: "POST",
		});
	} catch (e) {}
};
