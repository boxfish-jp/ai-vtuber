import { type Chat, PrismaClient } from ".prisma/client";

interface ChatStore {
	getLatestChat(): Promise<Chat | null>;
	getLatestClearedChat(): Promise<Chat | null>;
	getSessionChat(sessionRangeStartId: number): Promise<Chat[]>;
	getRecentChat(): Promise<Chat[]>;
	makeAsPointed(chatId: number): Promise<Chat>;
	createChat(
		who: string,
		message: string,
		point?: boolean | undefined,
	): Promise<Chat>;
}

class PrismaChatStore implements ChatStore {
	private readonly prisma: PrismaClient;

	constructor() {
		this.prisma = new PrismaClient();
	}

	async getLatestChat(): Promise<Chat | null> {
		return await this.prisma.chat.findFirst({
			orderBy: { id: "desc" },
		});
	}

	async getLatestClearedChat(): Promise<Chat | null> {
		return await this.prisma.chat.findFirst({
			where: { point: true },
			orderBy: { id: "desc" },
		});
	}

	async getSessionChat(sessionRangeStartId: number): Promise<Chat[]> {
		return await this.prisma.chat.findMany({
			where: { id: { gte: sessionRangeStartId } },
		});
	}

	async getRecentChat(): Promise<Chat[]> {
		const maxPointId = await this.prisma.chat.findFirst({
			where: { point: true },
			orderBy: { id: "desc" },
			select: { id: true },
		});

		if (!maxPointId) {
			return [];
		}
		return await this.prisma.chat.findMany({
			where: {
				id: {
					gte: maxPointId.id,
				},
			},
		});
	}

	async makeAsPointed(chatId: number): Promise<Chat> {
		return await this.prisma.chat.update({
			where: { id: chatId },
			data: { point: true },
		});
	}

	async createChat(
		who: string,
		message: string,
		point?: boolean | undefined,
	): Promise<Chat> {
		const chatPoint = point ?? false;
		return await this.prisma.chat.create({
			data: {
				who: who,
				message: message,
				point: chatPoint,
			},
		});
	}
}

let chatStore: ChatStore | null = null;
export const getChatStore = (): ChatStore => {
	if (!chatStore) {
		chatStore = new PrismaChatStore();
	}
	return chatStore;
};
