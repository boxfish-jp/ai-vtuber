import { PrismaClient } from "@prisma/client";

export const insertChatDb = async (
	who: string,
	message: string,
	point: boolean | undefined,
): Promise<void> => {
	await prismaClient.chat.create({
		data: {
			who: who,
			message: message,
			point: point,
		},
	});
};
const prismaClient = new PrismaClient();
