import { PrismaClient } from "@prisma/client";

export const insertChatDb = async (
	unixTime: number,
	who: string,
	message: string,
	point: boolean | undefined,
): Promise<void> => {
	await prismaClient.chat.create({
		data: {
			unixTime: unixTime,
			who: who,
			message: message,
			point: point,
		},
	});
};
const prismaClient = new PrismaClient();
