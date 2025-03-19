export interface ChatEvent {
	who: "ai" | "fuguo" | "viewer" | "info";
	content: string;
	unixTime: number;
	point: boolean;
}

export interface InstructionEvent {
	type: "talk" | "work_theme" | "afk" | "back" | "grade";
	unixTime: number | undefined;
	needScreenshot: boolean;
}
