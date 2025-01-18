export const cleanLlmResponse = (text: string): string => {
	const oneLineText = text.replace(/[\r\n]+/g, "");
	if (/[。！？?.]$/.test(oneLineText)) {
		return oneLineText;
	}
	const isBroken = oneLineText.match(/.*[。！？?,]/);
	return isBroken ? isBroken[0] : oneLineText;
};
