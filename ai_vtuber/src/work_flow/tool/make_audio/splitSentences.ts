export const splitSentences = (text: string) => {
	return text.split(/(?<=。|、|？|！)/);
};
