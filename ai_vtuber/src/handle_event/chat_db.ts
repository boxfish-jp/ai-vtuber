import { type Chat, PrismaClient } from "@prisma/client";
import type { ChatEvent } from "./event.js";

export const insertChatDb = async (event: ChatEvent): Promise<Chat> => {
	const created = prismaClient.chat.create({
		data: {
			unixTime: BigInt(event.unixTime),
			who: event.who,
			message: event.content,
			point: event.point,
		},
	});
	return created;
};

export const deleteChatDb = async (unixTime: bigint): Promise<void> => {
	await prismaClient.chat.deleteMany({
		where: { unixTime: unixTime },
	});
};

export const getLatestChatSection = async (): Promise<ChatEvent[]> => {
	const maxPointId = await prismaClient.chat.findFirst({
		where: { point: true },
		orderBy: { id: "desc" },
		select: { id: true },
	});

	if (!maxPointId) {
		return [];
	}
	const chatData = await prismaClient.chat.findMany({
		where: {
			id: {
				gte: maxPointId.id,
			},
		},
	});
	return chatBigintToNumber(chatData);
};

export const makeAsPointed = async (
	unixTime: number | undefined,
): Promise<void> => {
	if (unixTime) {
		await prismaClient.chat.updateMany({
			where: { unixTime: BigInt(unixTime) },
			data: { point: true },
		});
		return;
	}
	const maxUnixTime = await prismaClient.chat.findFirst({
		orderBy: { unixTime: "desc" },
		select: { unixTime: true },
	});
	if (!maxUnixTime) {
		return;
	}
	await makeAsPointed(Number(maxUnixTime.unixTime));
};

const chatBigintToNumber = (chats: Chat[]): ChatEvent[] => {
	const events: ChatEvent[] = chats.map((chat) => {
		if (
			!(
				chat.who === "viewer" ||
				chat.who === "ai" ||
				chat.who === "info" ||
				chat.who === "fuguo"
			)
		) {
			throw new Error("Invalid who");
		}
		return {
			unixTime: Number(chat.unixTime),
			who: chat.who,
			point: chat.point,
			content: chat.message,
		};
	});
	return events;
};

const prismaClient = new PrismaClient();
