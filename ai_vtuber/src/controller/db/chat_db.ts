import { type Chat, PrismaClient } from "@prisma/client";

export const insertChatDb = async (
	unixTime: number,
	who: string,
	message: string,
	point: boolean | undefined,
): Promise<Chat> => {
	const created = prismaClient.chat.create({
		data: {
			unixTime: BigInt(unixTime),
			who: who,
			message: message,
			point: point,
		},
	});
	return created;
};

export const deleteChatDb = async (unixTime: bigint): Promise<void> => {
	await prismaClient.chat.deleteMany({
		where: { unixTime: unixTime },
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
		where: { unixTime: BigInt(unixTime) },
		data: { point: true },
	});
};

const prismaClient = new PrismaClient();
