export interface ChatEvent {
	who: "ai" | "fuguo" | "viewer" | "info";
	content: string;
	unixTime: number;
	point: boolean;
}

export interface InstructionEvent {
	type: "talk" | "cli" | "work_theme" | "afk" | "back" | "grade" | "progress";
	unixTime: number | undefined;
	needScreenshot: boolean;
}
