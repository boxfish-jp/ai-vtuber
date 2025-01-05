const fetcher = async (url: string) => {
	for (let i = 0; i < 5; i++) {
		try {
			const response = await fetch(url);
			const page = await response.text();
			return page;
		} catch (e) {
			console.log(e);
		}
		await new Promise((resolve) => setTimeout(resolve, 100));
	}
	throw new Error("Failed to fetch");
};

export default fetcher;
