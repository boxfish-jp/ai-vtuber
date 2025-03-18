import { useEffect, useState } from "react";
import { Biim } from "./biim";
import { type WorkTheme, getSocketControler } from "./lib/socket";

export const App = () => {
	const [socketControler] = useState(getSocketControler);
	const [workTheme, setWorkTheme] = useState<WorkTheme>({
		main: "配信開始直後",
		sub: ["開始", "その次", "さらにその次"],
	});
	const [subtitle, setSubtitle] = useState<{
		content: string;
		timeout: NodeJS.Timeout | undefined;
	}>({
		content: "",
		timeout: undefined,
	});

	useEffect(() => {
		const chatRemove = socketControler.watchChat((chat) => {
			if (subtitle.timeout) {
				clearTimeout(subtitle.timeout);
			}
			setSubtitle({
				timeout: setTimeout(() => {
					setSubtitle({ content: "", timeout: undefined });
				}, 5000),
				content: chat.content,
			});
		});

		const workThemeRemove = socketControler.watchWorkTheme((workTheme) => {
			setWorkTheme(workTheme);
		});
		return () => {
			chatRemove();
			workThemeRemove();
		};
	}, [socketControler, subtitle]);

	return <Biim subtitle={subtitle.content} workTheme={workTheme} />;
};
