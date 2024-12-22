import { PrismaClient, type Chat } from "@prisma/client";

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

export const getLatestChatSection = async (): Promise<Chat[]> => {
	const maxPointId = await prismaClient.chat.findFirst({
		where: { point: true },
		orderBy: { id: "desc" },
		select: { id: true },
	});

	if (!maxPointId) {
		return [];
	}
	return await prismaClient.chat.findMany({
		where: {
			id: {
				gte: maxPointId.id,
			},
		},
	});
};

export const makeAsPointed = async (unixTime: number): Promise<void> => {
	await prismaClient.chat.updateMany({
		where: { unixTime: unixTime },
		data: { point: true },
	});
};

const prismaClient = new PrismaClient();
